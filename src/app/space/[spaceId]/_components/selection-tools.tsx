"use client";

import { memo } from "react";
import { useMutation, useSelf } from "@liveblocks/react";

import { ColorPicker } from "./color-picker";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

import { BringToFront, SendToBack, Trash2 } from "lucide-react";

import { Camera, Color } from "@/types/canvas";
import { useDeletedLayers } from "@/hooks/use-delete-layers";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";

interface SelectionToolsProps {
    camera: Camera;
    setLastColor: (color: Color) => void;
}

export const SelectionTools = memo(({ camera, setLastColor }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);

    // <-------------- SEND THE LAYER TO THE BACK -------------->    
    const moveToBack = useMutation(({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const temp = liveLayerIds.toImmutable();

        for (let i = 0; i < temp.length; i++) {
            if (selection?.includes(temp[i])) {
                indices.push(i);
            }
        }

        for (let i = 0; i < indices.length; i++) {
            liveLayerIds.move(indices[i], i);
        }
    }, [selection]);

    // <-------------- SEND THE LAYER TO THE FRONT -------------->    
    const moveToFront = useMutation(({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const temp = liveLayerIds.toImmutable();

        for (let i = 0; i < temp.length; i++) {
            if (selection?.includes(temp[i])) {
                indices.push(i);
            }
        }

        for (let i = indices.length - 1; i >= 0; i--) {
            liveLayerIds.move(indices[i], temp.length - 1 - (indices.length - 1 - i));
        }
    }, [selection]);

    // <-------------- CHANGE THE COLOR OF THE SHAPE -------------->    
    const setFill = useMutation(({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        setLastColor(fill);

        selection?.forEach((id) => {
            liveLayers.get(id)?.set("fill", fill);
        })

    }, [selection, setLastColor]);

    // <----------------- DELETE THE LAYER ----------------->
    const deleteLayers = useDeletedLayers();

    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) {
        return null;
    }

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;


    return (
        <div
            className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
            style={{
                transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`
            }}
        >
            <ColorPicker
                onChange={setFill}
            />
            <div className="flex flex-col gap-0.5">
                <Hint label="Bring to front" side="top">
                    <Button variant={"space"} size={"icon"} onClick={moveToFront}>
                        <BringToFront />
                    </Button>
                </Hint>
                <Hint label="Send to back" side="bottom">
                    <Button variant={"space"} size={"icon"} onClick={moveToBack}>
                        <SendToBack />
                    </Button>
                </Hint>
            </div>
            <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
                <Hint label="Delete">
                    <Button variant={"space"} size={"icon"} onClick={deleteLayers} className="cursor-pointer">
                        <Trash2 />
                    </Button>
                </Hint>
            </div>
        </div>
    )
})

SelectionTools.displayName = "SelectionTools";