import { CATALOG, getProfile, exampleProject, emptyProject } from './catalog.js';
import type { Project, Cable } from './model.js';
import { validateConnection, analyzeGraph } from './validation.js';
import { loadProject, saveProject } from './storage.js';
import { patchRows } from './print.js';

type Notice = { message: string; kind: 'info' | 'good' | 'error' | 'warn' };
const app = document.querySelector<HTMLElement>('#app')!;
const announcer = document.querySelector<HTMLElement>('#announcer')!;
let project: Project = exampleProject();
let dirty = true;
let saved = false;
let selectedDevice = '';
let selectedCable = '';
let fromValue = '';
let toValue = '';
let rejected: Omit<Cable, 'id'> | null = null;
let notice: Notice = { message: 'Example loaded. Explore this presenter setup, or start with a blank plan.', kind: 'info' };
try {
  const restored = loadProject(window.localStorage);
  if (restored) { project = restored; dirty = false; saved = true; notice = { message: 'Your saved plan is restored in this browser.', kind: 'good' }; }
} catch {
  project = emptyProject();
  notice = { message: 'Saved data could not be read. It has not been overwritten. You can work here, but save only when you want to replace the previous snapshot.', kind: 'error' };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function button(text: string, action: () => void, className = '', id = ''): HTMLButtonElement {
  const node = el('button', className, text); node.type = 'button'; node.onclick = action;
  if (id) node.id = id;
  return node;
}
function notify(message: string, kind: Notice['kind'] = 'info'): void {
  notice = { message, kind }; announcer.textContent = message;
}
function change(message: string): void { dirty = true; rejected = null; notify(message, 'good'); render(); }
function cleanLabel(value: string, fallback: string): string { return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80) || fallback; }
function endpoint(deviceId: string, portId: string): string {
  const device = project.devices.find(d => d.id === deviceId);
  const port = device && getProfile(device.type)?.ports.find(p => p.id === portId);
  return `${device?.label ?? 'Unknown device'} · ${port?.label ?? 'Unknown port'}`;
}
function safeReplace(action: () => void): void {
  if (dirty && !window.confirm('Replace your unsaved changes? Save first if you want to keep this plan.')) return;
  action(); selectedCable = ''; selectedDevice = ''; fromValue = ''; toValue = ''; rejected = null; render();
}
function save(): void {
  try { saveProject(project, window.localStorage); dirty = false; saved = true; notify('Saved in this browser. Your plan will be restored when you return.', 'good'); }
  catch { notify('Save failed: browser storage may be disabled or full. Your current plan is still here. You can print it before closing this page.', 'error'); }
  render();
}
function reload(): void {
  safeReplace(() => {
    try {
      const value = loadProject(window.localStorage);
      if (!value) { notify('No saved plan was found. Your current plan is unchanged.', 'warn'); return; }
      project = value; dirty = false; saved = true; notify('Saved plan restored.', 'good');
    } catch { notify('The saved snapshot is unavailable or invalid. Your current plan and the stored data are unchanged.', 'error'); }
  });
}
function addDevice(type: string): void {
  if (project.devices.length >= 30) { notify('This small-setup planner supports up to 30 devices. Remove a device before adding another.', 'warn'); render(); return; }
  const profile = getProfile(type)!;
  const count = project.devices.filter(d => d.type === type).length + 1;
  const device = { id: crypto.randomUUID(), type, label: `${profile.label} ${count}` };
  project.devices.push(device); selectedDevice = device.id; selectedCable = '';
  change(`${device.label} added. Choose its ports in the connection editor.`);
}
function removeDevice(id: string): void {
  const device = project.devices.find(d => d.id === id)!;
  const count = project.cables.filter(c => c.fromDevice === id || c.toDevice === id).length;
  if (!window.confirm(`Remove ${device.label} and ${count} attached cable${count === 1 ? '' : 's'}?`)) return;
  project.devices = project.devices.filter(d => d.id !== id);
  project.cables = project.cables.filter(c => c.fromDevice !== id && c.toDevice !== id);
  selectedDevice = ''; selectedCable = ''; change(`${device.label} removed with its attached cables.`);
}
function disconnect(id: string): void {
  const cable = project.cables.find(c => c.id === id); if (!cable) return;
  project.cables = project.cables.filter(c => c.id !== id); selectedCable = '';
  change(`${id} disconnected. Downstream paths have been checked again.`);
}
function connect(): void {
  const [fromDevice, fromPort] = fromValue.split(':');
  const [toDevice, toPort] = toValue.split(':');
  const candidate = { fromDevice: fromDevice ?? '', fromPort: fromPort ?? '', toDevice: toDevice ?? '', toPort: toPort ?? '' };
  const result = validateConnection(project, candidate);
  if (!result.ok) { rejected = candidate; notify(result.message, 'error'); render(); return; }
  const ids = new Set(project.cables.map(c => c.id)); let counter = 1;
  while (ids.has(`C${String(counter).padStart(2, '0')}`)) counter++;
  const cable = { id: `C${String(counter).padStart(2, '0')}`, ...candidate };
  project.cables.push(cable); selectedCable = cable.id; selectedDevice = '';
  change(`${cable.id} connected: ${endpoint(cable.fromDevice, cable.fromPort)} to ${endpoint(cable.toDevice, cable.toPort)}.`);
}
function panel(title: string, subtitle?: string, className = ''): { section: HTMLElement; body: HTMLElement; heading: HTMLElement } {
  const section = el('section', `panel ${className}`); const heading = el('div', 'panel-heading');
  const group = el('div'); group.append(el('h2', '', title)); if (subtitle) group.append(el('p', '', subtitle));
  heading.append(group); const body = el('div', 'panel-body'); section.append(heading, body);
  return { section, body, heading };
}
function svgNode<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text; return node;
}
function graphView(): HTMLElement {
  const wrapper = el('div', 'graph-wrap');
  if (!project.devices.length) { wrapper.append(el('p', 'empty', 'Your signal path starts here. Add a laptop and a destination from the catalog.')); return wrapper; }
  const groups = [project.devices.filter(d => d.type === 'laptop'), project.devices.filter(d => !['laptop', 'projector', 'speaker'].includes(d.type)), project.devices.filter(d => ['projector', 'speaker'].includes(d.type))];
  const height = Math.max(270, Math.max(...groups.map(g => g.length)) * 150 + 45);
  const svg = svgNode('svg', { class: 'graph', viewBox: `0 0 650 ${height}`, 'aria-hidden': 'true', focusable: 'false' });
  const positions = new Map<string, { x: number; y: number }>();
  groups.forEach((devices, column) => {
    const x = 12 + column * 220;
    svg.append(svgNode('text', { x: x + 2, y: 15, class: 'col-title' }, ['SOURCE', 'ROUTING', 'DESTINATIONS'][column]));
    devices.forEach((device, row) => {
      const y = 34 + row * 150; const profile = getProfile(device.type)!;
      profile.ports.forEach((port, i) => positions.set(`${device.id}:${port.id}`, { x: port.direction === 'input' ? x : x + 185, y: y + 53 + i * 18 }));
    });
  });
  const drawEdge = (cable: Omit<Cable, 'id'> & { id?: string }, isRejected = false) => {
    const from = positions.get(`${cable.fromDevice}:${cable.fromPort}`); const to = positions.get(`${cable.toDevice}:${cable.toPort}`);
    if (!from || !to) return;
    const bend = Math.max(15, Math.abs(to.x - from.x) / 2);
    // Route skipped columns above cards, and same-column edges between rows.
    // A visually hidden cable must not appear to pass through an unrelated device.
    let path: string;
    let labelX = (from.x + to.x) / 2 + 3;
    let labelY = (from.y + to.y) / 2 - 5;
    if (to.x - from.x > 200) {
      path = `M${from.x} ${from.y} H${from.x + 11} V25 H${to.x - 11} V${to.y} H${to.x}`;
      labelY = 22;
    } else if (from.x > to.x) {
      const lane = 172 + Math.max(Math.floor((from.y - 34) / 150), Math.floor((to.y - 34) / 150)) * 150;
      path = `M${from.x} ${from.y} H${from.x + 11} V${lane} H${to.x - 11} V${to.y} H${to.x}`;
      labelY = lane - 4;
    } else path = `M${from.x} ${from.y} C${from.x + bend} ${from.y},${to.x - bend} ${to.y},${to.x} ${to.y}`;
    svg.append(svgNode('path', { d: path, class: isRejected ? 'rejected-edge' : `edge ${cable.id === selectedCable ? 'edge-selected' : ''}` }));
    svg.append(svgNode('text', { x: labelX, y: labelY, class: 'cable-label' }, isRejected ? 'Rejected' : cable.id));
  };
  project.cables.forEach(c => drawEdge(c)); if (rejected) drawEdge(rejected, true);
  groups.forEach((devices, column) => devices.forEach((device, row) => {
    const x = 12 + column * 220; const y = 34 + row * 150; const profile = getProfile(device.type)!;
    const invalid = rejected && [rejected.fromDevice, rejected.toDevice].includes(device.id);
    svg.append(svgNode('rect', { x, y, width: 185, height: 126, rx: 8, class: `node-box ${device.id === selectedDevice ? 'node-selected' : ''} ${invalid ? 'node-invalid' : ''}` }));
    const shortened = device.label.length > 25 ? device.label.slice(0, 24) + '…' : device.label;
    svg.append(svgNode('text', { x: x + 11, y: y + 20, class: 'node-title' }, shortened));
    svg.append(svgNode('text', { x: x + 11, y: y + 35, class: 'node-kind' }, profile.label));
    profile.ports.forEach(port => {
      const position = positions.get(`${device.id}:${port.id}`)!; const input = port.direction === 'input';
      svg.append(svgNode('circle', { cx: position.x, cy: position.y, r: 3.5, class: 'port-dot' }));
      svg.append(svgNode('text', { x: input ? x + 11 : x + 174, y: position.y + 3, 'text-anchor': input ? 'start' : 'end', class: 'port-label' }, `${port.label} ${input ? 'IN' : 'OUT'}`));
    });
  }));
  wrapper.append(svg); return wrapper;
}
function portSelect(label: string, id: string, current: string, assign: (value: string) => void): HTMLElement {
  const wrapper = el('div'); const caption = el('label', '', label); caption.htmlFor = id;
  const select = el('select'); select.id = id;
  const placeholder = el('option', '', 'Choose a port…'); placeholder.value = ''; select.append(placeholder);
  for (const device of project.devices) {
    const group = el('optgroup'); group.label = device.label;
    for (const port of getProfile(device.type)!.ports) {
      const option = el('option', '', `${device.label} · ${port.label} (${port.direction === 'input' ? 'IN' : 'OUT'})`);
      option.value = `${device.id}:${port.id}`; group.append(option);
    }
    select.append(group);
  }
  select.value = current; assign(select.value); select.onchange = () => assign(select.value);
  wrapper.append(caption, select); return wrapper;
}
function renderInspector(): HTMLElement {
  const box = panel('Connection notes', 'Understand what your plan can carry.', 'inspector');
  const summary = el('div'); const metrics = el('div', 'metric-row');
  for (const [value, label] of [[project.devices.length, 'devices'], [project.cables.length, 'cables']] as const) {
    const metric = el('div'); metric.append(el('strong', '', String(value)), el('span', '', label)); metrics.append(metric);
  }
  summary.append(metrics);
  const findings = analyzeGraph(project);
  summary.append(el('h3', '', findings.resolved ? '✓ Declared paths connected' : '△ Paths to review'));
  if (!findings.issues.length) summary.append(el('p', '', 'Every required sink has a route from the declared source. This checks the model, not the physical equipment.'));
  else {
    const issues = el('ul'); for (const issue of findings.issues) issues.append(el('li', '', issue.message)); summary.append(issues);
  }
  const selected = el('div');
  if (selectedDevice) {
    const device = project.devices.find(d => d.id === selectedDevice);
    if (device) {
      const profile = getProfile(device.type)!;
      selected.append(el('h3', '', device.label), el('p', '', profile.description));
      const ports = el('ul'); for (const port of profile.ports) ports.append(el('li', '', `${port.label}: ${port.direction}, ${port.signal}, ${port.connector}.`));
      selected.append(ports);
    }
  } else if (selectedCable) {
    const cable = project.cables.find(c => c.id === selectedCable);
    if (cable) selected.append(el('h3', '', `Selected cable ${cable.id}`), el('p', '', `${endpoint(cable.fromDevice, cable.fromPort)} → ${endpoint(cable.toDevice, cable.toPort)}`));
  } else selected.append(el('h3', '', 'One cable, one declared path'), el('p', '', 'Pick a cable or inspect a device to see its endpoints and signal types. The editor explains rejected attempts without changing your plan.'));
  if (rejected) selected.append(el('div', 'notice error', notice.message));
  selected.append(el('div', 'help-link', 'Generic profiles only. Check your equipment’s specifications. No power, pin-level, or arbitrary adapter guidance.'));
  selected.append(button('Print patch list ↗', printProject, 'print-actions', 'print-secondary'));
  box.body.append(summary, selected); return box.section;
}
function renderPrint(): void {
  const sheet = document.querySelector<HTMLElement>('#print-sheet')!; sheet.replaceChildren();
  sheet.append(el('p', 'eyebrow', 'CABLEMAP / PATCH SHEET'), el('h1', '', project.title || 'Untitled plan'));
  const findings = analyzeGraph(project);
  sheet.append(el('p', 'print-subtitle', `${project.devices.length} devices · ${project.cables.length} cables · ${dirty ? 'Current unsaved changes included' : 'Saved plan'}`));
  sheet.append(el('p', 'notice', findings.resolved ? 'Declared paths connected. Physical equipment has not been tested.' : 'UNRESOLVED — review the warnings below before using this plan.'));
  const table = el('table', 'print-table'); const head = el('thead'); const titles = el('tr');
  for (const title of ['Cable', 'From', 'To', 'Signal']) titles.append(el('th', '', title)); head.append(titles); table.append(head);
  const body = el('tbody');
  for (const row of patchRows(project)) { const tr = el('tr'); for (const value of [row.id, row.from, row.to, row.signal]) tr.append(el('td', '', value)); body.append(tr); }
  table.append(body); sheet.append(table);
  if (!project.cables.length) sheet.append(el('p', '', 'No accepted cables in this plan.'));
  sheet.append(el('h2', '', 'Device legend')); const devices = el('ul', 'print-list');
  for (const device of project.devices) devices.append(el('li', '', `${device.label} — ${getProfile(device.type)!.label} (generic declared profile)`)); sheet.append(devices);
  if (findings.issues.length) { sheet.append(el('h2', '', 'Unresolved paths')); const list = el('ul', 'print-list'); for (const issue of findings.issues) list.append(el('li', '', issue.message)); sheet.append(list); }
  sheet.append(el('p', 'print-subtitle', 'CableMap validates an authored signal model. Labels do not verify real hardware. No electrical, power, or pin-level advice.'));
}
function printProject(): void { renderPrint(); window.print(); }

