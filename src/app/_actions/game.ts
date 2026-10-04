"use server";
import {
  getTodaysSongForArtist,
  performGuess,
  type GameState
} from "@/lib/game/game-engine";
import { loadGame, readHistory } from "@/lib/game/storage";

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
    ? await getTodaysSongForArtist(assertArtist(artist))
    : undefined;

  return { artist, day, guesses, status, song };
}

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

export async function skip(artist: string) {
  const { state, save } = await loadGame(assertArtist(artist));
  const next = await performGuess(state, "");
  await save(next);
  return view(next);
}

/** Clarification: This is intended for when the song cannot be loaded, not giving up */
export async function forfeit(artist: string) {
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
