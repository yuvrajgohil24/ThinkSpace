"use client";

import { useCallback, useState } from "react";

import { Info } from "./info";
import { ActiveUsers } from "./activeUsers";
import { CursorsPresence } from "./active-cursors";
import { Toolbar } from "./toolbar";

import { useCanRedo, useCanUndo, useHistory, useMutation } from "@liveblocks/react";
import { Camera, CanvasMode, CanvasState } from "@/types/canvas";
import { pointerEventToCanvasPoint } from "@/lib/utils";

interface CanvasProps {
    spaceId: string;
};

export const Canvas = ({ spaceId }: CanvasProps) => {
    // const info = useSelf((me) => me.info)

    // console.log(info)
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    });
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const onWheel = useCallback((e: React.WheelEvent) => {

        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
        }));
    }, []);

    const onPointerMove = useMutation(({ setMyPresence }, e: React.PointerEvent) => {
        e.preventDefault();

        // const current = { x: 0, y: 0 }
        const current = pointerEventToCanvasPoint(e, camera);



        setMyPresence({ cursor: current });
    }, []);

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, []);

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
            >
                <g>
                    <CursorsPresence />
                </g>
            </svg>
        </main>
    )
}