import "server-only";
import { getAuth } from "@/lib/who/auth-server";
import { headers } from "next/headers";
import { readUserGame, writeUserGame, readUserGameHistory } from "@/lib/who/user";
import { readAnonGame, writeAnonGame } from "@/lib/who/anon";
import type { GameState } from "./game-engine";

/*
 * Loads today's game for whoever's asking - their round if logged in, otherwise the anon cookie.
 * @param artist The artist slug
 * @returns The game state, and a save() that writes back to the same place
 */
export async function loadGame(artist: string) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  const userId = session?.user.id;
  const state = userId ? await readUserGame(userId, artist) : await readAnonGame(artist);

  const save = async (next: GameState) => {
    if (!userId) return writeAnonGame(next);
    if (!(await writeUserGame(userId, state, next))) throw new Error("Save failed, try again");
  };

  return { state, save };
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
