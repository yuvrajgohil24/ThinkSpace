"use client";

import { Info } from "./info";
import { ActiveUsers } from "./activeUsers";
import { Toolbar } from "./toolbar";

interface CanvasProps {
    spaceId: string;
};

export const Canvas = ({ spaceId }: CanvasProps) => {
    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info />
            <ActiveUsers />
            <Toolbar />
        </main>
    )
}