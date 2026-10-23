import { getProfile } from './catalog.js';
import { LIMITS, type Cable, type Device, type Port, type Project } from './model.js';

export interface ConnectionResult {
  ok: boolean;
  code: string;
  message: string;
  deviceIds: string[];
  cableId?: string;
}

export interface GraphIssue {
  code: string;
  message: string;
  deviceId: string;
  portId?: string;
}

const endpointKey = (device: string, port: string): string => JSON.stringify([device, port]);

function findEndpoint(project: Project, deviceId: string, portId: string): { device: Device; port: Port } | undefined {
  const device = project.devices.find((entry) => entry.id === deviceId);
  const port = device && getProfile(device.type)?.ports.find((entry) => entry.id === portId);
  return device && port ? { device, port } : undefined;
}

export function validateConnection(project: Project, candidate: Omit<Cable, 'id'>): ConnectionResult {
  const deviceIds = [...new Set([candidate.fromDevice, candidate.toDevice])];
  const reject = (code: string, message: string, cableId?: string): ConnectionResult => ({ ok: false, code, message, deviceIds, ...(cableId ? { cableId } : {}) });
  if (project.cables.length >= LIMITS.cables) return reject('CABLE_LIMIT', `This small-setup planner supports at most ${LIMITS.cables} cables. Remove a cable before adding another.`);
  const from = findEndpoint(project, candidate.fromDevice, candidate.fromPort);
  const to = findEndpoint(project, candidate.toDevice, candidate.toPort);
  if (!from || !to) return reject('UNKNOWN_ENDPOINT', 'Choose two ports from the declared device catalog. Unknown devices, ports, and adapters are unsupported.');
  if (from.port.direction !== 'output' || to.port.direction !== 'input') return reject('DIRECTION', 'A cable must run from an output to an input. Reverse the selection or choose the correct ports.');
  if (from.device.id === to.device.id) return reject('SELF_CONNECTION', 'Connect two different devices. Internal routing is already declared by the device profile.');
  if (from.port.signal !== to.port.signal) return reject('SIGNAL_MISMATCH', `${from.device.label} · ${from.port.label} carries ${from.port.signal}; ${to.device.label} · ${to.port.label} expects ${to.port.signal}. A cable cannot convert the signal. Use only a declared converter profile.`);
  const connectorsMatch = (from.port.connector === to.port.connector) || (from.port.connector === 'usb-a' && to.port.connector === 'usb-b' && from.port.signal === 'usb-audio');
  if (!connectorsMatch) return reject('CONNECTOR_MISMATCH', `These declared connectors do not form a supported cable pair (${from.port.connector} → ${to.port.connector}). Unknown adapters remain unsupported.`);
  const duplicate = project.cables.find((cable) => cable.fromDevice === candidate.fromDevice && cable.fromPort === candidate.fromPort && cable.toDevice === candidate.toDevice && cable.toPort === candidate.toPort);
  if (duplicate) return reject('DUPLICATE', `Cable ${duplicate.id} already connects these ports. Select that cable to inspect or remove it.`, duplicate.id);
  const occupiedInput = project.cables.find((cable) => cable.toDevice === candidate.toDevice && cable.toPort === candidate.toPort);
  if (occupiedInput) return reject('OCCUPIED_INPUT', `${to.device.label} · ${to.port.label} is already used by cable ${occupiedInput.id}. Disconnect it explicitly before replacing it.`, occupiedInput.id);
  const occupiedOutput = project.cables.find((cable) => cable.fromDevice === candidate.fromDevice && cable.fromPort === candidate.fromPort);
  if (occupiedOutput) return reject('OCCUPIED_OUTPUT', `${from.device.label} · ${from.port.label} is already used by cable ${occupiedOutput.id}. One port carries one cable; an implicit splitter is not supported.`, occupiedOutput.id);
  return { ok: true, code: 'COMPATIBLE', message: 'The declared ports are compatible. Check the full signal path for unresolved destinations.', deviceIds };
}

/** Reachability uses both cable edges and the catalog's explicit internal routes. */
export function analyzeGraph(project: Project): { resolved: boolean; issues: GraphIssue[] } {
  const issues: GraphIssue[] = [];
  const adjacency = new Map<string, string[]>();
  const roots: string[] = [];
  const sinks: { device: Device; port: Port }[] = [];
  const addEdge = (from: string, to: string): void => { adjacency.set(from, [...(adjacency.get(from) ?? []), to]); };
  for (const device of project.devices) {
    const profile = getProfile(device.type);
    if (!profile) { issues.push({ code: 'UNKNOWN_PROFILE', message: `${device.label} has an unsupported device profile.`, deviceId: device.id }); continue; }
    for (const route of profile.routes) addEdge(endpointKey(device.id, route.from), endpointKey(device.id, route.to));
    for (const source of profile.sourcePorts) roots.push(endpointKey(device.id, source));
    for (const portId of profile.sinkPorts) {
      const port = profile.ports.find((entry) => entry.id === portId);
      if (port) sinks.push({ device, port });
    }
  }
  // Do not let a malformed cable create a false source-to-sink route.
  const accepted: Project = { ...project, cables: [] };
  for (const cable of project.cables) {
    const result = validateConnection(accepted, cable);
    if (!result.ok) { issues.push({ code: result.code, message: `Cable ${cable.id}: ${result.message}`, deviceId: cable.toDevice, portId: cable.toPort }); continue; }
    accepted.cables.push(cable);
    addEdge(endpointKey(cable.fromDevice, cable.fromPort), endpointKey(cable.toDevice, cable.toPort));
  }
  const reached = new Set<string>();
  const queue = [...roots];
  for (let index = 0; index < queue.length; index++) {
    const key = queue[index];
    if (key === undefined || reached.has(key)) continue;
    reached.add(key);
    queue.push(...(adjacency.get(key) ?? []));
  }
  for (const { device, port } of sinks) {
    if (!reached.has(endpointKey(device.id, port.id))) {
      const gap = upstreamGap(accepted, device.id, port.id, new Set());
      issues.push({ code: 'UNRESOLVED_SINK', message: `${device.label} · ${port.label} has no declared path from a presenter laptop.${gap ? ` ${gap}` : ' Check the upstream route; a loop cannot create a source signal.'}`, deviceId: device.id, portId: port.id });
    }
  }
  if (!sinks.length) issues.push({ code: 'NO_SINK', message: 'Add a projector or powered speaker to review a complete source-to-destination path.', deviceId: project.devices[0]?.id ?? '' });
  return { resolved: issues.length === 0 && sinks.length > 0, issues };
}

