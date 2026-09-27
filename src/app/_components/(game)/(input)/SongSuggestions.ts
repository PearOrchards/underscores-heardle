"use server";
import { db } from "@prisma/db";

export async function SongSuggestions(artist: string, query: string): Promise<string[]> {
	if (!artist) throw new Error("No artist provided!");
  const artistData = await db.orm.artists.where({ slug: artist }).first();
	if (!artistData) throw new Error(`Unknown artist: ${artist}`);
	const songList = artistData.songs;

	const songNames = [ ...songList.soundcloud.map((song: any) => song.answer),
		...songList.tracker.map((song: any) => song.answer),
		...songList.deezer.map((song: any) => song.answer)];

	return (query == "") ? songNames : songNames.filter((song) => song.toLowerCase().includes(query.toLowerCase()));
}
