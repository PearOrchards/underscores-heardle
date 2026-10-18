"use server";
import { env } from "@/lib/env";
import { DAY_MS } from "@/lib/game/day";

export async function HeardleNumber(): Promise<number> {
	const epochSinceDay1 = Date.now() - parseInt(env("UNIX_TIMESTAMP_DAY_1"));
	return Math.floor(epochSinceDay1 / DAY_MS);
}