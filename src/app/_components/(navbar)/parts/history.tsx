import { useEffect, useState } from "react";

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

export default function History() {
  const [history, setHistory] = useState<any>();

  const getHistory = () => {
    const history = window.localStorage.getItem("history");
    if (history) {
      setHistory(JSON.parse(history));
    }
  };

  useEffect(() => {
    getHistory();
    window.addEventListener("gameComplete", getHistory); // custom event handler. fired in game.tsx
  }, []);

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
          {history ? (
            <Accordion
              type="multiple"
              className="w-full mt-1 flex flex-col justify-center rounded-none border-4 border-[#4e4e4e]"
            >
              {Object.entries(history)
                .filter(([, data]: any) => data.guesses)
                .map(([date, data]: any) => (
                  <AccordionItem
                    value={date}
                    key={date}
                    className="nth-[2n+1]:bg-[#2a2a2a] not-last:border-b-4 border-b-[#4e4e4e]"
                  >
                    <AccordionTrigger className="px-4 hover:bg-[#333] hover:cursor-pointer">
                      <p className="text-base flex-1 font-bold">{date}</p>
                      <p className="text-base flex-5">{data.answer}</p>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1.5">
                      {data.guesses.map((guess: string, index: number) => (
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
