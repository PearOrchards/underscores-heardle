import { SongToday } from "@/app/_components/SongToday";
import { type NextRequest } from "next/server";
import path from "node:path";
import { readFileSync } from "node:fs";
import { getSoundcloudToken, createAccess } from "@/app/_components/AuthSoundcloud";
import Soundcloud from "soundcloud.ts";

async function getSoundcloudCoverTS(url: string): Promise<string> {
	const sc = new Soundcloud();
	const track = await sc.tracks.get(url);
	if (!track) return ""; // No track found, so no audio

	return track.artwork_url;
}

async function getPillowcaseCover(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/cover/${id}`;
}

export async function GET(req: NextRequest) {
	const artist = req.nextUrl.searchParams.get("artist");
	if (artist === null) return new Response("No artist provided!", { status: 400 });

	const { link, source } = await SongToday(artist);

	let cover;
	switch (source) {
		case "soundcloud":
			cover = await getSoundcloudCoverTS(link);
			break;
		case "tracker":
			cover = await getPillowcaseCover(link);
			break;
		default:
			cover = "";
	}

	let buffer: ArrayBuffer;
	let contentType: string;
	try {
		if (cover === "") throw new Error("No cover found."); // Just so the catch below can pick it up.
		const imageData = await fetch(cover);
		if (!imageData.ok) throw new Error("Couldn't get cover.");
		buffer = await imageData.arrayBuffer();
		contentType = imageData.headers.get("Content-Type") ?? "image/png";
	} catch (err: any) {
		const local = path.join(process.cwd(), "public", "dvd.png");
		buffer = readFileSync(local);
		contentType = "image/png";
	}

	return new Response(buffer, {
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=604800, immutable",
		},
	});
}
export const dynamic = 'force-dynamic';