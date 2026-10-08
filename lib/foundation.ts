export type AreaId =
  | "quality"
  | "autonomy"
  | "work"
  | "body"
  | "social"
  | "inner";

export type AreaStatus = "red" | "base" | "growth";
export type Influence = "actionable" | "partly" | "blocked";
export type Effort = "tiny" | "small" | "deep";
export type TaskSource = "manual" | "auto";

export interface Area {
  id: AreaId;
  label: string;
  eyebrow: string;
  enabled: boolean;
  status: AreaStatus;
  influence: Influence;
  note: string;
  minimum: string;
}

export interface FoundationTask {
  id: string;
  areaId: AreaId;
  title: string;
  status: "open" | "done";
  effort: Effort;
  source: TaskSource;
  generatedKey?: string;
  createdAt: string;
  completedAt?: string;
  scheduledFor?: string;
}

export interface QuarterPlan {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  primaryAreaId: AreaId;
  secondaryAreaId?: AreaId;
  criteria: Array<{ id: string; label: string; done: boolean }>;
  guardrail: string;
}

export interface FoundationState {
  version: 1;
  areas: Area[];
  quarter: QuarterPlan;
  tasks: FoundationTask[];
  updatedAt: string;
}

export const areaOrder: AreaId[] = [
  "quality",
  "autonomy",
  "work",
  "body",
  "social",
  "inner",
];

function currentQuarter(now = new Date()) {
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const startMonth = (quarter - 1) * 3;
  const startsAt = new Date(Date.UTC(year, startMonth, 1))
    .toISOString()
    .slice(0, 10);
  const endsAt = new Date(Date.UTC(year, startMonth + 3, 0))
    .toISOString()
    .slice(0, 10);
  return { id: `${year}-Q${quarter}`, startsAt, endsAt };
}

const demoQuarter = currentQuarter();
const demoCreatedAt = new Date().toISOString();

export const defaultState: FoundationState = {
  version: 1,
  areas: [
    {
      id: "quality",
      label: "Energie & Alltag",
      eyebrow: "Energie & Alltag",
      enabled: true,
      status: "red",
      influence: "partly",
      note: "Der Alltag soll Energie geben und nicht nur Aufgaben enthalten.",
      minimum: "Jede Woche bleibt mindestens ein bewusst freier Abend.",
    },
    {
      id: "autonomy",
      label: "Raum & Autonomie",
      eyebrow: "Fokus & Freiheit",
      enabled: true,
      status: "growth",
      influence: "actionable",
      note: "Klare Zeit- und Raumgrenzen schaffen Platz für konzentrierte Arbeit.",
      minimum: "Zwei geschützte Fokusblöcke pro Woche.",
    },
    {
      id: "work",
      label: "Arbeit & Geld",
      eyebrow: "Wert & Rücklagen",
      enabled: true,
      status: "base",
      influence: "actionable",
      note: "Arbeit soll sichtbaren Wert schaffen und finanziell tragfähig sein.",
      minimum: "Jede Woche an einem real nutzbaren Ergebnis arbeiten.",
    },
    {
      id: "body",
      label: "Körper & Gesundheit",
      eyebrow: "Kraft & Präsenz",
      enabled: true,
      status: "base",
      influence: "actionable",
      note: "Bewegung, Schlaf und Regeneration tragen die anderen Bereiche.",
      minimum: "Zwei echte Trainingseinheiten pro Woche.",
    },
    {
      id: "social",
      label: "Menschen & Beziehungen",
      eyebrow: "Nähe & Gemeinschaft",
      enabled: true,
      status: "base",
      influence: "actionable",
      note: "Gute Beziehungen brauchen gemeinsame Zeit und eigene Initiative.",
      minimum: "Jede Woche eine bewusst gewählte soziale Gelegenheit.",
    },
    {
      id: "inner",
      label: "Reflexion & Richtung",
      eyebrow: "Denken & Ausrichtung",
      enabled: false,
      status: "base",
      influence: "blocked",
      note: "Dieser Bereich ist für das Demo-Quartal bewusst pausiert.",
      minimum: "Offene Fragen dürfen offen bleiben.",
    },
  ],
  quarter: {
    id: demoQuarter.id,
    title: "Mehr Fokus schaffen, ohne Erholung zu opfern",
    startsAt: demoQuarter.startsAt,
    endsAt: demoQuarter.endsAt,
    primaryAreaId: "autonomy",
    secondaryAreaId: "social",
    criteria: [
      { id: "clarity", label: "Zwei feste Fokusblöcke stehen jede Woche im Kalender", done: false },
      { id: "social", label: "Ein freier Abend pro Woche bleibt geschützt", done: false },
      { id: "guardrail", label: "Training und Schlaf bleiben mindestens auf Basis", done: false },
    ],
    guardrail: "Kein Ziel darf Schlaf, Gesundheit oder Alltag dauerhaft rot machen.",
  },
  tasks: [
    {
      id: "seed-autonomy-1",
      areaId: "autonomy",
      title: "Zwei Fokusblöcke für diese Woche im Kalender schützen",
      status: "open",
      effort: "tiny",
      source: "auto",
      generatedKey: `autonomy-focus-${demoQuarter.id}`,
      createdAt: demoCreatedAt,
    },
    {
      id: "seed-social-1",
      areaId: "social",
      title: "Eine gemeinsame Aktivität mit einer wichtigen Person planen",
      status: "open",
      effort: "small",
      source: "auto",
      generatedKey: `social-shared-time-${demoQuarter.id}`,
      createdAt: demoCreatedAt,
    },
    {
      id: "seed-body-1",
      areaId: "body",
      title: "Zwei feste Trainingsfenster für diese Woche eintragen",
      status: "open",
      effort: "tiny",
      source: "auto",
      generatedKey: `body-training-${demoQuarter.id}`,
      createdAt: demoCreatedAt,
    },
  ],
  updatedAt: demoCreatedAt,
};

