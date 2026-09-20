"use client";

import { useState, useEffect } from "react";
import { Icon } from "../ui/icon";
import { Checkbox } from "../ui/checkbox";
import type { Source } from ".";
import { Label } from "../ui/label";

export default function SourceSelector({
  availableSources,
  selectedSources,
}: {
  availableSources: Source[];
  selectedSources: string[];
}) {
  const [selected, setSelected] = useState<string[]>(selectedSources);

  function handleSelectedChange(checked: boolean, sourceName: string) {
    if (checked) {
      setSelected([...selected, sourceName]);
    } else {
      setSelected(selected.filter((s) => s !== sourceName));
    }
  }

  return (
    <div className="bg-background-secondary px-8 py-4 flex flex-col gap-4 h-full w-full">
      <h1 className="text-4xl font-bold text-center">sources</h1>
      {
        availableSources.map((source: Source) => (
          <div key={source.name} className="flex items-center gap-2 bg-button px-4 py-2">
            <Label htmlFor={source.name} className="text-2xl hover:text-foreground-secondary">
              <Icon name={source.icon} className="" />
              {source.name}
            </Label>

            <Checkbox
              id={source.name}
              checked={selected.includes(source.name)}
              onCheckedChange={(checked) => handleSelectedChange(!!checked, source.name)}
            />
          </div>
        ))
      }
    </div>
  )
}
