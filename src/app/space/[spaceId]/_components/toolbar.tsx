import { Skeleton } from "@/components/ui/skeleton"
import { ToolButton } from "./tool-button"

import { Circle, MousePointer2, Pencil, Redo2, Square, StickyNote, Type, Undo2 } from "lucide-react"

export const Toolbar = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
            <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
                <ToolButton label="Select" icon={MousePointer2} onClick={() => { }} isActive={false} isDisabled={false} />
                <ToolButton label="Text" icon={Type} onClick={() => { }} isActive={false} isDisabled={false} />
                <ToolButton label="Sticky note" icon={StickyNote} onClick={() => { }} isActive={false} isDisabled={false} />
                <ToolButton label="Rectangle" icon={Square} onClick={() => { }} isActive={false} isDisabled={false} />
                <ToolButton label="Ellipse" icon={Circle} onClick={() => { }} isActive={false} isDisabled={false} />
                <ToolButton label="Pen" icon={Pencil} onClick={() => { }} isActive={false} isDisabled={false} />
            </div>

            <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
                <ToolButton label="Undo" icon={Undo2} onClick={() => {}} isDisabled={true} isActive={false} />
                <ToolButton label="Redo" icon={Redo2} onClick={() => {}} isDisabled={true} isActive={false} />
            </div>
        </div>
    )
}

export const ToolbarSkeleton = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white rounded-md h-[360px] w-[55px] shadow-md" />
    )
}