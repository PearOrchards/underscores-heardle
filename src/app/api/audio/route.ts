import { SongToday } from "@/app/_components/SongToday";
import { getSoundcloudToken, createAccess } from "@/app/_components/AuthSoundcloud";
import Soundcloud from "soundcloud.ts";


async function getSoundcloudTSAudio(url: string): Promise<string> {
	const sc = new Soundcloud();
	const track = await sc.tracks.get(url);
	if (!track) return ""; // No track, no audio

	return sc.util.streamLink(url, "progressive");
}

async function getSoundcloudAudioV2(url: string, retry = false): Promise<string> {
	const access = await getSoundcloudToken();
	// Following code is undocumented in API, but seemingly works?
	const resolve = await fetch(`https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`, {
		headers: {
			"Authorization": `Bearer ${access}`,
			"Accept": "application/json",
		}
	});
	if (!resolve.ok) {
		const err = await resolve.json();
		if (resolve.status === 401 && !retry) {
			// Token expired, get a new one
			await createAccess();
			return getSoundcloudAudioV2(url, true);
		} else {
			return getSoundcloudAudio(url); // Some other error, try fallback.
		}
	}
	// This is the weird bit. We *should* get a 302, saying "yup go here" but instead it just... returns the track info.
	const resolveJson = await resolve.json();
	if (!resolveJson || !resolveJson.id) return ""; // No ID, no track
	if (resolveJson.access !== "playable") return getSoundcloudAudio(url); // Fallback for "private" tracks

	const audioData = await fetch(`https://api.soundcloud.com/tracks/${resolveJson.id}/streams`, {
		headers: {
			"Authorization": `Bearer ${access}`,
			"Accept": "application/json",
		}
	});
	if (!audioData.ok) return "";
	const audioJson = await audioData.json();
	if (!audioJson || !audioJson.http_mp3_128_url) return ""; // No URL, no track

	return audioJson.http_mp3_128_url;
}

/**
 * Fallback in case the v2 fails, which it will for songs that have stats hidden, for some bizarre reason.
 */
async function getSoundcloudAudio(url: string): Promise<string> {
	const songData = await fetch(`https://api-widget.soundcloud.com/resolve?url=${url}&client_id=${process.env.FALLBACK_CLIENT}&format=json`)
	if (!songData.ok) return ""; // Likely 401, update the .env file with a new client ID
	const songJson = await songData.json();

	if (!songData.ok) return "";
	if (songJson.media.transcodings[1].format.protocol !== "progressive") return ""; // :(
	const newURL = songJson.media.transcodings[1].url;

	const trackData = await fetch(newURL + `?client_id=${process.env.FALLBACK_CLIENT}`);
	const trackJson = await trackData.json();

	if (!trackData.ok || !trackJson.url) return "";
	return trackJson.url;
}

async function getPillowcaseAudio(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/get/${id}`;
}

export async function GET() {
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

	try {
		const audio = await fetch(audioFile, {
			signal: AbortSignal.timeout(5000) // Give up after 5 seconds
		});
		const audioBuffer = await audio.arrayBuffer();

		return new Response(audioBuffer, {
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": audioBuffer.byteLength.toString(),
				"X-Offset": offset ? offset.toString() : "",
			}
		})
	} catch (err: any) {
		if (err.name == "TimeoutError") { // AbortSignal throws this error
			return new Response("API_TIMEOUT", {
				status: 408,
			})
		} else if (err.name == "AbortError") { // Thrown if user clicks a "stop" button
			return new Response("API_ABORTED", {
				status: 418, // Is this is an appropriate use of this status code? No? But it's funny?
			})
		} else { // Catch-all
			return new Response("API_UNKNOWN_ERROR", {
				status: 500,
			})
		}
	}
}
export const dynamic = 'force-dynamic';