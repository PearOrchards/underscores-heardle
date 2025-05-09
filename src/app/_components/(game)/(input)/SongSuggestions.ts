"use server";
import Artist from "@/../models/Artist";

export async function SongSuggestions(artist: string, query: string): Promise<string[]> {
	if (!artist) throw new Error("No artist provided!");
	const artistData = await Artist.findOne({ slug: artist });
	const songList = artistData.songs;

	const songNames = [ ...songList.soundcloud.map((song: any) => song.answer),
		...songList.tracker.map((song: any) => song.answer) ];

	return (query == "") ? songNames : songNames.filter((song) => song.toLowerCase().includes(query.toLowerCase()));
}