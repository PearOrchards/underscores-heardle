"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Icon } from "@/app/_components/ui/icon";

export default function Login() {
  const { data: session, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/callback",
      newUserCallbackURL: "/callback/new",
    });
  };

  const signOut = async () => {
    setBusy(true);
    await authClient.signOut();
    setBusy(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Icon name={session ? "CircleUserRound" : "LogIn"} />
      </DialogTrigger>
      <DialogContent className="lg:w-1/3">
        <DialogTitle>{session ? "account" : "login"}</DialogTitle>
        {session ? (
          <>
            <DialogDescription className="flex flex-col text-center">
              Signed in as {session.user.name || session.user.email}
            </DialogDescription>
            <Button onClick={signOut} disabled={busy}>
              sign out
            </Button>
          </>
        ) : (
          <>
            <DialogDescription className="flex flex-col text-center">
              You can now sync your game data and stuff across devices now. Or,
              y&#39;know, don&#39;t login.
            </DialogDescription>
            <Button onClick={signIn} disabled={busy || isPending}>
              continue with google
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
