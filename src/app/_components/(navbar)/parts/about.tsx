"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Icon } from "@/app/_components/ui/icon";

export default function About() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Icon name="Info" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>about</DialogTitle>
        <DialogDescription>
          <span>
            A recreation of Heardle for underscores, with all songs taken from
            the tracker (mostly beyond skin purifying treatment).
          </span>
          <span>
            Built by <Link href="https://www.orchards.dev">Pear</Link>, for the{" "}
            <Link href="https://www.youtube.com/playlist?list=PLAEc0HKmIWO-oDNPLi1aL1aazsqdxYhPg">
              daily underscores heardle series.
            </Link>
          </span>
          <span>
            Also please check out the{" "}
            <Link href="https://heardle.apictureof.me/">
              original underscores heardle
            </Link>{" "}
            by shelly, it contains only soundcloud releases for those who want a
            fairer chance
          </span>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
