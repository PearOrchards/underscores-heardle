import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { GameState } from "@/lib/game/game-engine";
import { currentDay, endOfDay } from "@/lib/game/day";

const cookieName = (artist: string) => `game_${encodeURIComponent(artist)}`;

const sign = (payload: string) =>
  createHmac("sha256", env("ANON_AUTH_HASH")).update(payload).digest("base64url");

const freshGame = (artist: string): GameState => ({
  artist,
  day: currentDay(),
  guesses: [],
  status: "PLAYING",
});

export async function readAnonGame(artist: string): Promise<GameState> {
  const raw = (await cookies()).get(cookieName(artist))?.value;
  if (!raw) return freshGame(artist);

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return freshGame(artist);

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return freshGame(artist);
  }

  const state = JSON.parse(Buffer.from(payload, "base64url").toString()) as GameState;
  if (state.artist !== artist || state.day !== currentDay()) return freshGame(artist);

  return state;
}

export async function writeAnonGame(state: GameState): Promise<boolean> {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");

  (await cookies()).set(cookieName(state.artist), `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: endOfDay(state.day),
  });

  return true;
}

export async function clearAnonGame(artist: string): Promise<void> {
  (await cookies()).delete(cookieName(artist));
}
