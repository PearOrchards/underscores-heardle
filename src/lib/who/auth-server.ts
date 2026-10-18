import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getMongoClient, getMongoDb } from "@/lib/mongo";
import { env } from "@/lib/env";
import { nextCookies } from "better-auth/next-js";

function createAuth() {
	return betterAuth({
		database: mongodbAdapter(getMongoDb(), { client: getMongoClient() }),
		socialProviders: {
			google: {
				clientId: env("GOOGLE_CLIENT_ID"),
				clientSecret: env("GOOGLE_CLIENT_SECRET"),
			},
    },
		plugins: [nextCookies()],
	});
}

let instance: ReturnType<typeof createAuth> | undefined;

// Lazy so `next build` doesn't need a reachable database.
export function getAuth() {
	instance ??= createAuth();
	return instance;
}
