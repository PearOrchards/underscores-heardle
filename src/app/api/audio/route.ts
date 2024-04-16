import songToday from "@/app/_components/songToday";

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
	const [song, source] = await songToday();
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