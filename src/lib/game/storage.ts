import "server-only";
import { getAuth } from "@/lib/who/auth-server";
import { headers } from "next/headers";
import { readUserGame, writeUserGame, readUserGameHistory } from "@/lib/who/user";
import { readAnonGame, writeAnonGame, clearAnonGame } from "@/lib/who/anon";
import type { GameState } from "./game-engine";

/*
 * Loads today's game for whoever's asking - their round if logged in, otherwise the anon cookie.
 * @param artist The artist slug
 * @returns The game state, and a save() that writes back to the same place
 */
export async function loadGame(artist: string) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const userId = session?.user.id;
  const state = userId ? await importAnonGame(userId, artist) : await readAnonGame(artist);

  const save = async (next: GameState) => {
    if (!userId) return writeAnonGame(next);
    if (!(await writeUserGame(userId, state, next))) throw new Error("Save failed, try again");
  };

  return { state, save };
}

/*
 * Reads a logged-in user's game, first moving over any game they played today before logging in.
 * Only signed cookies are imported, and only if they haven't started a round on their account.
 */
async function importAnonGame(userId: string, artist: string): Promise<GameState> {
  const state = await readUserGame(userId, artist);
  const anon = await readAnonGame(artist);
  const anonStarted = anon.guesses.length > 0 || anon.status !== "PLAYING";
  if (!anonStarted) return state;

  const accountStarted = state.guesses.length > 0 || state.status !== "PLAYING";
  if (!accountStarted && (await writeUserGame(userId, state, anon))) {
    await clearAnonGame(artist);
    return anon;
  }

  // Account already has today's round (or another request imported it first), so the cookie is spent.
  await clearAnonGame(artist);
  return accountStarted ? state : readUserGame(userId, artist);
}

/**
 * Reads the user's game history for a specific artist.
 * @param artist The artist slug
 * @returns An array of game states, or null if the user is not authenticated
 */
export async function readHistory(artist: string) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;

  const userId = session.user.id;
  return await readUserGameHistory(userId, artist);
}
