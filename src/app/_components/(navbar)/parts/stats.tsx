"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Icon } from "@/app/_components/ui/icon";
import History from "./history";

interface Stats {
  played: number;
  won: number;
  winRate: string;
  currentStreak: number;
  bestStreak: number;
  distribution: number[];
}

type KeyState = keyof Omit<Stats, "distribution">;

const StatsKeyDescriptions = {
  played: "played",
  won: "won",
  winRate: "win rate",
  currentStreak: "current streak",
  bestStreak: "best streak",
  distribution: "distribution",
} as Record<KeyState, string>;

export default function Stats() {
  const [stats, setStats] = useState<Stats>();

  const updateStats = () => {
    const history = window.localStorage.getItem("history");
    if (history) {
      const parsed = JSON.parse(history);
      let played = 0;
      let won = 0;
      let currentStreak = 0;
      let bestStreak = 0;
      const distribution = [0, 0, 0, 0, 0, 0, 0];

      Object.entries(parsed).forEach(([date, data]: any) => {
        played++;
        if (data.guesses) {
          distribution[data.guesses.length - 1]++;
          if (data.guesses.length >= 7) currentStreak = 0;
          else {
            won++;
            currentStreak++;
            if (currentStreak > bestStreak) bestStreak = currentStreak;
          }
        }
      });

      setStats({
        played,
        won,
        winRate: `${played > 0 ? Math.round((won / played) * 100) : 0}%`,
        currentStreak,
        bestStreak,
        distribution,
      });
    }
  };

  useEffect(() => {
    updateStats();
    window.addEventListener("gameComplete", updateStats); // custom event handler. fired in game.tsx
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Icon name="ChartNoAxesColumn" />
      </DialogTrigger>
      <DialogContent className="lg:w-1/3">
        <DialogTitle>stats</DialogTitle>
        <DialogDescription className="flex flex-col">
          <div className="flex flex-row flex-nowrap justify-center items-end gap-2">
            {stats?.distribution
              ? stats.distribution.map((data: number, itr: number) => {
                  return (
                    <div className="mb-0" key={itr}>
                      <p className="text-base text-center mt-1 mx-auto mb-0 p-0">
                        {data}
                      </p>
                      <div
                        className="mb-0 w-8 min-h-2.5 bg-foreground-secondary"
                        style={{ height: `${(data * 200) / stats.played}px` }}
                      ></div>
                      <p className="text-base text-center mt-1 mx-auto mb-0 p-0 text-foreground-secondary">
                        {itr === 6 ? "x" : itr + 1}
                      </p>
                    </div>
                  );
                })
              : null}
          </div>
          <div className="text-center flex flex-row flex-wrap justify-center gap-4">
            {!stats ? (
              <p>sorry! nothing here!</p>
            ) : (
              Object.keys(StatsKeyDescriptions)
                .filter((key: string) => key != "distribution")
                .map((key: string) => (
                  <div key={key} className="min-w-1/4">
                    {stats[key as KeyState]}
                    <br />
                    <span className="text-foreground-secondary text-xl">
                      {StatsKeyDescriptions[key as KeyState]}
                    </span>
                  </div>
                ))
            )}
          </div>
          <History />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
