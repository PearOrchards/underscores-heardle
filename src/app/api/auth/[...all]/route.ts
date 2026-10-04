import { getAuth } from "@/lib/who/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(getAuth());
