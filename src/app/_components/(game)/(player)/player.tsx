import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Icon } from "@/app/_components/ui/icon";
import { cn } from "@/lib/utils";
import { SongToday } from "@/app/_components/SongToday";

const audioLink = (artist: string, duration?: number) => {
  const now = new Date();
  const str = now.toISOString().split("T")[0];
  return (
    `/api/audio?t=${str}&artist=${artist}` +
    (duration ? `&duration=${duration}` : "")
  );
};

export default function Player({
  currentAttempt,
  complete,
  doNotAutoplay,
  artist,
}: {
  currentAttempt: number;
  complete: boolean;
  doNotAutoplay: boolean;
  artist: string;
}) {
  // Player functionality states
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [playing, setPlaying] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0); // Defined by songList, pulled from server and used to determine the starting pos of the song.

  // Player timer states
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [displayedTime, setDisplayedTime] = useState<number>(0);

  // Modal states (for errors)
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const openErrorModal = () => setModalOpen(true);
  const closeErrorModal = () => setModalOpen(false);
  const [song, setSong] = useState<string>(""); // ONLY TO BE SET WHEN AN ERROR OCCURS

  const audioRef = useRef<HTMLAudioElement>(null);

  const play = () => {
    if (!ready) return;

    if (audioRef.current) {
      audioRef.current.play();
      setPlaying(true);

      if (!complete) {
        const timer = setTimeout(
          () => {
            stop();
          },
          Math.pow(2, currentAttempt) * 1000,
        );
        setTimer(timer);
      }
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = offset;
      setPlaying(false);

      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
    }
  };

  const toggle = () => (!playing ? play() : stop());

  // Audio loading and time display
  useEffect(() => {
    if (audioRef.current) {
      let tempOffset = 0;

      // Is audio currently playing?
      let wasPlayingOnAudioUpdate = false;
      if (playing) {
        stop();
        wasPlayingOnAudioUpdate = true;
      }

      const link =
        currentAttempt <= 6
          ? audioLink(artist, Math.pow(2, currentAttempt))
          : audioLink(artist);
      fetch(link)
        .then((r) => {
          if (r.ok) {
            tempOffset = parseInt(r.headers.get("X-Offset") || "0") / 1000;
            setOffset(tempOffset);
            console.log(tempOffset);
            return r.arrayBuffer();
          } else {
            if (r.status === 408) {
              setError(
                "Hang on! We can't connect to the API. You can either try again later or click this box to get the answer.",
              );
              SongToday(artist).then((s) => setSong(s.answer));
            } else if (r.status === 418) {
              setError("AH!!! You cut us off! Please reload and be patient!");
            } else {
              setError(
                "Something went wrong... Please try again (later) or click this box to get the answer.",
              );
              SongToday(artist).then((s) => setSong(s.answer));
            }
            return null;
          }
        })
        .then((buffer) => {
          if (audioRef.current && buffer instanceof ArrayBuffer) {
            audioRef.current.src = URL.createObjectURL(
              new Blob([buffer], { type: "audio/mpeg" }),
            );
            audioRef.current.currentTime = tempOffset;
            setReady(true);

            if (wasPlayingOnAudioUpdate) play();
          }
        });
      // End of fetch

      audioRef.current.addEventListener("timeupdate", () => {
        setDisplayedTime(Math.floor(audioRef.current?.currentTime || 0));
      });
    }
  }, [artist, currentAttempt]);

  useEffect(() => {
    if (complete && audioRef.current && !doNotAutoplay) {
      if (timer) {
        // Cancel the timer if it's still running
        clearTimeout(timer);
        setTimer(null);
      }

      audioRef.current.play();
      setPlaying(true);
    }
  }, [complete]);

  const keyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === "Enter" || ev.key === " ") toggle();
  };

  return (
    <section>
      <audio ref={audioRef}></audio>
      <div className="w-full h-6 border-y-2 border-foreground-secondary">
        <div
          className="w-4/5 lg:w-3/5 h-full grid mx-auto grid-cols-[1fr_1fr_2fr_4fr_8fr_16fr]"
          data-cy="innerTrack"
        >
          {!complete
            ? [0, 1, 2, 3, 4, 5].map((i) => {
                return (
                  <div
                    className={cn(
                      "h-full border-r-2 border-foreground-secondary",
                      i == 0 && "border-l-2",
                      currentAttempt >= i && "bg-background-secondary",
                    )}
                    data-active={currentAttempt >= i ? "true" : undefined}
                    key={i}
                  ></div>
                );
              })
            : null}
        </div>
        <div
          className={cn(
            "absolute top-0 h-6 w-0 bg-foreground left-[10vw] lg:left-[20vw]",
            "[--progress-width:80vw] lg:[--progress-width:60vw]",
            playing && "animate-progress",
          )}
          style={{
            animationDuration: complete
              ? Math.floor(audioRef.current?.duration || 0) + "s"
              : "32s",
          }}
        ></div>
      </div>
      <div
        className="rounded-full border-2 border-foreground h-24 w-24 lg:h-16 lg:w-16 my-8 lg:my-4 mx-auto flex hover:cursor-pointer"
        onClick={toggle}
        data-cy="playerBtn"
        tabIndex={0}
        onKeyDown={keyDown}
      >
        <Icon
          name={!ready ? "Ellipsis" : !playing ? "Play" : "Square"}
          className={cn(
            "m-auto size-12 lg:size-8",
            !ready ? "opacity-50 pointer-events-none" : "opacity-100",
          )}
        />
      </div>
      <div className="text-2xl flex justify-between absolute w-4/5 lg:w-3/5 top-8 mx-[10vw] lg:mx-[20vw]">
        <p>
          {Math.floor(displayedTime / 60) +
            ":" +
            String(
              Math.floor((displayedTime % 60) - Math.floor(offset)),
            ).padStart(2, "0")}
        </p>
        <p>
          {!complete // The reason this uses audioRef.current.duration rather than using state is because it doesn't change.
            ? "0:32"
            : Math.floor((audioRef.current?.duration || 0) / 60) +
              ":" +
              String(Math.floor(audioRef.current?.duration || 0) % 60).padStart(
                2,
                "0",
              )}
        </p>
      </div>
      {error ? (
        <Dialog>
          <DialogTrigger
            className="bg-button text-center p-4 flex justify-center items-center gap-2 w-full text-xl xl:text-base hover:cursor-pointer hover:brightness-110"
            onClick={openErrorModal}
          >
            <Icon name="CloudAlert" className="hidden sm:block size-6" />
            {error}
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>sorry!</DialogTitle>
            <DialogDescription>
              Since something has gone wrong, and it could be any host of
              issues, we&apos;ll just give you the answer :) <br />
              It&apos;s &quot;{song}&quot;
            </DialogDescription>
          </DialogContent>
        </Dialog>
      ) : null}
    </section>
  );
}
