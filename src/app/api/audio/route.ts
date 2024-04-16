import { promises as fs } from "fs";

async function getSoundcloudAudio(url: string): Promise<string> {
	const songData = await fetch(`https://api-widget.soundcloud.com/resolve?url=${url}&client_id=${process.env.SOUNDCLOUD_CLIENT}&format=json`)
	const songJson = await songData.json();
	
	if (!songData.ok) return "";
	if (songJson.media.transcodings[1].format.protocol !== "progressive") return ""; // :(
	const newURL = songJson.media.transcodings[1].url;
	
	const trackData = await fetch(newURL + `?client_id=${process.env.SOUNDCLOUD_CLIENT}`);
	const trackJson = await trackData.json();
	
	if (!trackData.ok || !trackJson.url) return "";
	return trackJson.url;
}

async function getPillowcaseAudio(url: string): Promise<string> {
	const id = url.split("/").pop();
	return `https://api.pillowcase.su/api/get/${id}`;
}

export async function GET() {
	if (!process.env.HARDLY_RANDOM_SEED) return { status: 500, body: "Environment not correctly set up." };
	
	const file = await fs.readFile(process.cwd() + "/src/app/songList.json", 'utf-8');
	const songList = JSON.parse(file);
	
	const totalSongs: number = songList.soundcloud.length + songList.dubious.length;
	
	const now = new Date();
	const daysSinceEpoch = Math.floor(now.getTime() / 8.64e7);
	const todayPick = daysSinceEpoch * parseInt(process.env.HARDLY_RANDOM_SEED) % totalSongs;
	
	const song = todayPick < songList.soundcloud.length
		? songList.soundcloud[todayPick]
		: songList.dubious[todayPick - songList.soundcloud.length];
	const source = todayPick < songList.soundcloud.length ? "soundcloud" : "dubious";
	
	let audioFile = "";
	
	switch (source) {
		case "soundcloud":
			audioFile = await getSoundcloudAudio(song.link);
			break;
		case "dubious":
			audioFile = await getPillowcaseAudio(song.link);
			break;
		default:
			return { status: 500, body: "Source not implemented." };
	}
	
	const audio = await fetch(audioFile);
	const audioBuffer = await audio.arrayBuffer();
	
	return new Response(audioBuffer, {
		headers: {
			"Content-Type": "audio/mpeg",
			"Content-Length": audioBuffer.byteLength.toString(),
		}
	})
}
export const dynamic = 'force-dynamic';