"use server";
import { getSongForArtistAndDay, performGuess, type GameState } from "@/lib/game/game-engine";
import { loadGame, readHistory } from "@/lib/game/storage";
import { importLegacyRounds } from "@/lib/game/legacy-import";
import { getAuth } from "@/lib/who/auth-server";
import { headers } from "next/headers";

/**
 * Although artist is typed as string, a user could still send
 * malformed data to the server. So check before using it
 */
const assertArtist = (artist: unknown): string => {
  if (typeof artist !== "string" || !artist) throw new Error("Invalid artist provided.");
  return artist;
}

async function view({ artist, day, guesses, status }: GameState) {
  const song = status !== "PLAYING"
    ? await getSongForArtistAndDay(artist, day)
    : undefined;

  return { artist, day, guesses, status, song };
}

export type GameView = Awaited<ReturnType<typeof view>>;

export async function getTodayGame(artist: string) {
  const { state } = await loadGame(assertArtist(artist));
  return await view(state);
}

export async function submitGuess(artist: string, guess: string) {
  if (typeof guess !== "string") throw new Error("what are you doing go away")

  const { state, save } = await loadGame(assertArtist(artist));
  const next = await performGuess(state, guess);
  await save(next);
  return view(next);
}

export async function submitSkip(artist: string) {
  const { state, save } = await loadGame(assertArtist(artist));
  const next = await performGuess(state, "");
  await save(next);
  return view(next);
}

/** Clarification: This is intended for when the song cannot be loaded, not giving up */
export async function submitForfeit(artist: string) {
  const { state, save } = await loadGame(assertArtist(artist));
  if (state.status !== "PLAYING") throw new Error("Illegal move - game already completed");

  const next: GameState = {
    ...state,
    status: state.guesses.length === 0 ? "FORFEIT" : "LOST",
  };
  await save(next);
  return view(next);
}

export async function getHistory(artist: string) {
  return await readHistory(assertArtist(artist));
}

/**
 * Copies pre-cloud history to the logged-in account
 * @deprecated Only during October 2026
 */
export async function importLegacyHistory(entries: unknown) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) throw new Error("Log in to import your history");
  return await importLegacyRounds(session.user.id, entries);
}
