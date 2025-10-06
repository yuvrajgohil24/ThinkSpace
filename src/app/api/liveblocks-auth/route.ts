export const runtime = "nodejs";

import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

import { auth, currentUser } from "@clerk/nextjs/server";

import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret:
    "sk_dev_scNY98vN1CX7rvgnslky1N8zGpMB_DLRSxWV0YU6WuvSQQBXKygSYQAxTDTuCOXL",
});

export async function POST(request: Request) {
  // Get the current user from your database
  const authorization = await auth();
  const user = await currentUser();

//   console.log("AUTH INFO", {
//     authorization,
//     user,
//   });

  if (!authorization || !user) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { room } = await request.json();

  const space = await convex.query(api.space.get, { id: room });

//   console.log("AUTH INFO", {
//     room,
//     space,
//     spaceOrgId: space?.orgId,
//     userOrgId: authorization.orgId,
//   });

  // if (space?.orgId !== authorization.orgId) {
  //   return new Response("Unauthorized", { status: 403 });
  // }

  const userInfo = {
    name: user.firstName || "Teammate",
    picture: user.imageUrl!,
  };

//   console.log({ userInfo });

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(user.id, { userInfo });

  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
//   console.log({ status, body }, "ALLOWED");
  return new Response(body, { status });
}
