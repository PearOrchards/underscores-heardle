// Seeds the minimal data the e2e suite needs from a real Mongo.
// Since all the APIs are stubbed, we only need the bare minimum here.
import { MongoClient } from "mongodb";
// Using mongodb directly just in case we switch again (probably not)

const client = new MongoClient(process.env.DATABASE_URL);
await client.db().collection("artists").updateOne(
  { slug: "underscores" },
  {
    $set: {
      slug: "underscores",
      displayName: "underscores",
      colour: "#607e96",
      lastAccessed: new Date(),
      songs: { soundcloud: [], tracker: [], deezer: [] },
    }
  },
  { upsert: true }
);

console.log("Seeded artist: underscores!");
await client.close();
