import mongo from '@prisma/orm-mongo/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };
import { getMongoClient, getMongoDb } from '../src/lib/mongo';

type Client = ReturnType<typeof mongo<Contract>>;

let client: Client | undefined;

// Shares Better Auth's client for a single pool; lazy (see src/lib/mongo.ts).
function getClient(): Client {
  client ??= mongo<Contract>({
    contractJson,
    mongoClient: getMongoClient(),
    dbName: getMongoDb().databaseName,
  });
  return client;
}

// Lowkey I've only done this so I can still write db.orm. Still lazy
export const db: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const target = getClient();
    const value = target[prop as keyof Client];
    return typeof value === 'function' ? value.bind(target) : value;
  },
  has: (_target, prop) => prop in getClient(),
});
