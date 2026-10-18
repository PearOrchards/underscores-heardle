"use server";
import { db } from "@prisma/db";

export async function SongSuggestions(artist: string, query: string): Promise<string[]> {
	if (!artist) throw new Error("No artist provided!");
  const artistData = await db.orm.artists.where({ slug: artist }).first();
  if (!artistData) throw new Error(`Unknown artist: ${artist}`);
  if (!artistData.songs) throw new Error(`No songs found for artist: ${artist}`);
	const songList = [ ...artistData.songs.soundcloud || [], ...artistData.songs.tracker || [], ...artistData.songs.deezer || [] ];
	const songNames = songList.map(song => song.answer);

	return (query == "") ? songNames : songNames.filter((song) => song.toLowerCase().includes(query.toLowerCase()));
}
