import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { foundationState } from "@/db/schema";

const areaIdSchema = z.enum([
  "quality",
  "autonomy",
  "work",
  "body",
  "social",
  "inner",
]);

const foundationStateSchema = z.object({
  version: z.literal(1),
  areas: z.array(z.object({
    id: areaIdSchema,
    label: z.string().trim().min(1).max(80),
    eyebrow: z.string().trim().min(1).max(80),
    enabled: z.boolean(),
    status: z.enum(["red", "base", "growth"]),
    influence: z.enum(["actionable", "partly", "blocked"]),
    note: z.string().max(800),
    minimum: z.string().max(800),
  })).min(1).max(12),
  quarter: z.object({
    id: z.string().trim().min(1).max(40),
    title: z.string().trim().min(1).max(180),
    startsAt: z.string().date(),
    endsAt: z.string().date(),
    primaryAreaId: areaIdSchema,
    secondaryAreaId: areaIdSchema.optional(),
    criteria: z.array(z.object({
      id: z.string().trim().min(1).max(60),
      label: z.string().trim().min(1).max(240),
      done: z.boolean(),
    })).max(8),
    guardrail: z.string().max(500),
  }),
  tasks: z.array(z.object({
    id: z.string().trim().min(1).max(100),
    areaId: areaIdSchema,
    title: z.string().trim().min(1).max(240),
    status: z.enum(["open", "done"]),
    effort: z.enum(["tiny", "small", "deep"]),
    source: z.enum(["manual", "auto"]),
    generatedKey: z.string().max(160).optional(),
    createdAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    scheduledFor: z.string().date().optional(),
  })).max(2_000),
  updatedAt: z.string().datetime(),
});

function stateId(request: NextRequest) {
  const userId = request.headers.get("oai-authenticated-user-id");
  return userId ? `user:${userId}` : "local-demo";
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(foundationState)
      .where(eq(foundationState.id, stateId(request)))
      .limit(1);
    return NextResponse.json({ state: rows[0]?.state ?? null });
  } catch (error) {
    console.error("Unable to load foundation state", error);
    return NextResponse.json(
      { error: "Der gespeicherte Stand ist gerade nicht erreichbar." },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = foundationStateSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: "Ungültiger Stand." }, { status: 400 });
    }
    const state = result.data;

    const serializedSize = JSON.stringify(state).length;
    if (serializedSize > 750_000) {
      return NextResponse.json({ error: "Der Stand ist zu groß." }, { status: 413 });
    }

    const db = getDb();
    const updatedAt = new Date();
    await db
      .insert(foundationState)
      .values({ id: stateId(request), state, updatedAt })
      .onConflictDoUpdate({
        target: foundationState.id,
        set: { state, updatedAt },
      });

    return NextResponse.json({ ok: true, updatedAt: updatedAt.toISOString() });
  } catch (error) {
    console.error("Unable to save foundation state", error);
    return NextResponse.json(
      { error: "Der Stand konnte gerade nicht gespeichert werden." },
      { status: 503 },
    );
  }
}
