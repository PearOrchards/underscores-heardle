import { NextRequest } from "next/server";
import { tmpdir } from "os";
import path from "node:path";
import { writeFileSync } from "node:fs";

import { SongToday } from "@/app/_components/SongToday";

import Soundcloud from "soundcloud.ts";
import ffmpeg from "fluent-ffmpeg";

async function getSoundcloudTSAudio(url: string): Promise<string> {
	const sc = new Soundcloud();
	const track = await sc.tracks.get(url);
	if (!track) return ""; // No track found, so no audio

	return sc.util.streamLink(url, "progressive");
}

async function getPillowcaseAudio(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/get/${id}`;
}

export async function GET(request: NextRequest) {
	const { link, source, offset } = await SongToday();
	let audioFile = "";

	switch (source) {
		case "soundcloud":
			audioFile = await getSoundcloudTSAudio(link);
			break;
		case "tracker":
			audioFile = await getPillowcaseAudio(link);
			break;
		default:
			return new Response("Source not implemented", {
				status: 500,
			});
	}
	const duration = request.nextUrl.searchParams.get("duration");

	try {
		// Save file first to temp dir, speeds up ffmpeg processing
		const tempFile = path.join(tmpdir(), "audio.mp3");
		const res = await fetch(audioFile);
		const buffer = Buffer.from(await res.arrayBuffer());
		writeFileSync(tempFile, buffer);

		// Trim file down
		const command = ffmpeg(tempFile)
			.setStartTime(offset || 0)
			.setDuration(duration || 32)
			.audioCodec("libmp3lame")
			.format("mp3");

		const chunks: Uint8Array[] = []; // Buffer chunks to concatenate later

		command.on("error", err => {
			console.error(err);
			throw new Response("FFMPEG_ERROR", { status: 500 });
		});

		// Pipe the output from ffmpeg to a stream
		const stream = command.pipe();
		stream.on("data", chunk => chunks.push(chunk));

		// Wait for the stream to finish
		await new Promise<void>((resolve, reject) => {
			stream.on("end", resolve);
			stream.on("error", reject);
		});

		// Add everything together, and send it
		const finalBuffer = Buffer.concat(chunks);
		return new Response(finalBuffer, {
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": finalBuffer.length.toString(),
				"X-Offset": offset ? offset.toString() : "",
			}
		});
	} catch (err) {
		console.error(err);
		throw new Response("API_UNKNOWN_ERROR", { status: 500 });
	}
}
export const dynamic = 'force-dynamic';