import { SongSuggestions } from "./SongSuggestions";
import { Button } from "@/app/_components/ui/button";
import { Icon } from "@/app/_components/ui/icon";
import { cn } from "@/lib/utils";

import { useState, useRef } from "react";

export default function Input({
  currentAttempt,
  complete,
  guess,
  skip,
  artist,
}: {
  currentAttempt: number;
  complete: boolean;
  guess: (g: string) => void;
  skip: () => void;
  artist: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = suggestions.slice(0, 9);

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };
  const autocomplete = (suggestion: string) => {
    if (inputRef.current) inputRef.current.value = suggestion;
  };

  const onFocus = async () => {
    const stringToCheck = inputRef.current?.value;
    if (stringToCheck) {
      const suggestions = await SongSuggestions(
        artist,
        inputRef.current?.value || "",
      );
      setSuggestions(suggestions);
      setSelectedIndex(-1);
      setShowSuggestions(true);
    } else blur();
  };
  const blur = () => {
    setTimeout(() => {
      // delay to allow click event to fire :(
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 100);
  };

  const submitGuess = async () => {
    if (!inputRef.current) return;
    const value = inputRef.current.value;
    const allSongs = await SongSuggestions(artist, "");

    if (allSongs.includes(value)) {
      guess(value);
      clear();
    }
  };

  const keyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, shown.length - 1));
    }
    if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setSelectedIndex((i) =>
        i === -1 ? shown.length - 1 : Math.max(i - 1, 0),
      );
    }
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (selectedIndex >= 0 && shown[selectedIndex]) {
        // Autocomplete
        autocomplete(shown[selectedIndex]);
        inputRef.current?.focus();
        blur();
      } else {
        // Submit, basically un-preventing default
        submitGuess();
      }
    }
    if (ev.key === "Escape") {
      blur();
    }
  };

  return !complete ? (
    <section>
      <form
        className="w-4/5 lg:w-2/5 my-4 mx-auto relative"
        onSubmit={async (ev) => {
          ev.preventDefault();
          await submitGuess();
        }}
      >
        <div
          data-cy="suggestions"
          className={cn(
            "absolute bottom-full w-full hidden flex-col flex-nowrap",
            showSuggestions && "flex",
          )}
        >
          {shown.map((s, i) => (
            <p
              className={cn(
                "w-full py-2 px-4 border-2 border-foreground-secondary border-b-0 bg-background text-xl lg:text-base",
                "first:rounded-t-sm",
                i === selectedIndex && "bg-background-secondary cursor-pointer",
              )}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={() => autocomplete(s)}
              key={s}
            >
              {s}
            </p>
          ))}
        </div>
        <input
          type="text"
          onFocus={onFocus}
          onBlur={blur}
          onChange={onFocus}
          onKeyDown={keyPress}
          placeholder="Know it? Search for the title"
          ref={inputRef}
          data-cy="textInput"
          className="w-full h-full py-2 px-12 border-2 border-foreground-secondary text-3xl focus:border-link focus:outline-none lg:text-xl"
        />
        <Icon
          className="absolute top-1/2 -translate-y-1/2 left-4 hover:text-none hover:cursor-default size-6"
          name="Search"
        />
        <Icon
          className="absolute top-1/2 -translate-y-1/2 right-4 size-6"
          name="X"
          onClick={clear}
        />
      </form>
      <div className="w-4/5 lg:w-2/5 my-2 mx-auto flex flex-row justify-between">
        <Button
          onClick={skip}
          data-cy="skipBtn"
          className="text-3xl lg:text-2xl"
        >
          SKIP {currentAttempt < 5 ? `(+${Math.pow(2, currentAttempt)}s)` : ""}
        </Button>
        <Button
          onClick={submitGuess}
          data-cy="submitBtn"
          className="bg-link text-3xl lg:text-2xl"
        >
          SUBMIT
        </Button>
      </div>
    </section>
  ) : null;
}
