"use server";
import { promises as fs } from "fs";

export default async function songToday() {
	if (!process.env.HARDLY_RANDOM_SEED) throw new Error("Environment not correctly set up.");
	
	const file = await fs.readFile(process.cwd() + "/src/app/songList.json", 'utf-8');
	const songList = JSON.parse(file);
	
	const totalSongs: number = songList.soundcloud.length + songList.tracker.length;
	
	const now = new Date();
	const daysSinceEpoch = Math.floor(now.getTime() / 8.64e7);
	const todayPick = daysSinceEpoch * parseInt(process.env.HARDLY_RANDOM_SEED) % totalSongs;
	
	const song = todayPick < songList.soundcloud.length
		? songList.soundcloud[todayPick]
		: songList.tracker[todayPick - songList.soundcloud.length];
	const source = todayPick < songList.soundcloud.length ? "soundcloud" : "tracker";
	return [ song, source ];
}