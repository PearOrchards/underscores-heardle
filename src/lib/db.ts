import mongoose from "mongoose";
declare global {
    var mongoose: any;
}

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connect() {
    const MONGO_URI = process.env.MONGO_URI!;
    if (!MONGO_URI) throw new Error("MONGO_URI has not been defined in .env.local");

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = await mongoose.connect(MONGO_URI, { bufferCommands: false });
        console.log(`MongoDB Connected successfully.`);
        return mongoose;
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}