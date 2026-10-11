import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Icon } from "@/app/_components/ui/icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";

import { Button } from "@/app/_components/ui/button";
import { startOfDay } from "@/lib/game/day";
import type { HistoryEntry } from "@/lib/game/local-history";

const formatDay = (day: number) => startOfDay(day).toLocaleDateString(undefined, { timeZone: "UTC" });

export default function History({ history }: { history: HistoryEntry[] | null }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon name="Clock" className="size-6" />
          game log
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>history</DialogTitle>
        <DialogDescription>
          {history?.length ? (
            <Accordion
              type="multiple"
              className="w-full mt-1 flex flex-col justify-center rounded-none border-4 border-[#4e4e4e]"
            >
              {history.map((round) => (
                  <AccordionItem
                    value={String(round.day)}
                    key={round.day}
                    className="nth-[2n+1]:bg-[#2a2a2a] not-last:border-b-4 border-b-[#4e4e4e]"
                  >
                    <AccordionTrigger className="px-4 hover:bg-[#333] hover:cursor-pointer">
                      <p className="text-base flex-1 font-bold">{formatDay(round.day)}</p>
                      <p className="text-base flex-5">{round.answer}</p>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1.5">
                      {round.guesses.map((guess, index) => (
                        <p key={index} className="ml-4 text-base">
                          <span className="font-semibold">{index + 1}. </span>
                          {guess}
                        </p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <p>No history yet.</p>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
