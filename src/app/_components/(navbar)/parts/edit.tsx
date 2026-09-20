"use client";

import { authClient } from "@/lib/auth-client";

import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Icon } from "@/app/_components/ui/icon";

export default function Edit({ display, createdBy }: { display?: string; createdBy?: string | null }) {
  const { data: session, isPending } = authClient.useSession();

  if (!session || session.user.id !== createdBy || isPending) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Icon name="Pencil" />
      </DialogTrigger>
      <DialogContent className="lg:w-1/3">
        <DialogTitle>edit</DialogTitle>
        <DialogDescription className="grid grid-cols-[1fr_auto]">
          Want to add (or for whatever reason, remove) a song from the list?
          <Link href={`/artists/${display}/edit`} className="ml-auto">
            <Button variant="default" className="text-white">edit songs</Button>
          </Link>
          Or just verify all the songs are still accessible?
          <Link href={`/artists/${display}/verify`}>
            <Button variant="default" className="text-white">verify songs</Button>
          </Link>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
