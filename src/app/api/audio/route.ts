import { SongToday } from "@/app/_components/SongToday";
import { getSoundcloudToken, createAccess } from "@/app/_components/AuthSoundcloud";

async function getSoundcloudAudio(url: string): Promise<string> {
	const songData = await fetch(`https://api-widget.soundcloud.com/resolve?url=${url}&client_id=${process.env.SOUNDCLOUD_CLIENT}&format=json`)
	if (!songData.ok) return ""; // Likely 401, update the .env file with a new client ID
	const songJson = await songData.json();

	if (!songData.ok) return "";
	if (songJson.media.transcodings[1].format.protocol !== "progressive") return ""; // :(
	const newURL = songJson.media.transcodings[1].url;

	const trackData = await fetch(newURL + `?client_id=${process.env.SOUNDCLOUD_CLIENT}`);
	const trackJson = await trackData.json();

	if (!trackData.ok || !trackJson.url) return "";
	return trackJson.url;
}

// async function getSoundcloudAudioV2(url: string): Promise<string> {
// 	// const access = await getSoundcloudToken();
// 	const songData = await fetch(`https://api.soundcloud.com/tracks/${}`)
// }

async function getPillowcaseAudio(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/get/${id}`;
}

export async function GET() {
	const { link, source, offset } = await SongToday();
	let audioFile = "";

	switch (source) {
		case "soundcloud":
			audioFile = await getSoundcloudAudio(link);
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