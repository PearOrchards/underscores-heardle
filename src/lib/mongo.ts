import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

// One client shared by BetterAuth and Prisma

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

export function getMongoClient(): MongoClient {
	// Singleton on globalThis so dev HMR doesn't leak per reload
	const cached = globalForMongo.mongoClient;
	if (cached) return cached;

	const client = new MongoClient(env("DATABASE_URL"));
	globalForMongo.mongoClient = client;
	return client;
}

/** The database named in DATABASE_URL. */
export function getMongoDb(): Db {
	return getMongoClient().db();
}
