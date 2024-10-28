"use server";
import { promises as fs } from "fs";

export type SongData = {
	answer: string;
	link: string;
	source: string;
	offset?: number;
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

export async function SongToday(): Promise<SongData> {
	if (!process.env.HARDLY_RANDOM_SEED) throw new Error("Environment not correctly set up.");
	const seed = parseInt(process.env.HARDLY_RANDOM_SEED);
	
	const file = await fs.readFile(process.cwd() + "/src/app/songList.json", 'utf-8');
	const songList = JSON.parse(file);
	
	const totalSongs: number = songList.soundcloud.length + songList.tracker.length;
	
	const now = new Date();
	const daysSinceEpoch = Math.floor(now.getTime() / 8.64e7); // idx for today
	
	const shuffleRound = Math.floor(daysSinceEpoch / totalSongs);
	const shuffledList = shuffleArray([...songList.soundcloud, ...songList.tracker], seed + shuffleRound);
	
	const todayPick = shuffledList[daysSinceEpoch % totalSongs];
	const source = (songList.soundcloud.indexOf(todayPick) > -1) ? "soundcloud" : "tracker";
	
	return {
		answer: todayPick.answer,
		link: todayPick.link,
		source,
		offset: todayPick.offset,
	};
}

// Wrapper around the SongToday function to avoid spoiling the answer
export async function IsGuessCorrect(guess: string): Promise<boolean> {
	const song = await SongToday();
	return guess === song.answer;
}