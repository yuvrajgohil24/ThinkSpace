"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { nanoid } from "nanoid";

import { Info } from "./info";
import { ActiveUsers } from "./activeUsers";
import { CursorsPresence } from "./active-cursors";
import { Toolbar } from "./toolbar";
import { LayerPreview } from "./layers/layer-preview";
import { SelectionBox } from "./selection-box";
import { Path } from "./layers/path-layer";
import { SelectionTools } from "./selection-tools";

import { LiveObject } from "@liveblocks/client";
import { useCanRedo, useCanUndo, useHistory, useMutation, useOthersMapped, useSelf, useStorage } from "@liveblocks/react";
import { Camera, CanvasMode, CanvasState, Color, direction_and_size, LayerType, Point, Side } from "@/types/canvas";
import { connectionIdToColor, findIntersectingLayersWithRectangle, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds, rgbToHex } from "@/lib/utils";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeletedLayers } from "@/hooks/use-delete-layers";

interface CanvasProps {
    spaceId: string;
};

const MAXIMUM_LAYERS = 100;

export const Canvas = ({ spaceId }: CanvasProps) => {
    // const info = useSelf((me) => me.info)

    // console.log(info)
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    });
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [lastColor, setLastColor] = useState<Color>({ r: 0, g: 0, b: 0 });

    const layerIds = useStorage((root) => root.layerIds);
    const pencilDraft = useSelf((me) => me.presence.pencilDraft);

    useDisableScrollBounce();
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const insertLayer = useMutation((
        { storage, setMyPresence },
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Note | LayerType.Text,
        position: Point,
    ) => {
        const liveLayers = storage.get("layers");
        if (liveLayers.size >= MAXIMUM_LAYERS) {
            return;
        }

        const liveLayerIds = storage.get("layerIds")
        const layerId = nanoid();
        const layer = new LiveObject({
            type: layerType,
            x: position.x,
            y: position.y,
            height: 100,
            width: 100,
            fill: lastColor
        });

        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setCanvasState({ mode: CanvasMode.None });
    }, [lastColor]);

    // <---------------- TRANSLATING THE SELECTED LAYERS ---------------->
    const translateSelectedLayers = useMutation(({ storage, self }, point: Point) => {
        if (canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y,
        }

        const liveLayers = storage.get("layers");

        for (const id of self.presence.selection) {
            const layer = liveLayers.get(id)

            if (layer) {
                layer.update({
                    x: layer.get("x") + offset.x,
                    y: layer.get("y") + offset.y
                })
            }
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point });
    }, [canvasState])


    // <---------------- RESIZE THE SELECTED LAYERS --------------------->
    const resizeSelectedLayer = useMutation(({ storage, self }, point: Point) => {
        if (canvasState.mode !== CanvasMode.Resizing) {
            return;
        }

        const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);

        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0]);

        if (layer) {
            layer.update(bounds);
        };
    }, [canvasState]);

    // <---------------- UNSELECT THE SELECTED LAYERS --------------------->
    const unselectedLayers = useMutation(({ self, setMyPresence }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);

    // <---------------- SELECTION NET FOR THE LAYERS --------------------->
    const updateSelectionNet = useMutation((
        { storage, setMyPresence },
        current: Point,
        origin: Point
    ) => {
        const layers = storage.get("layers").toImmutable();
        setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });

        const ids = findIntersectingLayersWithRectangle(layerIds!, layers, origin, current);

        setMyPresence({ selection: ids });
    }, [layerIds]);

    const startMultiSelection = useCallback((current: Point, origin: Point) => {

        // Here 5 is threshold value
        if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
            console.log("ATTEMPTING TO SELCTION NET")
            setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });
        }
    }, []);

    // <---------------- DRAWING ON CANVAS USING PENCIL --------------------->
    const startDrawing = useMutation((
        { setMyPresence },
        point: Point,
        pressure: number
    ) => {
        setMyPresence({
            pencilDraft: [[point.x, point.y, pressure]],
            penColor: lastColor
        })
    }, [lastColor]);

    const continueDrawing = useMutation((
        { self, setMyPresence },
        point: Point,
        e: React.PointerEvent
    ) => {
        const { pencilDraft } = self.presence;

        if (canvasState.mode !== CanvasMode.Pencil || e.buttons !== 1 || pencilDraft == null) {
            return;
        }

        setMyPresence({
            cursor: point,
            pencilDraft:
                pencilDraft.length === 1 &&
                    pencilDraft[0][0] === point.x &&
                    pencilDraft[0][1] === point.y
                    ? pencilDraft
                    : [...pencilDraft, [point.x, point.y, e.pressure]],
        })
    }, [canvasState.mode]);

    const insertPath = useMutation((
        { storage, self, setMyPresence }
    ) => {
        const liveLayers = storage.get("layers");
        const { pencilDraft } = self.presence;

        if (pencilDraft == null || pencilDraft.length < 2 || liveLayers.size >= MAXIMUM_LAYERS) {
            setMyPresence({
                pencilDraft: null
            });
            return;
        }

        const id = nanoid();
        liveLayers.set(
            id,
            new LiveObject(penPointsToPathLayer(
                pencilDraft, lastColor
            ))
        );

        const liveLayerIds = storage.get("layerIds");
        liveLayerIds.push(id);

        setMyPresence({ pencilDraft: null });
        setCanvasState({ mode: CanvasMode.Pencil });
    }, [lastColor]);

    const onLayerPointerDown = useMutation((
        { self, setMyPresence },
        e: React.PointerEvent,
        layerId: string
    ) => {
        // When we are inserting or drawing something. So, no selections are made at that time
        if (canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting) {
            return;
        }

        history.pause();
        e.stopPropagation();

        const point = pointerEventToCanvasPoint(e, camera);

        if (!self.presence.selection.includes(layerId)) {
            setMyPresence({ selection: [layerId] }, { addToHistory: true });
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point });
    }, [setCanvasState, camera, history, canvasState.mode]);

    const onWheel = useCallback((e: React.WheelEvent) => {

        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
        }));
    }, []);

    const onPointerUp = useMutation(({ }, e) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
            unselectedLayers();

            setCanvasState({ mode: CanvasMode.None })
        }
        else if (canvasState.mode === CanvasMode.Pencil) {
            insertPath();
        }
        else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point);
        } else {
            setCanvasState({
                mode: CanvasMode.None
            });
        }

        history.resume();
    }, [camera, canvasState, history, insertLayer, unselectedLayers, insertPath, setCanvasState]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Inserting) {
            return;
        }

        // Add case for drawing
        if (canvasState.mode === CanvasMode.Pencil) {
            // console.log("Drawing");
            startDrawing(point, e.pressure);
            return;
        }

        setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    }, [camera, canvasState.mode, setCanvasState, startDrawing]);

    const onPointerMove = useMutation(({ setMyPresence }, e: React.PointerEvent) => {
        e.preventDefault();

        // const current = { x: 0, y: 0 }
        const current = pointerEventToCanvasPoint(e, camera);

        // <---------------------- CanvasMode === PRESSING -------------------------->
        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(current, canvasState.origin);
        }
        // <---------------------- CanvasMode === SELECTION-NET -------------------------->
        else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(current, canvasState.origin)
        }

        // <---------------------- CanvasMode === TRANSLATING -------------------------->
        else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers(current)
        }

        //<----------------------- CanvasMode === RESIZING ----------------------------->
        else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current);
        }

        //<----------------------- CanvasMode === PENCIL ----------------------------->
        else if (canvasState.mode === CanvasMode.Pencil) {
            continueDrawing(current, e);
        }

        setMyPresence({ cursor: current });
    }, [canvasState, resizeSelectedLayer, camera, continueDrawing, startMultiSelection, updateSelectionNet, translateSelectedLayers]);

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, []);

    // <------------ RESIZING FUNCTIONALITY ----------->

    const onResizeHandlePointerDown = useCallback((corner: Side, initialBounds: direction_and_size) => {
        // console.log({ corner, initialBounds })
        history.pause();
        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner
        });
    }, [history]);

    const selections = useOthersMapped((otherUser) => otherUser.presence.selection);

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of selections) {
            const [connectionId, selection] = user;

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
            }
        }

        return layerIdsToColorSelection;
    }, [selections])

    // <---------------------- ADDING KEYBOARD SHORTCUTS-------------------------->
    const deleteLayers = useDeletedLayers();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            switch (e.key) {
                case "Delete":
                    deleteLayers();
                    break;
                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else {
                            history.undo();
                        }
                        break;
                    }
                }
            }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        }
    }, [deleteLayers, history])

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info spaceId={spaceId} />
            <ActiveUsers />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canRedo={canRedo}
                canUndo={canUndo}
                undo={history.undo}
                redo={history.redo}
            />
            <SelectionTools
                camera={camera}
                setLastColor={setLastColor}
            />
            <svg
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                onPointerDown={onPointerDown}
            >
                <g style={{
                    transform: `translate(${camera.x}px, ${camera.y}px)`
                }}>
                    {layerIds?.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                        <rect
                            className="fill-blue-500/5 stroke-blue-500 stroke-1"
                            x={Math.min(canvasState.origin.x, canvasState.current?.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current?.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />
                    )}
                    <CursorsPresence />
                    {pencilDraft != null && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={rgbToHex(lastColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    )
}