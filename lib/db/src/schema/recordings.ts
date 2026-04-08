import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recordingsTable = pgTable("recordings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  audioUrl: text("audio_url").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  location: text("location").notNull(),
  authorName: text("author_name").notNull(),
  likes: integer("likes").notNull().default(0),
  durationSeconds: integer("duration_seconds"),
  photoUrl: text("photo_url"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRecordingSchema = createInsertSchema(recordingsTable).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordingsTable.$inferSelect;
