import { getAuth } from "@/lib/who/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const GET = (req: Request) => toNextJsHandler(getAuth()).GET(req);
export const POST = (req: Request) => toNextJsHandler(getAuth()).POST(req);
