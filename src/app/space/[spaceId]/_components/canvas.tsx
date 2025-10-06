"use client";

import { useCallback, useMemo, useState } from "react";

import { nanoid } from "nanoid";

import { Info } from "./info";
import { ActiveUsers } from "./activeUsers";
import { CursorsPresence } from "./active-cursors";
import { Toolbar } from "./toolbar";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";

import { LiveObject } from "@liveblocks/client";
import { useCanRedo, useCanUndo, useHistory, useMutation, useOthersMapped, useStorage } from "@liveblocks/react";
import { Camera, CanvasMode, CanvasState, Color, direction_and_size, LayerType, Point, Side } from "@/types/canvas";
import { connectionIdToColor, pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";

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
    const [lastColor, SetLastColor] = useState<Color>({ r: 0, g: 0, b: 0 });

    const layerIds = useStorage((root) => root.layerIds);

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
        } else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point);
        } else {
            setCanvasState({
                mode: CanvasMode.None
            });
        }

        history.resume();
    }, [camera, canvasState, history, insertLayer, unselectedLayers]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Inserting) {
            return;
        }

        // Add case for drawing

        setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    }, [camera, canvasState.mode, setCanvasState]);

    const onPointerMove = useMutation(({ setMyPresence }, e: React.PointerEvent) => {
        e.preventDefault();

        // const current = { x: 0, y: 0 }
        const current = pointerEventToCanvasPoint(e, camera);

        // <---------------------- CanvasMode === TRANSLATING -------------------------->
        if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers(current)
        }

        //<----------------------- CanvasMode === RESIZING ----------------------------->
        else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current);
        }

        setMyPresence({ cursor: current });
    }, [canvasState, resizeSelectedLayer, camera]);

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
                    <CursorsPresence />
                </g>
            </svg>
        </main>
    )
}