import { getProfile } from './catalog.js';
import type { Project } from './model.js';
import { parseProject } from './validation.js';

export interface PatchRow { id: string; from: string; to: string; signal: string }

/** Plain text only. The UI must insert labels with textContent, never innerHTML. */
export function patchRows(project: Project): PatchRow[] {
  const valid = parseProject(project);
  return valid.cables.map((cable) => {
    const fromDevice = valid.devices.find((device) => device.id === cable.fromDevice)!;
    const toDevice = valid.devices.find((device) => device.id === cable.toDevice)!;
    const fromPort = getProfile(fromDevice.type)!.ports.find((port) => port.id === cable.fromPort)!;
    const toPort = getProfile(toDevice.type)!.ports.find((port) => port.id === cable.toPort)!;
    return { id: cable.id, from: `${fromDevice.label} · ${fromPort.label}`, to: `${toDevice.label} · ${toPort.label}`, signal: fromPort.signal };
  });
}
