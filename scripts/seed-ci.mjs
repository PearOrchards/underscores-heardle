// Seeds the minimal data the e2e suite needs from a real Mongo.
// Since all the APIs are stubbed, we only need the bare minimum here.
import mongoose from "mongoose";

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

await mongoose.connect(uri, { dbName: "heardle" });

await mongoose.connection.collection("artists").updateOne(
  { slug: "underscores" },
  {
    $set: {
      slug: "underscores",
      displayName: "underscores",
      colour: "#8b5cf6",
      lastAccessed: new Date(),
      songs: { soundcloud: [], tracker: [] },
    },
  },
  { upsert: true },
);

console.log("Seeded artist: underscores!");
await mongoose.disconnect();
