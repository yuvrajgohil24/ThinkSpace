"use client";

import { useQuery } from "convex/react";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { SpaceActions } from "@/components/actions";
import { Button } from "@/components/ui/button";
import { useRenameModal } from "@/store/use-rename-modal";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface InfoProps {
    spaceId: string;
}

const font = Poppins({
    subsets: ["latin"],
    weight: ["400"],
})

export const Separator = () => {
    return (
        <div className="text-neutral-100 px-1.5">
            |
        </div>
    )
}

export const Info = ({ spaceId }: InfoProps) => {

    const { onOpen } = useRenameModal();

    const data = useQuery(api.space.get, {
        id: spaceId as Id<"spaces">,
    })

    if (!data) {
        return <InfoSkeleton />
    }

    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
            <Hint label="Go to Boards" side="bottom" sideOffset={4}>
                <Button asChild variant={"space"} className="px-2 cursor-pointer">
                    <Link href={"/"}>
                        <Image
                            src={"/logo.svg"}
                            alt="Logo"
                            height={160}
                            width={160}
                        />
                    </Link>
                </Button>
            </Hint>
            <Separator />
            <Hint label="Edit the title" side="bottom" sideOffset={4} >
                <Button variant={"space"} className={cn("text-base font-normal px-2", font.className)} onClick={() => onOpen(data?._id, data.title)}>
                    {data.title}
                </Button>
            </Hint>
            <Separator />
            <SpaceActions id={data._id} title={data.title} side="bottom" sideOffset={4}>
                <div>
                    <Hint label="Main menu" side="bottom" sideOffset={4}>
                        <Button size={"icon"} variant={"space"}>
                            <Menu />
                        </Button>
                    </Hint>
                </div>
            </SpaceActions>
        </div>
    )
}

export const InfoSkeleton = () => {
    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]" />
    )
}