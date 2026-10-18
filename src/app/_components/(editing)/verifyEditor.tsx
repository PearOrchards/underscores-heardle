"use client";

import { useState } from "react";
import SourceSelector from "./sourceSelector";

export default function VerifyPanel({
  initialSelected = [],
}: {
  initialSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  return (
    <>
      <SourceSelector selected={selected} onSelectedChange={setSelected} />
      <div className="bg-background-secondary px-8 py-4 flex flex-col gap-4 h-full w-full">
        <h1 className="text-4xl font-bold text-center">verify</h1>
        <p>selected: { selected.join(", ") }</p>
      </div>
    </>
  );
}
