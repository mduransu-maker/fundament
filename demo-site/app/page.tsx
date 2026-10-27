"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleGauge,
  Dumbbell,
  Home,
  LoaderCircle,
  MoreHorizontal,
  Orbit,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultState,
  effortPoints,
  fillSuggestedTasks,
  localDate,
  type Area,
  type AreaId,
  type AreaStatus,
  type Effort,
  type FoundationState,
} from "@/lib/foundation";

import { createDemoState } from "@/lib/demo";

const areaIcons: Record<AreaId, LucideIcon> = {
  quality: Sparkles,
  autonomy: Home,
  work: BriefcaseBusiness,
  body: Dumbbell,
  social: Users,
  inner: Orbit,
};

const statusMeta: Record<AreaStatus, { label: string; className: string; tone: string }> = {
  red: { label: "Rot", className: "status-red", tone: "Instabil" },
  base: { label: "Basis", className: "status-base", tone: "Trägt" },
  growth: { label: "Aufbau", className: "status-growth", tone: "Wächst" },
};

const effortLabels: Record<Effort, string> = {
  tiny: "10–15 Min",
  small: "30–60 Min",
  deep: "Deep Work",
};

function todayOrEarlier(value?: string) {
  return !value || value <= localDate();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function daysUntil(value: string) {
  const end = new Date(`${value}T23:59:59`);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
}

export default function HomePage() {
  const [state, setState] = useState<FoundationState>(defaultState);
  const stateRef = useRef(state);
  const [loaded, setLoaded] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<AreaId | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskArea, setTaskArea] = useState<AreaId>("autonomy");
  const [taskEffort, setTaskEffort] = useState<Effort>("small");

  const commit = useCallback((updater: (current: FoundationState) => FoundationState) => {
    setState((current) => {
      const updated = fillSuggestedTasks({
        ...updater(current),
        updatedAt: new Date().toISOString(),
      });
      stateRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    const next = createDemoState();
    stateRef.current = next;
    setState(next);
    setLoaded(true);
  }, []);

  function resetDemo() {
    const next = createDemoState();
    stateRef.current = next;
    setState(next);
    setSelectedAreaId(null);
    setTaskDialogOpen(false);
    setTaskTitle("");
  }

  const activeAreas = useMemo(() => state.areas.filter((area) => area.enabled), [state.areas]);
  const pausedCount = state.areas.length - activeAreas.length;
  const redCount = activeAreas.filter((area) => area.status === "red").length;
  const baseCount = activeAreas.filter((area) => area.status === "base").length;
  const growthCount = activeAreas.filter((area) => area.status === "growth").length;
  const selectedArea = state.areas.find((area) => area.id === selectedAreaId) ?? null;

  const todayTasks = useMemo(() => {
    const score = (areaId: AreaId) => {
      if (areaId === state.quarter.primaryAreaId) return 30;
      if (areaId === state.quarter.secondaryAreaId) return 20;
      return state.areas.find((item) => item.id === areaId)?.status === "red" ? 14 : 5;
    };
    return state.tasks
      .filter((task) => task.status === "open" && todayOrEarlier(task.scheduledFor))
      .sort((a, b) => score(b.areaId) - score(a.areaId))
      .slice(0, 3);
  }, [state]);

  const evidence = useMemo(
    () => state.tasks
      .filter((task) => task.status === "done" && task.completedAt)
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
      .slice(0, 6),
    [state.tasks],
  );

  const momentum = useMemo(() => {
    const cutoff = Date.now() - 28 * 86_400_000;
    return state.tasks
      .filter((task) => task.completedAt && new Date(task.completedAt).getTime() >= cutoff)
      .reduce((sum, task) => sum + effortPoints(task.effort), 0);
  }, [state.tasks]);

  const criteriaDone = state.quarter.criteria.filter((criterion) => criterion.done).length;
  const criteriaProgress = (criteriaDone / state.quarter.criteria.length) * 100;

  function updateArea(areaId: AreaId, patch: Partial<Area>) {
    commit((current) => ({
      ...current,
      areas: current.areas.map((area) => area.id === areaId ? { ...area, ...patch } : area),
    }));
  }

  function completeTask(taskId: string) {
    commit((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status: "done", completedAt: new Date().toISOString() } : task,
      ),
    }));
  }

  function shrinkTask(taskId: string) {
    commit((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId && !task.title.startsWith("10 Minuten:")
          ? { ...task, title: `10 Minuten: ${task.title}`, effort: "tiny" }
          : task,
      ),
    }));
  }

  function snoozeTask(taskId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    commit((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? { ...task, scheduledFor: localDate(tomorrow) } : task),
    }));
  }

  function removeTask(taskId: string) {
    commit((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) }));
  }

  function addTask() {
    if (!taskTitle.trim()) return;
    commit((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: crypto.randomUUID(),
          areaId: taskArea,
          title: taskTitle.trim(),
          effort: taskEffort,
          source: "manual",
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setTaskTitle("");
    setTaskDialogOpen(false);
  }

  if (!loaded) {
    return (
      <main className="loading-screen">
        <div className="loading-mark"><LoaderCircle className="animate-spin" /></div>
        <p>Dein Fundament wird geladen.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><Building2 /></div>
          <div><p className="brand-name">Fundament</p><p className="brand-sub">Intentional Life System</p></div>
        </div>
        <div className="topbar-center">
          <span>{state.quarter.id.replace("-", " · ")} · {daysUntil(state.quarter.endsAt)} Tage</span><span className="topbar-line" /><span>{state.quarter.title}</span>
        </div>
        <div className="demo-controls">
          <span className="demo-pill"><ShieldCheck /> Interaktive Demo</span>
          <Button variant="outline" size="sm" onClick={resetDemo}><RotateCcw /> Zurücksetzen</Button>
        </div>
      </header>
      <div className="demo-notice" role="note">
        <span><strong>Probier es aus.</strong> Aufgaben erledigen, Fokus wechseln und Bereiche anpassen.</span>
        <span>Nur Beispieldaten. Änderungen bleiben in diesem Tab und werden beim Neuladen verworfen.</span>
      </div>

      <div className="dashboard-wrap">
        <section className="overview-grid" aria-label="Übersicht">
          <div className="foundation-panel panel-surface">
            <div className="section-heading">
              <div><p className="eyebrow">Deine Basis</p><h1>Was trägt. Was wackelt. Was wächst.</h1></div>
              <div className="status-summary" aria-label="Statuszusammenfassung">
                <span><i className="dot dot-red" />{redCount} instabil</span>
                <span><i className="dot dot-base" />{baseCount} tragen</span>
                <span><i className="dot dot-growth" />{growthCount} wachsen</span>
                {pausedCount > 0 && <span><i className="dot dot-paused" />{pausedCount} pausiert</span>}
              </div>
            </div>

            <div className="foundation-map">
              <div className="map-axis axis-x" aria-hidden="true" />
              <div className="map-axis axis-y" aria-hidden="true" />
              <div className="areas-grid">
                {state.areas.map((area, index) => {
                  const Icon = areaIcons[area.id];
                  const meta = statusMeta[area.status];
                  return (
                    <button
                      key={area.id}
                      type="button"
                      className={`area-segment ${area.enabled ? meta.className : "status-paused"}`}
                      onClick={() => setSelectedAreaId(area.id)}
                      aria-label={`${area.label}: ${area.enabled ? meta.label : "Pausiert"}. Einstellungen öffnen.`}
                    >
                      <span className="segment-index">0{index + 1}</span>
                      <span className="segment-icon"><Icon /></span>
                      <span className="segment-copy"><small>{area.eyebrow}</small><strong>{area.label}</strong></span>
                      <span className="segment-status">{area.enabled ? meta.tone : "Pausiert"}<ArrowUpRight /></span>
                    </button>
                  );
                })}
              </div>
              <div className="map-core" aria-hidden="true"><span>{activeAreas.length}</span><small>aktive<br />Bereiche</small></div>
            </div>
            <p className="foundation-note">Kein Gesamtscore. Ein Bereich darf wachsen, während die anderen zuverlässig tragen.</p>
          </div>

          <aside className="mission-panel panel-surface" aria-label="Quartalsmission">
            <div className="mission-orbit" aria-hidden="true"><span>{criteriaDone}/{state.quarter.criteria.length}</span></div>
            <p className="eyebrow">Quartalsmission</p>
            <h2>{state.quarter.title}</h2>
            <div className="focus-selects">
              <label>
                <span>Hauptfokus</span>
                <Select value={state.quarter.primaryAreaId} onValueChange={(value) => commit((current) => ({ ...current, quarter: { ...current.quarter, primaryAreaId: value as AreaId } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{activeAreas.map((area) => <SelectItem key={area.id} value={area.id}>{area.label}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <label>
                <span>Nebenfokus</span>
                <Select value={state.quarter.secondaryAreaId ?? "none"} onValueChange={(value) => commit((current) => ({ ...current, quarter: { ...current.quarter, secondaryAreaId: value === "none" ? undefined : value as AreaId } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keiner</SelectItem>
                    {activeAreas.filter((area) => area.id !== state.quarter.primaryAreaId).map((area) => <SelectItem key={area.id} value={area.id}>{area.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
            </div>

            <Progress value={criteriaProgress} className="mission-progress" />
            <div className="criteria-list">
              {state.quarter.criteria.map((criterion) => (
                <button type="button" key={criterion.id} className={criterion.done ? "criterion done" : "criterion"} onClick={() => commit((current) => ({
                  ...current,
                  quarter: { ...current.quarter, criteria: current.quarter.criteria.map((item) => item.id === criterion.id ? { ...item, done: !item.done } : item) },
                }))}>
                  <span className="criterion-check">{criterion.done && <Check />}</span>{criterion.label}
                </button>
              ))}
            </div>
            <div className="guardrail"><ShieldCheck /><p><span>Schutzgrenze</span>{state.quarter.guardrail}</p></div>
          </aside>
        </section>

        <section className="action-grid">
          <div className="tasks-section">
            <div className="section-heading action-heading">
              <div><p className="eyebrow">Heute</p><h2>Drei echte Züge</h2></div>
              <Button className="add-task-button" onClick={() => setTaskDialogOpen(true)}><Plus /> Aufgabe</Button>
            </div>

            <div className="task-list">
              {todayTasks.map((task, index) => {
                const area = state.areas.find((item) => item.id === task.areaId)!;
                const Icon = areaIcons[task.areaId];
                return (
                  <article className="task-row" key={task.id}>
                    <button type="button" className="complete-task" onClick={() => completeTask(task.id)} aria-label={`Erledigen: ${task.title}`}>
                      <span>{index + 1}</span><Check />
                    </button>
                    <div className="task-icon"><Icon /></div>
                    <div className="task-copy">
                      <div className="task-meta"><span>{area.label}</span><i /><span>{effortLabels[task.effort]}</span>{task.source === "auto" && <em><WandSparkles /> Vorschlag</em>}</div>
                      <h3>{task.title}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Aufgabenmenü"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => shrinkTask(task.id)}><CircleGauge /> Kleiner machen</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => snoozeTask(task.id)}><RotateCcw /> Auf morgen</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => removeTask(task.id)}><Trash2 /> Entfernen</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </article>
                );
              })}
              {todayTasks.length === 0 && <div className="empty-tasks"><ShieldCheck /><div><h3>Für heute steht nichts offen.</h3><p>Neue Aufgaben entstehen erst, wenn sie einen echten Zweck haben.</p></div></div>}
            </div>
          </div>

          <aside className="evidence-panel panel-surface">
            <div className="evidence-head">
              <div><p className="eyebrow">Letzte 28 Tage</p><h2>Beweisspur</h2></div>
              <div className="momentum-number"><span>{momentum}</span><small>Momentum</small></div>
            </div>
            <div className="momentum-track" aria-label={`${momentum} Momentumpunkte`}>
              {Array.from({ length: 12 }).map((_, index) => <span key={index} className={index < Math.min(12, Math.ceil(momentum / 10)) ? "active" : ""} />)}
            </div>
            <p className="evidence-explainer">Keine Streak. Echte Schritte bleiben bestehen, auch nach einer Pause.</p>
            <div className="evidence-list">
              {evidence.map((task) => {
                const area = state.areas.find((item) => item.id === task.areaId)!;
                return <div key={task.id} className="evidence-item"><span className="evidence-dot"><Check /></span><p>{task.title}<small>{area.label} · {formatDate(task.completedAt!)}</small></p></div>;
              })}
              {evidence.length === 0 && <div className="evidence-empty"><Target /><p>Dein erster erledigter Schritt beginnt die Spur.</p></div>}
            </div>
          </aside>
        </section>
      </div>

      <Sheet open={Boolean(selectedArea)} onOpenChange={(open) => !open && setSelectedAreaId(null)}>
        <SheetContent className="area-sheet">
          {selectedArea && <>
            <SheetHeader className="area-sheet-header">
              <div className="sheet-icon">{(() => { const Icon = areaIcons[selectedArea.id]; return <Icon />; })()}</div>
              <p className="eyebrow">Bereich einstellen</p>
              <SheetTitle>{selectedArea.label}</SheetTitle>
              <SheetDescription>Du entscheidest den Status. Punkte verändern ihn niemals automatisch.</SheetDescription>
            </SheetHeader>
            <div className="sheet-body">
              <div className="setting-row">
                <div><strong>Bereich aktiv</strong><span>Pausiert erzeugt keine Aufgaben und keine Bewertung.</span></div>
                <Switch checked={selectedArea.enabled} onCheckedChange={(checked) => updateArea(selectedArea.id, { enabled: checked })} aria-label={`${selectedArea.label} aktivieren`} />
              </div>
              {selectedArea.enabled && <>
                <div className="setting-block">
                  <label>Status</label>
                  <div className="status-choice" role="group" aria-label="Bereichsstatus">
                    {(["red", "base", "growth"] as AreaStatus[]).map((status) => <button type="button" key={status} className={selectedArea.status === status ? `selected ${status}` : status} onClick={() => updateArea(selectedArea.id, { status })}>{statusMeta[status].label}</button>)}
                  </div>
                </div>
                <div className="setting-block">
                  <label htmlFor="influence">Einfluss</label>
                  <Select value={selectedArea.influence} onValueChange={(value) => updateArea(selectedArea.id, { influence: value as Area["influence"] })}>
                    <SelectTrigger id="influence" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="actionable">Direkt beeinflussbar</SelectItem><SelectItem value="partly">Teilweise beeinflussbar</SelectItem><SelectItem value="blocked">Durch Umstände blockiert</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="setting-block"><label htmlFor="area-note">Was ist gerade wahr?</label><Textarea id="area-note" value={selectedArea.note} onChange={(event) => updateArea(selectedArea.id, { note: event.target.value })} /></div>
                <div className="setting-block"><label htmlFor="area-minimum">Was wäre gut genug?</label><Textarea id="area-minimum" value={selectedArea.minimum} onChange={(event) => updateArea(selectedArea.id, { minimum: event.target.value })} /></div>
                <Button variant="outline" className="w-full" onClick={() => commit((current) => ({ ...current, quarter: { ...current.quarter, primaryAreaId: selectedArea.id } }))}><Target /> Als Hauptfokus setzen</Button>
              </>}
            </div>
          </>}
        </SheetContent>
      </Sheet>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="task-dialog">
          <DialogHeader><p className="eyebrow">Eigener Schritt</p><DialogTitle>Konkrete Aufgabe hinzufügen</DialogTitle><DialogDescription>Ein sichtbarer nächster Schritt. Keine neue Pflichtliste.</DialogDescription></DialogHeader>
          <div className="dialog-fields">
            <label><span>Aufgabe</span><Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Was verändert real etwas?" onKeyDown={(event) => event.key === "Enter" && addTask()} /></label>
            <div className="dialog-grid">
              <label><span>Bereich</span><Select value={taskArea} onValueChange={(value) => setTaskArea(value as AreaId)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{activeAreas.map((area) => <SelectItem key={area.id} value={area.id}>{area.label}</SelectItem>)}</SelectContent></Select></label>
              <label><span>Größe</span><Select value={taskEffort} onValueChange={(value) => setTaskEffort(value as Effort)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tiny">10–15 Minuten</SelectItem><SelectItem value="small">30–60 Minuten</SelectItem><SelectItem value="deep">Deep Work</SelectItem></SelectContent></Select></label>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setTaskDialogOpen(false)}>Abbrechen</Button><Button onClick={addTask} disabled={!taskTitle.trim()}><Plus /> Hinzufügen</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
