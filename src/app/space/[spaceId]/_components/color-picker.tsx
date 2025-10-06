"use client";

import { rgbToHex } from "@/lib/utils";
import { Color } from "@/types/canvas";

interface ColorPickerProps {
    onChange: (color: Color) => void;
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
    return (
        <div className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200">
            <ColorButton onClick={onChange} color={{ r: 240, g: 82, b: 35 }} />   {/* Vibrant Orange */}
            <ColorButton onClick={onChange} color={{ r: 66, g: 133, b: 244 }} />  {/* Bright Blue */}
            <ColorButton onClick={onChange} color={{ r: 52, g: 168, b: 83 }} />   {/* Fresh Green */}
            <ColorButton onClick={onChange} color={{ r: 255, g: 214, b: 10 }} />  {/* Soft Yellow */}
            <ColorButton onClick={onChange} color={{ r: 155, g: 89, b: 182 }} />  {/* Medium Purple */}
            <ColorButton onClick={onChange} color={{ r: 26, g: 35, b: 126 }} />   {/* Deep Indigo */}
            <ColorButton onClick={onChange} color={{ r: 0, g: 150, b: 136 }} />   {/* Teal (mid-dark) */}
            <ColorButton onClick={onChange} color={{ r: 38, g: 50, b: 56 }} />    {/* Charcoal Gray */}
        </div>
    )
}

interface ColorButtonProps {
    onClick: (color: Color) => void;
    color: Color;
}

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
    return (
        <div>
            <button
                className="w-8 h-8 items-center flex justify-center hover:opacity-75 transition"
                onClick={() => onClick(color)}
            >
                <div
                    className="h-8 w-8 rounded-md border border-neutral-300"
                    style={{ background: rgbToHex(color) }}
                />
            </button >
        </div >
    )
}