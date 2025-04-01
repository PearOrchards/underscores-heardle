import { SongToday } from "@/app/_components/SongToday";
import { type NextRequest } from "next/server";
import path from "node:path";
import { readFileSync } from "node:fs";
import { getSoundcloudToken, createAccess } from "@/app/_components/AuthSoundcloud";

async function getSoundcloudCoverV2(url: string, retry = false): Promise<string> {
	const access = await getSoundcloudToken();
	// Again using undocumented behaviour
	const resolve = await fetch(`https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`, {
		headers: {
			"Authorization": `Bearer ${access}`,
			"Accept": "application/json",
		}
	});
	if (!resolve.ok) {
		if (resolve.status === 401 && !retry) {
			// Token expired, get a new one
			await createAccess();
			return getSoundcloudCoverV2(url, true);
		} else throw new Error("Couldn't get cover.");
	}
	const resolveJson = await resolve.json();
	if (!resolveJson || !resolveJson.artwork_url) throw new Error("Couldn't get cover.");

	return resolveJson.artwork_url.replace("large", "t250x250"); // Get a larger image to increase quality.
}

// Not removing this yet if the new one has issues like it does with audio.
async function getSoundcloudCover(url: string): Promise<string> {
	const songData = await fetch(`https://api-widget.soundcloud.com/resolve?url=${url}&client_id=${process.env.SOUNDCLOUD_CLIENT}&format=json`)
	const songJson = await songData.json();

	if (!songData.ok || !songJson.artwork_url) throw new Error("Couldn't get cover.")
	return songJson.artwork_url.replace("large", "t250x250"); // Get a larger image to increase quality.
}

async function getPillowcaseCover(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/cover/${id}`;
}

export async function GET(req: NextRequest) {
	const { link, source } = await SongToday();

	let cover;
	switch (source) {
		case "soundcloud":
			cover = await getSoundcloudCoverV2(link);
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