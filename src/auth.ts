import NextAuth from "next-auth";
import { MongooseAdapter } from "@brendon1555/authjs-mongoose-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [],
    adapter: MongooseAdapter(process.env.MONGODB_URI!),
})