function upstreamGap(project: Project, deviceId: string, portId: string, seen: Set<string>): string | undefined {
  const key = endpointKey(deviceId, portId);
  if (seen.has(key)) return undefined;
  seen.add(key);
  const endpoint = findEndpoint(project, deviceId, portId);
  if (!endpoint) return 'An upstream endpoint is unsupported.';
  if (endpoint.port.direction === 'input') {
    const incoming = project.cables.find((cable) => cable.toDevice === deviceId && cable.toPort === portId);
    return incoming ? upstreamGap(project, incoming.fromDevice, incoming.fromPort, seen) : `Missing upstream cable at ${endpoint.device.label} · ${endpoint.port.label}.`;
  }
  const profile = getProfile(endpoint.device.type)!;
  const routes = profile.routes.filter((route) => route.to === portId);
  // Follow a connected mixer input first instead of blaming an unused optional one.
  routes.sort((a, b) => Number(project.cables.some((cable) => cable.toDevice === deviceId && cable.toPort === b.from)) - Number(project.cables.some((cable) => cable.toDevice === deviceId && cable.toPort === a.from)));
  for (const route of routes) {
    const gap = upstreamGap(project, deviceId, route.from, seen);
    if (gap) return gap;
  }
  return undefined;
}

function record(value: unknown, label: string, keys: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error(`${label} must be a plain object.`);
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => !keys.includes(key)) || keys.some((key) => !Object.hasOwn(result, key))) throw new Error(`${label} has missing or unsupported fields.`);
  return result;
}

function id(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value)) throw new Error(`${label} must be a short identifier using letters, numbers, underscores, or hyphens.`);
  return value;
}

function label(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim() || value.length > LIMITS.label || /[\u0000-\u001f\u007f]/.test(value)) throw new Error(`${name} must contain 1–${LIMITS.label} readable characters.`);
  return value;
}

/** Returns new, whitelisted data; never merges stored objects into live state. */
export function parseProject(input: unknown): Project {
  const raw = record(input, 'Project', ['schemaVersion', 'catalogVersion', 'title', 'devices', 'cables']);
  if (raw.schemaVersion !== 1 || raw.catalogVersion !== 1) throw new Error('This saved project uses an unsupported schema or catalog version. The stored data has not been changed.');
  if (!Array.isArray(raw.devices) || raw.devices.length > LIMITS.devices) throw new Error(`Project must contain at most ${LIMITS.devices} devices.`);
  if (!Array.isArray(raw.cables) || raw.cables.length > LIMITS.cables) throw new Error(`Project must contain at most ${LIMITS.cables} cables.`);
  const deviceIds = new Set<string>();
  const devices = raw.devices.map((entry, index): Device => {
    const value = record(entry, `Device ${index + 1}`, ['id', 'type', 'label']);
    const deviceId = id(value.id, 'Device ID');
    if (deviceIds.has(deviceId)) throw new Error(`Device ID ${deviceId} is duplicated.`);
    deviceIds.add(deviceId);
    if (typeof value.type !== 'string' || !getProfile(value.type)) throw new Error('A saved device uses an unknown profile. Arbitrary adapters are unsupported.');
    return { id: deviceId, type: value.type, label: label(value.label, 'Device label') };
  });
  const project: Project = { schemaVersion: 1, catalogVersion: 1, title: label(raw.title, 'Project title'), devices, cables: [] };
  const cableIds = new Set<string>();
  for (const [index, entry] of raw.cables.entries()) {
    const value = record(entry, `Cable ${index + 1}`, ['id', 'fromDevice', 'fromPort', 'toDevice', 'toPort']);
    const cable: Cable = { id: id(value.id, 'Cable ID'), fromDevice: id(value.fromDevice, 'Source device'), fromPort: id(value.fromPort, 'Source port'), toDevice: id(value.toDevice, 'Destination device'), toPort: id(value.toPort, 'Destination port') };
    if (cableIds.has(cable.id)) throw new Error(`Cable ID ${cable.id} is duplicated.`);
    const result = validateConnection(project, cable);
    if (!result.ok) throw new Error(`Saved cable ${cable.id} is invalid: ${result.message}`);
    cableIds.add(cable.id);
    project.cables.push(cable);
  }
  return project;
}
