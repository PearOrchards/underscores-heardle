import { type NextRequest } from "next/server";
import path from "node:path";
import { readFileSync } from "node:fs";
import Soundcloud from "soundcloud.ts";

import { getTodaysSongForArtist } from "@/lib/game/game-engine";
import { loadGame } from "@/lib/game/storage";

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

async function getDeezerCover(url: string): Promise<string> {
  const id = url.split("/").pop();
  const songData = await fetch(`https://api.deezer.com/track/${id}`);
  const data = await songData.json();
  return data.album.cover_medium ?? "";
}

export async function GET(req: NextRequest) {
	const artist = req.nextUrl.searchParams.get("artist");
	if (artist === null) return new Response("No artist provided!", { status: 400 });

  const { link, source } = await getTodaysSongForArtist(artist);
  const { state: gameState } = await loadGame(artist);
  if (gameState.status === "PLAYING") return new Response("Not yet!", { status: 403 });

	let cover;
	switch (source) {
		case "soundcloud":
			cover = await getSoundcloudCoverTS(link);
			break;
		case "tracker":
			cover = await getPillowcaseCover(link);
      break;
    case "deezer":
      cover = await getDeezerCover(link);
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

		const fetchedType = imageData.headers.get("Content-Type");
		if (!fetchedType || !fetchedType.startsWith("image/")) throw new Error("Cover isn't an image.");
		buffer = await imageData.arrayBuffer();
		contentType = fetchedType ?? "image/png";
	} catch (err: any) {
		const local = path.join(process.cwd(), "public", "dvd.png");
		buffer = new Uint8Array(readFileSync(local)).buffer;
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
