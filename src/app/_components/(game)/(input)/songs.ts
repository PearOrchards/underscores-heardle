"use server";
import { promises as fs } from 'fs';

export async function songs(query: string): Promise<string[]> {
	const file = await fs.readFile(process.cwd() + "/src/app/songList.json", 'utf-8');
	const songList = JSON.parse(file);
	
	const songNames = [ ...songList.soundcloud.map((song: any) => song.answer),
		...songList.dubious.map((song: any) => song.answer) ];
	
	return (query == "") ? songNames : songNames.filter((song) => song.toLowerCase().includes(query.toLowerCase()));
}