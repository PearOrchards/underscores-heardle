"use server";
import { env } from "@/lib/env";

export async function HeardleNumber(): Promise<number> {
	const epochSinceDay1 = Date.now() - parseInt(env("UNIX_TIMESTAMP_DAY_1"));
	return Math.floor(epochSinceDay1 / 8.64e7);
}