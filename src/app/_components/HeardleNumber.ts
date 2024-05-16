"use server";

export async function HeardleNumber(): Promise<number> {
	if (!process.env.UNIX_TIMESTAMP_DAY_1) throw new Error("Environment not correctly set up.");
	
	const epochSinceDay1 = Date.now() - parseInt(process.env.UNIX_TIMESTAMP_DAY_1);
	return Math.floor(epochSinceDay1 / 8.64e7);
}