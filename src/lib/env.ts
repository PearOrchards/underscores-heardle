// Every env key the app needs at runtime. Validated as a set at server start by
// src/instrumentation.ts, which Next does not run during `next build`.
const REQUIRED = [
	"DATABASE_URL",
	"BETTER_AUTH_URL",
	"BETTER_AUTH_SECRET",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"HARDLY_RANDOM_SEED",
	"UNIX_TIMESTAMP_DAY_1",
  "URL",
	"ANON_AUTH_HASH"
] as const;

/** Reads a required key, throwing if it is missing or empty. */
export function env(key: (typeof REQUIRED)[number]): string {
	const value = process.env[key];
	if (!value) throw new Error(`${key} is not set.`);
	return value;
}

/** Throws naming every missing key at once, rather than one per restart. */
export function assertEnv(): void {
	const missing = REQUIRED.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(`FATAL: Missing required environment variables: ${missing.join(", ")}`);
	}
}
