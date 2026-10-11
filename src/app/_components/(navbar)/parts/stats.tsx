"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Icon } from "@/app/_components/ui/icon";
import History from "./history";
import { useHistory } from "@/app/_components/useHistory";
import type { HistoryEntry } from "@/lib/game/local-history";

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

function calculateStats(history: HistoryEntry[]): Stats | undefined {
  const counted = history
    .filter((round) => ["WON", "LOST"].includes(round.status))
    .sort((a, b) => a.day - b.day);
  if (counted.length === 0) return undefined;

  let won = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  const distribution = [0, 0, 0, 0, 0, 0, 0];

  for (const round of counted) {
    if (round.status === "WON") {
      won++;
      distribution[round.guesses.length - 1]++;
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      distribution[6]++;
      currentStreak = 0;
    }
  }

  return {
    played: counted.length,
    won,
    winRate: `${Math.round((won / counted.length) * 100)}%`,
    currentStreak,
    bestStreak,
    distribution,
  };
}

export default function Stats({ artist }: { artist?: string }) {
  const history = useHistory(artist);
  const stats = history ? calculateStats(history) : undefined;

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
          <History history={history} />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
