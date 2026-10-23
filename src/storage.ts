import { LIMITS, type Project } from './model.js';
import { parseProject } from './validation.js';

export const STORAGE_KEY = 'cablemap.project.v1';

export function loadProject(storage: Pick<Storage, 'getItem'>): Project | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  if (raw.length > LIMITS.storedBytes) throw new Error('The saved project exceeds the supported size. It has not been changed.');
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw new Error('The saved project is not valid JSON. It has not been changed.'); }
  return parseProject(value);
}

export function saveProject(project: Project, storage: Pick<Storage, 'setItem'>): void {
  const valid = parseProject(project);
  storage.setItem(STORAGE_KEY, JSON.stringify(valid));
}
