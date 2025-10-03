import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  spaces: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
  })
    .index("by_org", ["orgId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["orgId"],
    }),

  userFavorites: defineTable({
    orgId: v.string(),
    userId: v.string(),
    spaceId: v.string(),
  })
    .index("by_space", ["spaceId"])
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_space", ["userId", "spaceId"])
    .index("by_user_space_org", ["userId", "spaceId", "orgId"]),
});