function render(): void {
  const activeId = (document.activeElement as HTMLElement | null)?.id;
  const previousSelection = document.activeElement instanceof HTMLInputElement ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
  app.replaceChildren();
  const pageHead = el('div', 'page-head'); const intro = el('div');
  intro.append(el('p', 'eyebrow', 'PLAN → CONNECT → UNDERSTAND'), el('h1', '', 'Know your signal path.'), el('p', 'muted', 'Build a small AV plan. Catch the wrong connection. Leave with a clear patch sheet.'));
  const toolbar = el('div', 'toolbar');
  toolbar.append(button('Save plan', save, 'primary', 'save-plan'), button('Reload saved', reload, '', 'reload-plan'), button('Load example', () => safeReplace(() => { project = exampleProject(); dirty = true; notify('Example loaded. This is a generic presenter setup, not detected equipment.'); }), '', 'load-example'), button('Start blank', () => safeReplace(() => { project = emptyProject(); dirty = true; notify('Blank plan ready. Add a laptop and a destination to start.'); }), '', 'start-blank'), button('Print ↗', printProject, '', 'print-plan'));
  pageHead.append(intro, toolbar); app.append(pageHead);
  const workspace = el('div', 'workspace');
  const catalog = panel('01 / Add your devices', 'Six profiles. One clear plan.'); catalog.body.className = 'catalog';
  const icons: Record<string, string> = { laptop: '▱', projector: '▣', interface: '⇄', mixer: '≡', speaker: '◉', extractor: '⑂' };
  for (const profile of CATALOG) {
    const add = button('', () => addDevice(profile.type), 'catalog-card', `add-${profile.type}`); add.setAttribute('aria-label', `Add ${profile.label}`);
    const text = el('span'); text.append(el('strong', '', profile.label), el('small', '', profile.description)); add.append(el('span', 'device-icon', icons[profile.type] ?? '+'), text); catalog.body.append(add);
  }
  catalog.section.append(el('p', 'catalog-note', 'These are generic declared profiles. Rename them to match your setup; the declared ports stay the same.'));
  workspace.append(catalog.section);
  const center = el('div', 'center-stack');
  const graph = panel('Your signal map', 'The same connections as your keyboard editor.', 'graph-panel');
  const findings = analyzeGraph(project); graph.heading.append(el('span', `status-pill ${findings.resolved ? 'good' : 'warn'}`, findings.resolved ? '✓ Paths connected' : '△ Review paths'));
  const projectField = el('div', 'project-name'); const titleLabel = el('label', '', 'Plan name'); titleLabel.htmlFor = 'project-title';
  const title = el('input'); title.id = 'project-title'; title.maxLength = 80; title.value = project.title;
  title.onchange = () => { project.title = cleanLabel(title.value, 'Untitled plan'); change('Plan name updated. Save to keep it.'); };
  projectField.append(titleLabel, title); graph.body.replaceWith(projectField, graphView());
  const legend = el('div', 'graph-legend'); legend.append(el('span', '', 'Solid = accepted cable · Dashed = rejected attempt'), el('span', '', dirty ? '● Unsaved changes' : saved ? '✓ Saved in this browser' : 'Local plan')); graph.section.append(legend); center.append(graph.section);
  const editor = panel('02 / Connect & review', 'Select two declared ports. We’ll explain what works.', 'editor-panel'); editor.section.id = 'connection-editor'; editor.section.tabIndex = -1; editor.body.className = 'editor-body';
  const form = el('div', 'connection-form');
  form.append(portSelect('Source port', 'source-port', fromValue, v => { fromValue = v; }), el('span', 'direction-arrow', '→'), portSelect('Destination port', 'destination-port', toValue, v => { toValue = v; }), button('Connect', connect, 'primary', 'connect'));
  const message = el('div', `notice ${notice.kind}`, notice.message); message.id = 'connection-result';
  editor.body.append(form, message);
  const list = el('ul', 'cable-list'); list.id = 'cable-list'; list.setAttribute('aria-label', 'Accepted cables');
  for (const cable of project.cables) {
    const row = el('li', 'cable-row'); row.dataset.cableId = cable.id;
    const inspect = button('', () => { selectedCable = cable.id; selectedDevice = ''; render(); }, 'cable-info', `inspect-cable-${cable.id}`); inspect.setAttribute('aria-label', `Inspect cable ${cable.id}`);
    const endpoints = el('span', 'cable-endpoints', endpoint(cable.fromDevice, cable.fromPort)); endpoints.append(el('small', '', `→ ${endpoint(cable.toDevice, cable.toPort)}`));
    inspect.append(el('span', 'cable-id', cable.id), endpoints);
    const remove = button('Disconnect', () => disconnect(cable.id), 'small', `disconnect-${cable.id}`); remove.setAttribute('aria-label', `Disconnect cable ${cable.id}`);
    row.append(inspect, remove); list.append(row);
  }
  editor.body.append(list); if (!project.cables.length) editor.body.append(el('p', 'empty', 'No cables yet. Pick a source and destination above.'));
  center.append(editor.section);
  const devices = panel('Device labels & ports', 'Name the equipment, then inspect its declared profile.', 'devices-panel'); devices.body.className = 'panel-body devices';
  for (const device of project.devices) {
    const row = el('div', 'device-row'); const field = el('div', 'device-label'); const label = el('label', '', getProfile(device.type)!.label); label.htmlFor = `label-${device.id}`;
    const input = el('input'); input.id = `label-${device.id}`; input.value = device.label; input.maxLength = 80;
    input.onchange = () => { device.label = cleanLabel(input.value, getProfile(device.type)!.label); change('Device label updated. Save to keep it.'); };
    field.append(label, input);
    const inspect = button('Inspect', () => { selectedDevice = device.id; selectedCable = ''; render(); }, 'small', `inspect-${device.id}`); inspect.setAttribute('aria-label', `Inspect ${device.label}`);
    const remove = button('Remove', () => removeDevice(device.id), 'small danger', `remove-${device.id}`); remove.setAttribute('aria-label', `Remove ${device.label}`);
    row.append(field, inspect, remove); devices.body.append(row);
  }
  if (!project.devices.length) devices.body.append(el('p', 'empty', 'Add a device from the catalog to begin.'));
  devices.section.append(el('div', 'bottom-note', 'Stored only in this browser when you save. Clearing site data removes the saved plan. Print a copy if you need a record.'));
  center.append(devices.section); workspace.append(center, renderInspector()); app.append(workspace); renderPrint();
  if (activeId) {
    const next = document.getElementById(activeId); (next ?? document.getElementById('connection-editor'))?.focus({ preventScroll: true });
    if (next instanceof HTMLInputElement && previousSelection) next.setSelectionRange(previousSelection[0] ?? null, previousSelection[1] ?? null);
  }
}
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('beforeprint', renderPrint);
render();
