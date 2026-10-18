import "server-only";
import { db } from "@prisma/db";
import { env } from "@/lib/env";
import { currentDay, DAY_MS } from "./day";
import { LEGACY_ARTIST, LEGACY_ENDS } from "./legacy-history";

// Copies a player's pre-cloud localStorage history onto their account. Since this could've
// been manipulated, it's simply checked for validity before marking it as legacy, so that
// it won't count for leaderboards and stuff (when I get around to those)

const MAX_GUESS_LENGTH = 256;
// Day index of the first ever heardle. Function as otherwise Next messes it up
const FIRST_DAY = () => Math.floor(parseInt(env("UNIX_TIMESTAMP_DAY_1")) / DAY_MS);

type UnknownLegacyHistoryType = { day?: unknown; guesses?: unknown; answer?: unknown };
type NarrowedLegacyHistoryType = { day: number; guesses: string[]; answer: string };

const isValidText = (value: unknown): value is string =>
  typeof value === "string" && value.length <= MAX_GUESS_LENGTH;

/** Whether an uploaded round is well-formed and from a day that could have been played */
function isValidLegacyRound(round: UnknownLegacyHistoryType, today: number) {
  if (typeof round !== "object" || round === null) return false;
  const { day, guesses, answer } = round;

  // A whole day, after the game launched and before today
  if (typeof day !== "number" || !Number.isInteger(day)) return false;
  if (day < FIRST_DAY() || day >= today) return false;

  // Between 1 and 6 guesses, all of them text
  if (!Array.isArray(guesses)) return false;
  if (guesses.length < 1 || guesses.length > 6) return false;
  if (!guesses.every(isValidText)) return false;

  // And the song of the day
  return isValidText(answer) && answer.length > 0;
}

/**
 * Imports legacy rounds for a user, skipping any day they already have a round for
 * @returns How many rounds were added, or null if the import has closed
 */
export async function importLegacyRounds(userId: string, entries: unknown): Promise<number | null> {
  const today = currentDay();
  if (today >= LEGACY_ENDS) return null;
  if (!Array.isArray(entries)) throw new Error("Invalid legacy history");

  const valid = entries
    .filter((round) => isValidLegacyRound(round, today))
    .map(({ day, guesses, answer }: NarrowedLegacyHistoryType) => ({
      day,
      guesses,
      answer,
      // Worked out here rather than trusting whatever status the browser had
      status: guesses.includes(answer) ? ("WON" as const) : ("LOST" as const),
    }));

  // One round per day. Duplicates in the upload and days already on the account are both dropped.
  const existing = await db.orm.rounds.where({ userId, artist: LEGACY_ARTIST }).select("day").all();
  const taken = new Set(existing.map((round) => round.day));
  const fresh = valid.filter((round) => !taken.has(round.day) && taken.add(round.day));
  if (fresh.length === 0) return 0;

  const createdAt = new Date();
  try {
    return await db.orm.rounds.createAndCount(
      fresh.map((round) => ({ userId, artist: LEGACY_ARTIST, ...round, legacy: true, createdAt })),
    );
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return 0; // Another tab imported at the same time, so we good
    throw err; // we are not good
  }
}
