import { SongToday } from "@/app/_components/SongToday";
import { type NextRequest } from "next/server";
import path from "node:path";
import { readFileSync } from "node:fs";

async function getSoundcloudCover(url: string): Promise<string> {
	const songData = await fetch(`https://api-widget.soundcloud.com/resolve?url=${url}&client_id=${process.env.SOUNDCLOUD_CLIENT}&format=json`)
	const songJson = await songData.json();
	
	if (!songData.ok || !songJson.artwork_url) throw new Error("Couldn't get cover.")
	return songJson.artwork_url.replace("large", "t250x250"); // Get a larger image to increase quality.
}

export async function GET(req: NextRequest) {
	const { link, source } = await SongToday();
	let buffer: ArrayBuffer;
	
	try {
		if (source == "soundcloud") {
			const cover = await getSoundcloudCover(link);
			const imageData = await fetch(cover);
			buffer = await imageData.arrayBuffer();
		} else {
			throw new Error("Source not implemented");
		}
	} catch (err: any) {
		const local = path.join(process.cwd(), "public", "dvd.svg");
		buffer = readFileSync(local);
	}
	
	return new Response(buffer, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=604800, immutable",
		},
	});
}
export const dynamic = 'force-dynamic';