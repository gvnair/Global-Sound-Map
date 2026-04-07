import { Router, type IRouter } from "express";
import { sql, desc, eq } from "drizzle-orm";
import { db, recordingsTable } from "@workspace/db";
import {
  CreateRecordingBody,
  GetRecordingParams,
  DeleteRecordingParams,
  LikeRecordingParams,
  ListRecordingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recordings/stats/summary", async (req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalRecordings: sql<number>`count(*)::int`,
      totalLikes: sql<number>`coalesce(sum(${recordingsTable.likes}), 0)::int`,
    })
    .from(recordingsTable);

  const topLocationsRaw = await db
    .select({
      location: recordingsTable.location,
      count: sql<number>`count(*)::int`,
    })
    .from(recordingsTable)
    .groupBy(recordingsTable.location)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [{ recentCount }] = await db
    .select({ recentCount: sql<number>`count(*)::int` })
    .from(recordingsTable)
    .where(sql`${recordingsTable.createdAt} >= ${oneWeekAgo}`);

  res.json({
    totalRecordings: totals?.totalRecordings ?? 0,
    totalLikes: totals?.totalLikes ?? 0,
    topLocations: topLocationsRaw,
    recentCount: recentCount ?? 0,
  });
});

router.get("/recordings/featured", async (req, res): Promise<void> => {
  const recordings = await db
    .select()
    .from(recordingsTable)
    .orderBy(desc(recordingsTable.likes))
    .limit(10);

  res.json(recordings.map(serializeRecording));
});

router.get("/recordings/recent", async (req, res): Promise<void> => {
  const recordings = await db
    .select()
    .from(recordingsTable)
    .orderBy(desc(recordingsTable.createdAt))
    .limit(10);

  res.json(recordings.map(serializeRecording));
});

router.get("/recordings", async (req, res): Promise<void> => {
  const parsed = ListRecordingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const recordings = await db
    .select()
    .from(recordingsTable)
    .orderBy(desc(recordingsTable.createdAt));

  res.json(recordings.map(serializeRecording));
});

router.post("/recordings", async (req, res): Promise<void> => {
  const parsed = CreateRecordingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [recording] = await db
    .insert(recordingsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      audioUrl: parsed.data.audioUrl,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      location: parsed.data.location,
      authorName: parsed.data.authorName,
      durationSeconds: parsed.data.durationSeconds ?? null,
      tags: parsed.data.tags ?? [],
    })
    .returning();

  res.status(201).json(serializeRecording(recording));
});

router.get("/recordings/:id", async (req, res): Promise<void> => {
  const params = GetRecordingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [recording] = await db
    .select()
    .from(recordingsTable)
    .where(eq(recordingsTable.id, params.data.id));

  if (!recording) {
    res.status(404).json({ error: "Recording not found" });
    return;
  }

  res.json(serializeRecording(recording));
});

router.delete("/recordings/:id", async (req, res): Promise<void> => {
  const params = DeleteRecordingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(recordingsTable)
    .where(eq(recordingsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Recording not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/recordings/:id/like", async (req, res): Promise<void> => {
  const params = LikeRecordingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [recording] = await db
    .update(recordingsTable)
    .set({ likes: sql`${recordingsTable.likes} + 1` })
    .where(eq(recordingsTable.id, params.data.id))
    .returning();

  if (!recording) {
    res.status(404).json({ error: "Recording not found" });
    return;
  }

  res.json(serializeRecording(recording));
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
    tags: r.tags,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
