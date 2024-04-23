import songToday from "@/app/_components/songToday";
import { type NextRequest } from "next/server";
import path from "node:path";
import { readFileSync } from "node:fs";

async function getSoundcloudCover(url: string): Promise<string> {
	const songData = await fetch(`https://api-widget.soundcloud.com/resolve?url=${url}&client_id=${process.env.SOUNDCLOUD_CLIENT}&format=json`)
	const songJson = await songData.json();
	
	if (!songData.ok) return "";
	if (!songJson.artwork_url) return ""; // :(
	return songJson.artwork_url;
}

export async function GET(req: NextRequest) {
	const [song, source] = await songToday();
	let buffer: ArrayBuffer;
	
	if (source == "soundcloud") {
		const cover = await getSoundcloudCover(song.link);
		const coverLarge = cover.replace("large", "t250x250"); // Get a larger image to increase quality.
		const imageData = await fetch(coverLarge);
		buffer = await imageData.arrayBuffer();
	} else {
		const local = path.join(process.cwd(), "public", "dvd.svg");
		buffer = readFileSync(local);
	}
	
	return new Response(buffer);
}
export const dynamic = 'force-dynamic';