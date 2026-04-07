import { pgTable, text, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const followsTable = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerName: text("follower_name").notNull(),
    followingName: text("following_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.followerName, table.followingName)]
);

export const insertFollowSchema = createInsertSchema(followsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof followsTable.$inferSelect;
