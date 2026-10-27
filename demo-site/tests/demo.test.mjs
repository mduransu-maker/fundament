import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaultState, fillSuggestedTasks } from '../lib/foundation.ts';
import { createDemoState } from '../lib/demo.ts';

test('fresh demo state is isolated and reset discards edits', () => {
  const before = structuredClone(defaultState);
  const first = createDemoState();
  first.areas[0].note = 'A visitor changed this';
  first.quarter.criteria[0].done = true;
  first.tasks[0].title = 'Visitor edit';
  const reset = createDemoState();
  assert.deepEqual(defaultState, before);
  assert.notEqual(reset.areas[0].note, first.areas[0].note);
  assert.equal(reset.quarter.criteria[0].done, false);
  assert.notEqual(reset.tasks[0].title, first.tasks[0].title);
});

test('actual suggestion model gives three active-area actions and keeps evidence', () => {
  const state = createDemoState();
  const open = state.tasks.filter(task => task.status === 'open');
  assert.equal(open.length, 3);
  assert.ok(open.every(task => state.areas.some(area => area.id === task.areaId && area.enabled)));
  assert.equal(state.tasks.filter(task => task.status === 'done').length, 2);
  assert.deepEqual(fillSuggestedTasks(state), state);
});

test('completion preserves evidence and creates a distinct replacement action', () => {
  const state = createDemoState();
  const original = state.tasks.find(task => task.status === 'open');
  original.status = 'done';
  original.completedAt = new Date().toISOString();
  const next = fillSuggestedTasks(state);
  assert.equal(next.tasks.filter(task => task.status === 'open').length, 3);
  assert.equal(next.tasks.find(task => task.id === original.id).status, 'done');
  assert.equal(new Set(next.tasks.map(task => task.generatedKey).filter(Boolean)).size,
    next.tasks.filter(task => task.generatedKey).length);
});

test('paused areas produce no new suggested actions', () => {
  const state = structuredClone(defaultState);
  state.areas.forEach(area => area.enabled = false);
  state.tasks = [];
  assert.equal(fillSuggestedTasks(state).tasks.length, 0);
});

test('public client has no persistence/auth/API and disallows network connections', () => {
  const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|\/api\/|registerTool\(/);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(page, /Nur Beispieldaten/);
});
