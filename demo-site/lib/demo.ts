import { defaultState, fillSuggestedTasks, type FoundationState } from "./foundation.ts";

/** Synthetic public examples, freshly recreated on reset/reload; never persisted. */
export function createDemoState(): FoundationState {
  const state = structuredClone(defaultState);
  const completedAt = new Date(Date.now() - 86_400_000).toISOString();
  state.tasks = [
    { id: "demo-evidence-focus", areaId: "autonomy", title: "Einen Fokusblock ohne Benachrichtigungen ausprobiert", status: "done", effort: "small", source: "manual", createdAt: completedAt, completedAt },
    { id: "demo-evidence-body", areaId: "body", title: "Die nächste Bewegungspause fest eingeplant", status: "done", effort: "tiny", source: "manual", createdAt: completedAt, completedAt },
  ];
  return fillSuggestedTasks(state);
}
