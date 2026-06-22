import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/app/_components/ui/icon";

export default function AttemptBox({
  parentActive,
  parentGuess,
}: {
  parentActive: boolean;
  parentGuess: string;
}) {
  const [active, setActive] = useState<boolean>(parentActive);

  useEffect(() => {
    setActive(parentActive);
  }, [parentActive]);

  return (
    <div
      className={cn(
        "w-[80vw] h-16 my-4 mx-auto p-2 border-2 border-foreground-secondary overflow-clip flex",
        "lg:w-[40vw] lg:h-12",
        active && "bg-background-secondary b-foreground",
      )}
    >
      <p className="text-2xl text-foreground-secondary gap-1 flex items-center">
        {parentGuess === "" ? (
          <>
            <Icon name="SkipForward" className="size-5" /> <span>SKIPPED</span>
          </>
        ) : parentGuess !== undefined ? (
          <>
            <Icon name="X" className="size-5" />{" "}
            <span className="truncate">{parentGuess}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
