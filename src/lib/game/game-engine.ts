import "server-only";
import { db } from "@prisma/db";
import { env } from "@/lib/env";
import { applicationSources } from "./song-sources";
import { currentDay } from "./day";

export type GameState = {
  artist: string;
  day: number;
  guesses: string[];
  status: "PLAYING" | "WON" | "LOST" | "FORFEIT";
}

/*
 * Random number generator seeded with a number.
 * @param seed The seed to use
 * @returns A random number!
 */
function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/*
 * Shuffle an array using the Fisher-Yates algorithm, making results consistent.
 * @param array The array to shuffle
 * @param seed The seed to use
 * @returns A shuffled array
 * @uses seededRandom
 */
function shuffleArray<T>(array: T[], seed: number): T[] {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(seededRandom(seed++) * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

export const getSongForArtistAndDay = async (artist: string, day: number) => {
  if (!artist) throw new Error("No artist provided!");
  if (!day) throw new Error("No day provided!");

  const seed = parseInt(env("HARDLY_RANDOM_SEED"));

  const artistData = await db.orm.artists.where({ slug: artist }).first();
  if (!artistData) throw new Error("Artist not found!");
  const songList = artistData.songs;

  const sources = applicationSources.map((source) => source.identifier);
  const allSongs = sources
    .flatMap((source) => (songList[source] ?? [])
    .map((song) => ({ song, source })));

  const circularShuffle = Math.floor(day / allSongs.length)
  const shuffledList = shuffleArray(allSongs, seed + circularShuffle);

  const { song, source } = shuffledList[day % allSongs.length];

  return {
    answer: song.answer,
    link: song.link,
    source,
    offset: song.offset ?? 0,
  };
};

export const getTodaysSongForArtist = async (artist: string) => {
  return await getSongForArtistAndDay(artist, currentDay());
}

export const performGuess = async (state: GameState, guess: string): Promise<GameState> => {
  if (state.status !== "PLAYING") throw new Error("Illegal move - game already completed");
  if (typeof guess !== "string" || guess.length > 256) throw new Error("Illegal move - guess invalid")

  const { answer } = await getSongForArtistAndDay(state.artist, state.day);

  const newGuesses = [...state.guesses, guess];
  const newStatus = guess === answer
    ? "WON"
    : (newGuesses.length >= 6 ? "LOST" : "PLAYING");

  return {
    ...state,
    guesses: newGuesses,
    status: newStatus,
  }
}
