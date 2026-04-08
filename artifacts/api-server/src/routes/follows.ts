import { Router, type IRouter } from "express";
import { eq, and, inArray, desc } from "drizzle-orm";
import { db, followsTable, recordingsTable } from "@workspace/db";
import {
  GetFeedQueryParams,
  ListFollowsQueryParams,
  FollowUserBody,
  UnfollowUserBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feed", async (req, res): Promise<void> => {
  const parsed = GetFeedQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { followerName } = parsed.data;

  const follows = await db
    .select({ followingName: followsTable.followingName })
    .from(followsTable)
    .where(eq(followsTable.followerName, followerName));

  if (follows.length === 0) {
    res.json([]);
    return;
  }

  const followingNames = follows.map((f) => f.followingName);

  const recordings = await db
    .select()
    .from(recordingsTable)
    .where(inArray(recordingsTable.authorName, followingNames))
    .orderBy(desc(recordingsTable.createdAt));

  res.json(recordings.map(serializeRecording));
});

router.get("/follows", async (req, res): Promise<void> => {
  const parsed = ListFollowsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const follows = await db
    .select()
    .from(followsTable)
    .where(eq(followsTable.followerName, parsed.data.followerName))
    .orderBy(desc(followsTable.createdAt));

  res.json(
    follows.map((f) => ({
      id: f.id,
      followerName: f.followerName,
      followingName: f.followingName,
      createdAt: f.createdAt.toISOString(),
    }))
  );
});

router.post("/follows", async (req, res): Promise<void> => {
  const parsed = FollowUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { followerName, followingName } = parsed.data;

  if (followerName === followingName) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }

  const [existing] = await db
    .select()
    .from(followsTable)
    .where(
      and(
        eq(followsTable.followerName, followerName),
        eq(followsTable.followingName, followingName)
      )
    );

  if (existing) {
    res.status(201).json({
      id: existing.id,
      followerName: existing.followerName,
      followingName: existing.followingName,
      createdAt: existing.createdAt.toISOString(),
    });
    return;
  }

  const [follow] = await db
    .insert(followsTable)
    .values({ followerName, followingName })
    .returning();

  res.status(201).json({
    id: follow.id,
    followerName: follow.followerName,
    followingName: follow.followingName,
    createdAt: follow.createdAt.toISOString(),
  });
});

router.post("/follows/unfollow", async (req, res): Promise<void> => {
  const parsed = UnfollowUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { followerName, followingName } = parsed.data;

  await db
    .delete(followsTable)
    .where(
      and(
        eq(followsTable.followerName, followerName),
        eq(followsTable.followingName, followingName)
      )
    );

  res.sendStatus(204);
});

function serializeRecording(r: typeof recordingsTable.$inferSelect) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    audioUrl: r.audioUrl,
    latitude: r.latitude,
    longitude: r.longitude,
    location: r.location,
    authorName: r.authorName,
    likes: r.likes,
    durationSeconds: r.durationSeconds,
    photoUrl: r.photoUrl ?? null,
    tags: r.tags,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
