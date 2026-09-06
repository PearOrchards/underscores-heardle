import { assertEnv } from "@/lib/env";

// Runs once at server start.
export async function register() {
	if (process.env["NEXT_RUNTIME"] !== "nodejs") return;

	try {
		assertEnv();
	} catch (error) {
	  console.error(error instanceof Error ? error.message : error);
	}
}
