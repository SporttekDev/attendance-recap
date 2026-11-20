import type { Config, Edits } from './types';

const PREFIX = 'absen:v1:';

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Penyimpanan penuh atau diblokir: aplikasi tetap berjalan tanpa menyimpan.
  }
}

export interface SavedCfg {
  cfg: Config;
  holidays: string[];
}

export const loadCfg = (): SavedCfg | null => read<SavedCfg>('cfg');
export const saveCfg = (v: SavedCfg): void => write('cfg', v);

export const loadNames = (): Record<string, string> => read<Record<string, string>>('names') ?? {};
export const saveName = (key: string, full: string): void => write('names', { ...loadNames(), [key]: full });

export const loadEdits = (key: string): Edits | null => read<Edits>('edits:' + key);
export const saveEdits = (key: string, edits: Edits): void => write('edits:' + key, edits);
