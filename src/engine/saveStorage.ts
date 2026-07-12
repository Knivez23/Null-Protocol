import type { PlaythroughMeta, PlaythroughSaveData } from '../types';

/**
 * Storage abstraction for playthrough saves. Deliberately an interface, not
 * a concrete implementation reached for directly — if this ever needs to
 * become a real backend (accounts, cloud sync), that's a swap of the
 * implementation behind this interface, not a rewrite of anything that
 * calls it (LandingScreen, App.tsx auto-save, etc.).
 */
export interface SaveStorage {
  listPlaythroughs(): PlaythroughMeta[];
  loadPlaythrough(id: string): PlaythroughSaveData | null;
  savePlaythrough(data: PlaythroughSaveData): void;
  deletePlaythrough(id: string): void;
}

const INDEX_KEY = 'nullprotocol:playthroughs:index';
const dataKey = (id: string) => `nullprotocol:playthrough:${id}`;

class LocalStorageSaveStorage implements SaveStorage {
  listPlaythroughs(): PlaythroughMeta[] {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as PlaythroughMeta[];
      // newest-played first, for the Landing Page list
      return parsed.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
    } catch {
      return [];
    }
  }

  loadPlaythrough(id: string): PlaythroughSaveData | null {
    try {
      const raw = localStorage.getItem(dataKey(id));
      return raw ? (JSON.parse(raw) as PlaythroughSaveData) : null;
    } catch {
      return null;
    }
  }

  savePlaythrough(data: PlaythroughSaveData): void {
    try {
      localStorage.setItem(dataKey(data.meta.id), JSON.stringify(data));
      const index = this.listPlaythroughs().filter(m => m.id !== data.meta.id);
      index.push(data.meta);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (err) {
      // Most likely a quota error — surface to console rather than silently losing progress.
      console.error('Failed to save playthrough:', err);
    }
  }

  deletePlaythrough(id: string): void {
    try {
      localStorage.removeItem(dataKey(id));
      const index = this.listPlaythroughs().filter(m => m.id !== id);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (err) {
      console.error('Failed to delete playthrough:', err);
    }
  }
}

export const saveStorage: SaveStorage = new LocalStorageSaveStorage();