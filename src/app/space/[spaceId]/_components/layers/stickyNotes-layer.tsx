import { Kalam } from "next/font/google";

import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { NoteLayer } from "@/types/canvas";
import { useMutation } from "@liveblocks/react";
import { cn, getContrastingTextColor, rgbToHex } from "@/lib/utils";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"]
});

interface NoteLayerProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
};

const calcFontSize = (width: number, height: number) => {
    const maxFontSize = 100;
    const scaleFactor = 0.15;
    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;

    return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);
}

export const Note = ({ id, layer, onPointerDown, selectionColor }: NoteLayerProps) => {
    const { x, y, width, height, fill, value } = layer;

    const updateValue = useMutation(({ storage }, newValue: string) => {
        const liveLayers = storage.get("layers");
        liveLayers.get(id)?.set("value", newValue);
    }, []);

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    };


    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `1px solid ${selectionColor}` : "none",
                backgroundColor: fill ? rgbToHex(fill) : "#000"
            }}
            className="shadow-md drop-shadow-xl"
        >
            <ContentEditable
                className={cn("h-full w-full flex items-center justify-center text-center outline-none", font.className)}
                style={{
                    fontSize: calcFontSize(width, height),
                    color: fill ? getContrastingTextColor(fill) : "#000",
                }}
                html={value || "Text"}
                onChange={handleContentChange}
            />

        </foreignObject>
    )
}

