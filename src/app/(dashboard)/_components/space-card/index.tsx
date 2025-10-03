"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@clerk/nextjs";
import { MoreHorizontal } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { SpaceActions } from "@/components/actions";
import { useApiMutation } from "@/hooks/use-api-mutation";

import { Overlay } from "./overlay";
import { Footer } from "./footer";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useMutation } from "convex/react";

interface SpaceCardProps {
    id: string;
    title: string;
    authorName: string;
    authorId: string;
    createdAt: number;
    imageUrl: string;
    orgId: string;
    isFavorite: boolean;
}

export const SpaceCard = ({ id, title, authorName, authorId, createdAt, imageUrl, orgId, isFavorite }: SpaceCardProps) => {
    const { userId } = useAuth();

    const authorLabel = userId === authorId ? "You" : authorName;
    const createdAtLabel = formatDistanceToNow(createdAt, {
        addSuffix: true
    })

    // const handleFavorite = useMutation(api.space.favorite);
    // const handleUnFavorite = useMutation(api.space.unFavorite);

    const {
        mutate: onFavorite,
        pending: pendingFavorite
    } = useApiMutation(api.space.favorite);
    const {
        mutate: onUnfavorite,
        pending: pendingUnfavorite
    } = useApiMutation(api.space.unFavorite);

    const toggleFavorite = () => {
        if (isFavorite) {
            onUnfavorite({ id }).catch(() => toast.error("Failed to unfavorite"))
        } else {
            onFavorite({ id, orgId }).catch(() => toast.error("Failed to favorite"))
        }
    };

    return (
        <Link href={`/space/${id}`}>
            <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 bg-violet-50">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-fit"
                    />
                    <Overlay />
                    <SpaceActions id={id} title={title} side="right">
                        <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity py-2 px-3 outline-none">
                            <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
                        </button>
                    </SpaceActions>
                </div>
                <Footer
                    isFavorite={isFavorite}
                    title={title}
                    authorLabel={authorLabel}
                    createdAtLabel={createdAtLabel}
                    onClick={toggleFavorite}
                    disabled={pendingFavorite || pendingUnfavorite}
                />
            </div>
        </Link>
    )
}

SpaceCard.Skeleton = function SpaceCardSkeleton() {
    return (
        <div className="aspect-[100/127] rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
        </div>
    );
};