"use client";

import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

import { EmptySpaces } from "./empty-spaces";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";
import { SpaceCard } from "./space-card";
import { NewSpaceButton } from "./new-space-button";

interface ThinkSpaceListProps {
    orgId: string;
    query: {
        search?: string;
        favorites?: string;
    };
};

export const ThinkSpaceList = ({ orgId, query }: ThinkSpaceListProps) => {
    // const data = [];
    const data = useQuery(api.spaces.get, { orgId, ...query });

    console.log("DATA--->", data)

    if (data === undefined) {
        return (
            <div>
                <h2 className="text-3xl">
                    {query.favorites ? "Favorite spaces" : "Team spaces"}
                </h2>
                {/* {JSON.stringify(data)} */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                    <NewSpaceButton orgId={orgId} disabled />
                    <SpaceCard.Skeleton />
                    <SpaceCard.Skeleton />
                    <SpaceCard.Skeleton />
                    <SpaceCard.Skeleton />
                    <SpaceCard.Skeleton />
                    <SpaceCard.Skeleton />
                </div>
            </div>
        )
    }

    if (!data?.length && query.search) {
        return (
            <EmptySearch />
        );
    };

    if (!data?.length && query.favorites) {
        return (
            <EmptyFavorites />
        );
    };

    if (!data?.length) {
        return (
            <EmptySpaces />
        )
    }

    return (
        <div>
            <h2 className="text-3xl">
                {query.favorites ? "Favorite spaces" : "Team spaces"}
            </h2>
            {/* {JSON.stringify(data)} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                <NewSpaceButton orgId={orgId} />
                {data?.map((space) => (
                    <SpaceCard
                        key={space._id}
                        id={space._id}
                        title={space.title}
                        imageUrl={space.imageUrl}
                        authorId={space.authorId}
                        authorName={space.authorName}
                        createdAt={space._creationTime}
                        orgId={space.orgId}
                        isFavorite={space.isFavorite}
                    />
                ))}
            </div>
        </div>
    )
}