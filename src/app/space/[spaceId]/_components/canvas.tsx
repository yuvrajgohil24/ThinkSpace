"use client";

import { Info } from "./info";
import { ActiveUsers } from "./activeUsers";
import { Toolbar } from "./toolbar";

import { useSelf } from "@liveblocks/react";

interface CanvasProps {
    spaceId: string;
};

export const Canvas = ({ spaceId }: CanvasProps) => {
    // const info = useSelf((me) => me.info)

    // console.log(info)
    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info spaceId={spaceId} />
            <ActiveUsers />
            <Toolbar />
        </main>
    )
}