import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, emptyProject, exampleProject, getProfile } from '../src/catalog.js';
import { LIMITS, type Cable, type Project } from '../src/model.js';
import { analyzeGraph, parseProject, validateConnection } from '../src/validation.js';
import { loadProject, saveProject, STORAGE_KEY } from '../src/storage.js';
import { patchRows } from '../src/print.js';

const link = (fromDevice: string, fromPort: string, toDevice: string, toPort: string): Omit<Cable, 'id'> => ({ fromDevice, fromPort, toDevice, toPort });

test('six authored profiles have valid unique ports and declared internal routes', () => {
  assert.equal(CATALOG.length, 6);
  assert.equal(new Set(CATALOG.map((profile) => profile.type)).size, 6);
  for (const profile of CATALOG) {
    assert.equal(new Set(profile.ports.map((port) => port.id)).size, profile.ports.length);
    for (const route of profile.routes) {
      assert.equal(profile.ports.find((port) => port.id === route.from)?.direction, 'input');
      assert.equal(profile.ports.find((port) => port.id === route.to)?.direction, 'output');
    }
    for (const source of profile.sourcePorts) assert.equal(profile.ports.find((port) => port.id === source)?.direction, 'output');
    for (const sink of profile.sinkPorts) assert.equal(profile.ports.find((port) => port.id === sink)?.direction, 'input');
  }
});

test('example is independently returned, parseable and resolved through USB conversion and mixer', () => {
  const graph = exampleProject();
  assert.deepEqual(parseProject(graph), graph);
  assert.deepEqual(analyzeGraph(graph), { resolved: true, issues: [] });
  graph.devices[0]!.label = 'Changed';
  assert.equal(exampleProject().devices[0]!.label, 'Presenter laptop');
});

test('empty and source-only graphs never claim a complete signal path', () => {
  assert.equal(analyzeGraph(emptyProject()).resolved, false);
  const sourceOnly = emptyProject();
  sourceOnly.devices.push({ id: 'source', type: 'laptop', label: 'Source' });
  assert.equal(analyzeGraph(sourceOnly).issues[0]?.code, 'NO_SINK');
});

test('wrong direction is explained and leaves original graph unchanged', () => {
  const graph = exampleProject();
  const before = JSON.stringify(graph);
  assert.equal(validateConnection(graph, link('projector-1', 'hdmi-in', 'laptop-1', 'hdmi-out')).code, 'DIRECTION');
  assert.equal(JSON.stringify(graph), before);
});

test('signal mismatch refuses a cable pretending to be an adapter', () => {
  const graph = exampleProject();
  const result = validateConnection(graph, link('laptop-1', 'hdmi-out', 'speaker-1', 'line-in'));
  assert.equal(result.code, 'SIGNAL_MISMATCH');
  assert.match(result.message, /cannot convert/);
});

test('duplicate, occupied input and output each identify the affected existing cable', () => {
  const graph = exampleProject();
  const duplicate = validateConnection(graph, link('laptop-1', 'hdmi-out', 'projector-1', 'hdmi-in'));
  assert.equal(duplicate.code, 'DUPLICATE');
  assert.equal(duplicate.cableId, 'C01');
  const occupied = validateConnection(graph, link('laptop-1', 'line-out', 'speaker-1', 'line-in'));
  assert.equal(occupied.code, 'OCCUPIED_INPUT');
  assert.equal(occupied.cableId, 'C04');
  graph.devices.push({ id: 'projector-2', type: 'projector', label: 'Second projector' });
  const fanout = validateConnection(graph, link('laptop-1', 'hdmi-out', 'projector-2', 'hdmi-in'));
  assert.equal(fanout.code, 'OCCUPIED_OUTPUT');
  assert.equal(fanout.cableId, 'C01');
});

test('unknown endpoints and self-connections fail closed', () => {
  const graph = exampleProject();
  assert.equal(validateConnection(graph, link('laptop-1', 'magic-adapter', 'projector-1', 'hdmi-in')).code, 'UNKNOWN_ENDPOINT');
  assert.equal(validateConnection(graph, link('mixer-1', 'line-out', 'mixer-1', 'line-in-2')).code, 'SELF_CONNECTION');
});

test('disconnecting upstream USB preserves compatible downstream cables but marks the speaker unresolved', () => {
  const graph = exampleProject();
  graph.cables = graph.cables.filter((cable) => cable.id !== 'C02');
  const result = analyzeGraph(graph);
  assert.equal(result.resolved, false);
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0]?.deviceId, 'speaker-1');
  assert.match(result.issues[0]!.message, /USB audio interface.*USB-B audio device in/);
  assert.equal(parseProject(graph).cables.length, 3);
});

test('either mixer input supplies output, without treating the unused input as required', () => {
  const graph = exampleProject();
  graph.cables.find((cable) => cable.id === 'C03')!.toPort = 'line-in-2';
  assert.equal(analyzeGraph(parseProject(graph)).resolved, true);
});

test('extractor enables both declared outputs only when its HDMI input has a source', () => {
  const graph = emptyProject();
  graph.devices = [{ id: 'l', type: 'laptop', label: 'Laptop' }, { id: 'e', type: 'extractor', label: 'Extractor' }, { id: 'p', type: 'projector', label: 'Projector' }, { id: 's', type: 'speaker', label: 'Speaker' }];
  graph.cables = [{ id: 'a', ...link('l', 'hdmi-out', 'e', 'hdmi-in') }, { id: 'b', ...link('e', 'hdmi-out', 'p', 'hdmi-in') }, { id: 'c', ...link('e', 'line-out', 's', 'line-in') }];
  assert.equal(analyzeGraph(parseProject(graph)).resolved, true);
  graph.cables.shift();
  assert.equal(analyzeGraph(graph).issues.length, 2);
});

