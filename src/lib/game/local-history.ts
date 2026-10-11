import type { GameState } from "./game-engine";
import { LEGACY_ARTIST, readLegacyHistory } from "./legacy-history";

// Finished games for anonymous players. Lives in the browser only

export type HistoryEntry = GameState & { answer: string | null };

const KEY = "history_v2";

const readAll = (): HistoryEntry[] => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** Newest first history for an artist, including any pre-cloud ones still on this device */
export const readLocalHistory = (artist: string) => {
  const current = readAll().filter((entry) => entry.artist === artist);
  const days = new Set(current.map((entry) => entry.day));
  const legacy = artist === LEGACY_ARTIST ? readLegacyHistory().filter((entry) => !days.has(entry.day)) : [];

  return [...current, ...legacy].sort((a, b) => b.day - a.day);
};

/** Records a finished game, replacing any earlier entry for the same artist & day */
export const saveLocalHistory = (entry: HistoryEntry) => {
  const rest = readAll().filter((e) => !(e.artist === entry.artist && e.day === entry.day));
  try {
    window.localStorage.setItem(KEY, JSON.stringify([entry, ...rest]));
  } catch {
    // Storage full or blocked - history just won't show this game.
  }
};
