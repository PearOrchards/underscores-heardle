"use client";
import { useState, useEffect } from "react";

import AttemptBox from "./(attemptBox)/attemptBox";
import Player from "@/app/_components/(game)/(player)/player";
import Input from "@/app/_components/(game)/(input)/input";
import Complete from "@/app/_components/(game)/(complete)/complete";

import {
  getTodayGame,
  submitGuess,
  submitSkip,
  submitForfeit,
} from "@/app/_actions/game";
import { authClient } from "@/lib/who/auth-client";
import { saveLocalHistory } from "@/lib/game/local-history";
import type { GameView } from "@/app/_actions/game";

export default function Game({ artist }: { artist: string }) {
  const [game, setGame] = useState<GameView | null>(null);
  const [doNotAutoplay, setDoNotAutoplay] = useState<boolean>(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    console.log(`hello! now loading up ${artist}'s heardle`);

    getTodayGame(artist).then((view) => {
      if (view.status !== "PLAYING") setDoNotAutoplay(true); // Already done, autoplay won't work
      setGame(view);
    });
  }, [artist]);

  const apply = (view: GameView) => {
    setGame(view);
    if (view.status === "PLAYING") return;

    // Logged-in players' history is on the server; everyone else's lives in this browser.
    if (!isPending && !session) {
      saveLocalHistory({
        artist: view.artist,
        day: view.day,
        guesses: view.guesses,
        status: view.status,
        answer: view.song?.answer ?? null,
      });
    }

    // firing custom event (received in useHistory)
    window.dispatchEvent(new Event("gameComplete"));
  };

  const move = async (action: () => Promise<GameView>) => {
    try {
      apply(await action());
    } catch {
      // Failed, so try reloading
      setGame(await getTodayGame(artist));
    }
  };

  const guess = (g: string) => move(() => submitGuess(artist, g));
  const skip = () => move(() => submitSkip(artist));

  const forfeit = async () => {
    if (game?.song) return game.song.answer;

    let answer = "";
    await move(async () => {
      const view = await submitForfeit(artist);
      answer = view.song?.answer ?? "";
      return view;
    });
    return answer;
  };

  const guesses = game?.guesses ?? [];
  const complete = game !== null && game.status !== "PLAYING";

  return (
    <>
      {complete ? (
        <Complete song={game.song} guesses={guesses} status={game.status} artist={artist} />
      ) : (
        <section className="mt-24" id="attemptBoxes">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            return (
              <AttemptBox
                key={i}
                parentActive={guesses.length == i}
                parentGuess={guesses[i]}
              />
            );
          })}
        </section>
      )}
      {game && (
        <div className="w-full absolute bottom-0 bg-background-secondary/50">
          <Player
            currentAttempt={guesses.length}
            complete={complete}
            doNotAutoplay={doNotAutoplay}
            artist={artist}
            forfeit={forfeit}
          />
          <Input
            currentAttempt={guesses.length}
            complete={complete}
            guess={guess}
            skip={skip}
            artist={artist}
          />
        </div>
      )}
    </>
  );
}