test('a source-free cycle terminates and does not manufacture signal', () => {
  const graph = emptyProject();
  graph.devices = [{ id: 'a', type: 'extractor', label: 'A' }, { id: 'b', type: 'extractor', label: 'B' }, { id: 's', type: 'speaker', label: 'Speaker' }];
  graph.cables = [{ id: 'ab', ...link('a', 'hdmi-out', 'b', 'hdmi-in') }, { id: 'ba', ...link('b', 'hdmi-out', 'a', 'hdmi-in') }, { id: 'bs', ...link('b', 'line-out', 's', 'line-in') }];
  assert.equal(analyzeGraph(parseProject(graph)).resolved, false);
});

test('invalid direct cables cannot make analysis claim a signal route', () => {
  const graph = exampleProject();
  graph.cables = [{ id: 'bad', ...link('laptop-1', 'hdmi-out', 'speaker-1', 'line-in') }];
  const result = analyzeGraph(graph);
  assert.equal(result.resolved, false);
  assert.ok(result.issues.some((issue) => issue.code === 'SIGNAL_MISMATCH'));
});

test('parser rejects unknown schema, unknown profiles, duplicate IDs and impossible cables', () => {
  assert.throws(() => parseProject({ ...exampleProject(), schemaVersion: 2 }), /unsupported schema/);
  const unknown = exampleProject(); unknown.devices[0]!.type = 'universal-adapter';
  assert.throws(() => parseProject(unknown), /unknown profile/);
  const duplicate = exampleProject(); duplicate.devices.push({ ...duplicate.devices[0]! });
  assert.throws(() => parseProject(duplicate), /duplicated/);
  const wrong = exampleProject(); wrong.cables[0]!.toPort = 'line-in';
  assert.throws(() => parseProject(wrong), /invalid/);
  const duplicateCable = exampleProject(); duplicateCable.cables[1]!.id = 'C01';
  assert.throws(() => parseProject(duplicateCable), /duplicated/);
});

test('parser rejects prototype fields, control characters and oversized graphs, and returns independent objects', () => {
  const polluted: unknown = JSON.parse('{"schemaVersion":1,"catalogVersion":1,"title":"X","devices":[],"cables":[],"__proto__":{"polluted":true}}');
  assert.throws(() => parseProject(polluted), /unsupported fields/);
  assert.throws(() => parseProject({ ...emptyProject(), title: 'bad\u0000name' }), /readable characters/);
  assert.throws(() => parseProject({ ...emptyProject(), devices: Array.from({ length: LIMITS.devices + 1 }, (_, i) => ({ id: `d${i}`, type: 'laptop', label: 'Laptop' })) }), /at most 30/);
  const source = exampleProject(); const parsed = parseProject(source); parsed.devices[0]!.label = 'Independent';
  assert.equal(source.devices[0]!.label, 'Presenter laptop');
});

test('save/load roundtrip retains exact project IDs, labels and cables', () => {
  const saved = new Map<string, string>();
  const storage = { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => { saved.set(key, value); } };
  assert.equal(loadProject(storage), null);
  saveProject(exampleProject(), storage);
  assert.ok(saved.has(STORAGE_KEY));
  assert.deepEqual(loadProject(storage), exampleProject());
});

test('storage corruption or denial never reports success or rewrites the original data', () => {
  const raw = '{broken'; let writes = 0;
  assert.throws(() => loadProject({ getItem: () => raw }), /valid JSON/);
  assert.equal(raw, '{broken');
  assert.throws(() => loadProject({ getItem: () => 'x'.repeat(LIMITS.storedBytes + 1) }), /exceeds/);
  assert.throws(() => saveProject(exampleProject(), { setItem: () => { writes++; throw new Error('QuotaExceededError'); } }), /QuotaExceededError/);
  assert.equal(writes, 1);
  assert.throws(() => loadProject({ getItem: () => { throw new Error('SecurityError'); } }), /SecurityError/);
});

test('printed rows preserve exact order, stable IDs and literal special-character labels', () => {
  const graph = exampleProject(); graph.devices[0]!.label = '<img src=x onerror=alert(1)> & presenter';
  const rows = patchRows(graph);
  assert.deepEqual(rows.map((row) => row.id), graph.cables.map((cable) => cable.id));
  assert.equal(rows.length, 4);
  assert.equal(rows[0]?.from, '<img src=x onerror=alert(1)> & presenter · HDMI AV out');
  assert.equal(rows[1]?.signal, 'usb-audio');
  assert.equal(rows[3]?.to, 'Powered speaker · 3.5 mm stereo line in');
  graph.cables.pop();
  assert.equal(patchRows(graph).length, 3);
  assert.equal(analyzeGraph(graph).resolved, false);
});

test('cable limit and invalid save reject before writing', () => {
  const graph = exampleProject();
  graph.cables = Array.from({ length: LIMITS.cables }, () => ({ ...graph.cables[0]! }));
  assert.equal(validateConnection(graph, link('laptop-1', 'line-out', 'speaker-1', 'line-in')).code, 'CABLE_LIMIT');
  let wrote = false;
  assert.throws(() => saveProject({ ...emptyProject(), title: '' }, { setItem: () => { wrote = true; } }), /readable characters/);
  assert.equal(wrote, false);
});
