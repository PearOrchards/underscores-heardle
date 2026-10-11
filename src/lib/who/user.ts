import "server-only";
import { db } from "@prisma/db";
import { MongoFieldFilter } from "@prisma/orm-mongo/query-ast";
import { currentDay } from "@/lib/game/day";
import { getSongForArtistAndDay, type GameState } from "@/lib/game/game-engine";

export async function readUserGame(userId: string, artist: string): Promise<GameState> {
  const day = currentDay();
  const round = await db.orm.rounds.where({ userId, artist, day }).first();

  return {
    artist,
    day,
    guesses: round ? [...round.guesses] : [],
    status: round?.status ?? "PLAYING",
  };
}

export async function readUserGameHistory(userId: string, artist: string) {
  const rounds = await db.orm.rounds
    .where({ userId, artist })
    .where(MongoFieldFilter.neq("status", "PLAYING"))
    .orderBy({ day: -1 })
    .all();

  return rounds.map((round) => ({
    artist,
    day: round.day,
    guesses: [...round.guesses],
    status: round.status,
    answer: round.answer,
  }));
}

export async function writeUserGame(userId: string, prev: GameState, next: GameState): Promise<boolean> {
  const { artist, day, guesses, status } = next;

  // Store the answer as it was when the round ended. Working it out later isn't
  // reliable: adding a song to the artist reshuffles which song past days had.
  const answer = status === "PLAYING"
    ? null
    : (await getSongForArtistAndDay(artist, day)).answer;

  if (prev.guesses.length === 0) {
    try {
      await db.orm.rounds.create({ userId, artist, day, guesses, status, answer, legacy: false, createdAt: new Date() });
      return true;
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return false;
      throw err;
    }
  }

  const updated = await db.orm.rounds
    .where({ userId, artist, day, status: "PLAYING" })
    .where(MongoFieldFilter.of("guesses", "$size", prev.guesses.length))
    .update({ guesses, status, answer });

  return updated !== null;
}
