"use client";

import { memo } from "react";

import { Cursor } from "./cursor";

import { useOthersConnectionIds } from "@liveblocks/react";

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

export const CursorsPresence = memo(() => {

    return (
        <>
          <Cursors />
        </>
    )
});

CursorsPresence.displayName = "CursorsPresence"