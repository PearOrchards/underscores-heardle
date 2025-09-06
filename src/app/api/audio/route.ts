import {NextRequest} from "next/server";
import {tmpdir} from "os";
import path from "node:path";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

import {SongToday} from "@/app/_components/SongToday";

import Soundcloud from "soundcloud.ts";
import ffmpeg from "fluent-ffmpeg";

import prisma from "@/lib/prisma";

async function getSoundcloudTSAudio(url: string): Promise<string> {
	const sc = new Soundcloud();
	const track = await sc.tracks.get(url);
	if (!track) return ""; // No track found, so no audio

	return await sc.util.streamLink(url, "progressive");
}

async function getPillowcaseAudio(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/get/${id}`;
}

/**
 * Processes an audio file by downloading it and trimming it to the specified offset and duration.
 * @param audioFile - The URL of the audio file to process.
 * @param slug - The slug of the artist to associate with the audio file.
 * @param offset - Seconds to start the audio from. Leave undefined to start from the beginning.
 * @param duration - Duration of the audio in seconds. Leave undefined to get the whole file.
 */
async function processAudioFile(audioFile: string, slug: string, offset?: number, duration?: number): Promise<Buffer> {
	// First, when was the last time we downloaded a song for this artist?
	const artist = await prisma.artists.findUnique({ where: { slug } });
	if (!artist) throw new Error("How have we got here with NO ARTIST!?");

	const tempFile = path.join(tmpdir(), `${btoa(slug)}.mp3`);
	const midnight = new Date();
	midnight.setUTCHours(0, 0, 0, 0);

	// Has it been accessed today, or does the file not even exist?
	if (!existsSync(tempFile) || !artist.lastAccessed || artist.lastAccessed.getTime() < midnight.getTime()) {
		// If not, it needs to be downloaded.
		const res = await fetch(audioFile);
		if (!res.ok) throw new Error("Failed to fetch audio from remote.");

		const buffer = Buffer.from(await res.arrayBuffer());
		writeFileSync(tempFile, buffer);

		// Delete any old cut tracks in the temp directory
		readdirSync(tmpdir()).forEach(file => {
			if (file.match(new RegExp(`^${btoa(slug)}-\\d+\\.mp3$`))) {
				unlinkSync(path.join(tmpdir(), file));
			}
		});
	}

	// Update the last accessed date
	await prisma.artists.update({
		where: { slug },
		data: {
			lastAccessed: new Date(),
		},
	});

	// If there's no duration, just return the whole thing
	if (!duration) {
		console.log(`Returning full file for ${slug}`);
		return readFileSync(tempFile);
	}
	// Else, is there a file with the duration already?
	const durationTempFile = path.join(tmpdir(), `${btoa(slug)}-${duration}.mp3`);
	if (existsSync(durationTempFile)) {
		console.log(`Returning cached file for ${slug} (${duration}s)`);
		return readFileSync(durationTempFile);
	}
	// If not, we need to trim it down
	console.log(`Creating ${slug}-${duration}s file...`);

	// Trim file down
	const command = ffmpeg(tempFile)
		.setStartTime(offset || 0)
		.setDuration(duration)
		.audioCodec("libmp3lame")
		.audioBitrate("96k")
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

	// Save the file to the temp directory
	writeFileSync(durationTempFile, finalBuffer);

	return finalBuffer;
}

export async function GET(request: NextRequest) {
	const artist = request.nextUrl.searchParams.get("artist");
	const duration = request.nextUrl.searchParams.get("duration");
	if (artist === null) return new Response("No artist provided!", { status: 400 });

	const { link, source, offset } = await SongToday(artist);
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

	try {
		const finalBuffer = await processAudioFile(audioFile, artist, offset || 0, Number(duration));
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