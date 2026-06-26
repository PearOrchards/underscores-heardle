"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Icon, type IconType } from "@/app/_components/ui/icon";
import { Button } from "@/app/_components/ui/button";

const lines = [
  {
    icon: "Music",
    text: "Listen to the intro, then find the correct song in the list.",
  },
  {
    icon: "Volume2",
    text: "Skipped or incorrect attempts unlock more of the song.",
  },
  {
    icon: "ThumbsUp",
    text: "Answer in as few attempts as possible, then share you score!",
  },
] as { icon: IconType; text: string }[];

export default function Help() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Icon name="CircleQuestionMark" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>how to play</DialogTitle>
        <DialogDescription>
          <ul className="space-y-4">
            {lines.map(({ icon, text }) => (
              <li key={icon} className="flex gap-2">
                <Icon name={icon} />
                {text}
              </li>
            ))}
          </ul>
          <i className="ml-auto mr-2 text-4xl font-bold">good luck!</i>

          <Button variant="alt">PLAY</Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
