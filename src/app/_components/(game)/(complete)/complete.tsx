import type { SongData } from "@/app/_components/SongToday";
import { HeardleNumber } from "@/app/_components/HeardleNumber";

import Image from "next/image"; // Try use without caching
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Icon } from "@/app/_components/ui/icon";
import { cn } from "@/lib/utils";

const completionMessages = [
  "how???",
  "amazing!",
  "great job!",
  "nice!",
  "alright!",
  "close one!",
  "unlucky...",
];

const coverLink = (artist: string) => {
  const now = new Date();
  const str = now.toISOString().split("T")[0];
  return `/api/cover?t=${str}&artist=${artist}`;
};

export default function Complete({
  songData,
  guesses,
  artist,
}: {
  songData: SongData | null;
  guesses: string[];
  artist: string;
}) {
  const [copiedSuccessfully, setCopiedSuccessfully] = useState<boolean>(false);
  const [manualCopy, setManualCopy] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const openCopyModal = () => setModalOpen(true);

  const [th, setTH] = useState<number>(0);
  const [uh, setUH] = useState<number>(0);
  const [tm, setTM] = useState<number>(0);
  const [um, setUM] = useState<number>(0);
  const [ts, setTS] = useState<number>(0);
  const [us, setUS] = useState<number>(0);

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const bars = [];
  for (let i = 0; i < 6; i++) {
    if (guesses[i] === songData?.answer) bars.push("bg-[#00aa00]");
    else if (guesses[i]) bars.push("bg-[#aa0000]");
    else if (guesses[i] === "") bars.push("bg-foreground-secondary");
    else bars.push("bg-background-secondary");
  }

  setInterval(() => {
    const now = new Date();
    const diff = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTH(Math.floor(hours / 10));
    setUH(hours % 10);
    setTM(Math.floor(minutes / 10));
    setUM(minutes % 10);
    setTS(Math.floor(seconds / 10));
    setUS(seconds % 10);
  }, 1000);

  const share = async () => {
    let clipboardData = `${artist} heardle #${await HeardleNumber()}\n\n🔊`;
    for (let i = 0; i < 6; i++) {
      if (guesses[i] === songData?.answer) clipboardData += `🟩`;
      else if (guesses[i]) clipboardData += `🟥`;
      else if (guesses[i] === "") clipboardData += `🟨`;
      else clipboardData += `⬛`;
    }
    clipboardData += `\n\n🔗 ${window.location.href}`;

    try {
      navigator.clipboard.writeText(clipboardData).then(
        () => {
          // Success!
          setCopiedSuccessfully(true);
          setTimeout(() => {
            setCopiedSuccessfully(false);
          }, 2000);
        },
        () => {
          // Fallback, rejected
          throw new Error("Rejected"); // Go to catch
        },
      );
    } catch {
      setManualCopy(clipboardData);
      openCopyModal();
    }
  };

  return (
    <section
      className="flex flex-col flex-nowrap justify-between gap-32 items-center p-4 h-2/3 mt-24"
      data-cy="complete"
    >
      <div className="flex flex-row justify-between w-full lg:w-2/5 p-2 bg-link">
        <div className="flex flex-row justify-start">
          <Image
            src={coverLink(artist)}
            width={250}
            height={250}
            alt="Album cover"
            className="h-[6vh] lg:h-[12vh] w-auto aspect-square rounded-sm my-auto"
          />
          <span className="my-auto mx-4 flex flex-col flex-nowrap">
            <p className="text-2xl">underscores</p>
            <p className="text-lg">{songData?.answer}</p>
          </span>
        </div>
        <Link
          href={songData?.link || ""}
          target="_blank"
          rel="noopener noreferrer"
          className="my-auto mx-4 text-xl whitespace-nowrap flex gap-1"
        >
          go ({songData?.source}){" "}
          <Icon name="ChevronRight" className="size-6 my-auto" />
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-foreground-secondary text-4xl">
          {completionMessages[guesses.length - 1]}
        </h1>
        <div className="flex flex-row flex-nowrap justify-center gap-0.5 m-2">
          {bars.map((colour, i) => (
            <div key={i} className={cn("w-6 h-2", colour)}></div>
          ))}
        </div>
        <p className="text-2xl mb-2">
          {guesses.length < 7
            ? `You guessed the song in ${guesses.length} attempt${guesses.length !== 1 ? "s" : ""}!`
            : `You didn't guess the song this time. Better luck tomorrow!`}
        </p>
        {copiedSuccessfully && (
          <p className="text-lg text-foreground-secondary">copied!</p>
        )}

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>no can do!</DialogTitle>
              <DialogDescription>
                turns out I don&apos;t have access to your clipboard! so... if
                you could be so kind and just copy the stuff below? thanks :3
                <pre className="rounded-sm bg-background mx-auto p-4">
                  {manualCopy}
                </pre>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button variant="alt" onClick={share}>
          <Icon name="Share2" className="size-6" />
          share
        </Button>
      </div>

      <div className="text-center mt-[5vh]">
        <h1 className="text-foreground-secondary text-3xl">next heardle in:</h1>
        <p className="text-2xl">
          {th}
          {uh}:{tm}
          {um}:{ts}
          {us}
        </p>
      </div>
    </section>
  );
}
