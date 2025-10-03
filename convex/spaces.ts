import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";

import { query } from "./_generated/server";

export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized!");
    }

    if (args.favorites) {
      const favoritedSpaces = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", identity.subject).eq("orgId", args.orgId)
        )
        .order("desc")
        .collect();

      const ids = favoritedSpaces.map((s) => (s as any).spaceId);

      const spaces = await getAllOrThrow(ctx.db, ids);

      return spaces.map((space) => ({
        ...space,
        isFavorite: true,
      }));
    }

    const title = args.search as string;
    let spaces = [];

    if (title) {
      spaces = await ctx.db
        .query("spaces")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("orgId", args.orgId)
        )
        .collect();
    } else {
      spaces = await ctx.db
        .query("spaces")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .collect();
    }

    const spacesWithFavoriteRelations = spaces.map((space) => {
      return ctx.db
        .query("userFavorites")
        .withIndex("by_user_space", (q) =>
          q.eq("userId", identity.subject).eq("spaceId", space._id)
        )
        .unique()
        .then((favorite) => {
          return {
            ...space,
            isFavorite: !!favorite,
          };
        });
    });

    const spacesWithFavoriteBoolean = await Promise.all(
      spacesWithFavoriteRelations
    );

    return spacesWithFavoriteBoolean;
  },
});