export const suggestionLibrary: Record<AreaId, Array<{ title: string; effort: Effort; key: string }>> = {
  quality: [
    { title: "90 Minuten für etwas reservieren, auf das ich mich wirklich freue", effort: "small", key: "quality-anticipation" },
    { title: "Nach dem Abend kurz markieren: mehr, gleich viel oder weniger Energie", effort: "tiny", key: "quality-energy" },
  ],
  autonomy: [
    { title: "Eine Ablenkungsquelle aus dem Arbeitsbereich entfernen", effort: "tiny", key: "autonomy-space" },
    { title: "Für morgen einen klaren Start- und Feierabendpunkt festlegen", effort: "tiny", key: "autonomy-boundary" },
    { title: "Einen 60-minütigen Fokusblock ohne Benachrichtigungen testen", effort: "small", key: "autonomy-focus" },
  ],
  work: [
    { title: "90 Minuten an einem sichtbaren, real nutzbaren Produkt bauen", effort: "deep", key: "work-build" },
    { title: "Eine reale Person nach dem wichtigsten Problem in ihrem Betrieb fragen", effort: "small", key: "work-problem" },
  ],
  body: [
    { title: "Die nächste Trainingseinheit mit Uhrzeit festlegen", effort: "tiny", key: "body-next-session" },
    { title: "Eine Trainingseinheit ohne Zusatzprogramm abschließen", effort: "small", key: "body-session" },
  ],
  social: [
    { title: "Eine Person konkret auf Kaffee, Spaziergang oder eine Aktivität einladen", effort: "small", key: "social-invite" },
    { title: "In einem passenden Umfeld ein ehrliches Gespräch beginnen – die Reaktion ist nicht das Ziel", effort: "small", key: "social-conversation" },
  ],
  inner: [
    { title: "Notieren, welche Frage bewusst offen bleiben darf", effort: "tiny", key: "inner-open-question" },
  ],
};

export function effortPoints(effort: Effort) {
  return effort === "deep" ? 20 : effort === "small" ? 10 : 5;
}

export function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function newTask(
  areaId: AreaId,
  suggestion: { title: string; effort: Effort; key: string },
  quarterId: string,
): FoundationTask {
  return {
    id: crypto.randomUUID(),
    areaId,
    title: suggestion.title,
    status: "open",
    effort: suggestion.effort,
    source: "auto",
    generatedKey: `${suggestion.key}-${quarterId}`,
    createdAt: new Date().toISOString(),
  };
}

export function fillSuggestedTasks(state: FoundationState): FoundationState {
  const activeAreas = state.areas.filter((area) => area.enabled);
  const openTasks = state.tasks.filter(
    (task) => task.status === "open" && !task.scheduledFor,
  );
  if (openTasks.length >= 3) return state;

  const seenKeys = new Set(state.tasks.map((task) => task.generatedKey).filter(Boolean));
  const openAreas = new Set(openTasks.map((task) => task.areaId));
  const priority = [
    state.quarter.primaryAreaId,
    state.quarter.secondaryAreaId,
    ...activeAreas.filter((area) => area.status === "red").map((area) => area.id),
    "body" as AreaId,
    "quality" as AreaId,
    "work" as AreaId,
  ].filter(Boolean) as AreaId[];

  const uniquePriority = [...new Set(priority)];
  const additions: FoundationTask[] = [];
  for (const areaId of uniquePriority) {
    if (openTasks.length + additions.length >= 3) break;
    const area = activeAreas.find((item) => item.id === areaId);
    if (!area || openAreas.has(areaId) || additions.some((task) => task.areaId === areaId)) continue;
    const suggestion = suggestionLibrary[areaId].find(
      (item) => !seenKeys.has(`${item.key}-${state.quarter.id}`),
    );
    if (suggestion) additions.push(newTask(areaId, suggestion, state.quarter.id));
  }

  if (!additions.length) return state;
  return {
    ...state,
    tasks: [...state.tasks, ...additions],
    updatedAt: new Date().toISOString(),
  };
}
