"use client";

import { memo } from "react";

import { Cursor } from "./cursor";

import { shallow, useOthersConnectionIds, useOthersMapped } from "@liveblocks/react";
import { rgbToHex } from "@/lib/utils";
import { Path } from "./layers/path-layer";

const Cursors = () => {
    const ids = useOthersConnectionIds();

    return (
        <>
            {ids.map((connId) => (
                <Cursor
                    key={connId}
                    connectionId={connId}
                />
            ))}
        </>
    )
}

const Drafts = () => {
    const others = useOthersMapped((other) => ({
        pencilDraft: other.presence.pencilDraft,
        penColor: other.presence.penColor
    }), shallow);

    return (
        <>
            {others.map(([key, other]) => {
                if (other.pencilDraft) {
                    return (
                        <Path
                            key={key}
                            x={0}
                            y={0}
                            points={other.pencilDraft}
                            fill={other.penColor ? rgbToHex(other.penColor) : "#000"}
                        />
                    );
                };

                return null;
            })}
        </>
    )
}

export const CursorsPresence = memo(() => {

    return (
        <>
            <Drafts />
            <Cursors />
        </>
    )
});

CursorsPresence.displayName = "CursorsPresence"