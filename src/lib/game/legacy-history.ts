import { currentDay, DAY_MS } from "./day";
import type { HistoryEntry } from "./local-history";

/** The live site only ever sent people to underscores, so that's whose games these are. */
export const LEGACY_ARTIST = "underscores";

/** Ignore legacy history from 1st Nov */
export const LEGACY_ENDS = Date.UTC(2026, 10, 1) / DAY_MS;

type LegacyRecord = { guesses?: unknown; answer?: unknown };

/*
 * Converts old history into the current shape. Unfinished days and anything malformed are dropped.
 * @param raw The parsed contents of the old "history" key
 * @returns Finished games, as history entries for underscores
 */
export function convertLegacyHistory(raw: unknown): HistoryEntry[] {
  if (typeof raw !== "object" || raw === null) return [];

  return Object.entries(raw as Record<string, LegacyRecord>).flatMap(([date, record]) => {
    const match = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const answer = record?.answer;
    if (!match || typeof answer !== "string" || answer === "" || !Array.isArray(record.guesses)) return [];

    const [, d, m, y] = match.map(Number);
    const day = Date.UTC(y, m - 1, d) / DAY_MS;


    const guesses = record.guesses
      .slice(0, 6) // old history has 7th empty guess
      .map((g) => (typeof g === "string" ? g : "")); // just ensuring it's a string

    return [{
      artist: LEGACY_ARTIST,
      day,
      guesses,
      status: guesses.includes(answer) ? "WON" : "LOST",
      answer,
    }];
  });
}

/** Old games still sitting in this browser, or [] if there aren't any, they're already imported, or it's past the LEGACY_ENDS date */
export function readLegacyHistory(): HistoryEntry[] {
  if (currentDay() >= LEGACY_ENDS) return [];

  // getItem itself throws when storage is blocked, so it lives inside the try too
  try {
    const data = window.localStorage.getItem("history");
    return data ? convertLegacyHistory(JSON.parse(data)) : [];
  } catch {
    return [];
  }
}

export function markLegacyHistoryImported() {
  try {
    const raw = window.localStorage.getItem("history");
    if (raw === null) return;
    window.localStorage.setItem("history_imported", raw);
    window.localStorage.removeItem("history");
  } catch {
    // storage blocked :( worst case we try again next time, and the server skips duplicates so like who caresss
  }
}
