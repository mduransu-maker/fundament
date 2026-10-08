import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { FoundationState } from "@/lib/foundation";

export const foundationState = sqliteTable("foundation_state", {
  id: text("id").primaryKey(),
  state: text("state", { mode: "json" }).$type<FoundationState>().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
