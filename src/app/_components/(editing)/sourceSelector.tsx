"use client";

import { Icon } from "../ui/icon";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { applicationSources, type SongSource } from "@/lib/song-sources";

export default function SourceSelector({
  selected,
  onSelectedChange,
  availableSources = applicationSources,
}: {
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  availableSources?: SongSource[];
}) {
  function handleSelectedChange(checked: boolean, identifier: string) {
    onSelectedChange(
      checked
        ? [...selected, identifier]
        : selected.filter((s) => s !== identifier),
    );
  }

  return (
    <div className="bg-background-secondary px-8 pt-4 pb-8 flex flex-col gap-4 h-full w-full">
      <h1 className="text-4xl font-bold text-center">sources</h1>
      {availableSources.map((source: SongSource) => (
        <Label
          key={source.identifier}
          htmlFor={source.identifier}
          className="flex items-center justify-between gap-4 bg-button px-4 py-2 text-2xl hover:text-foreground-secondary cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Icon name={source.icon} className="size-5" />
            {source.name}
          </span>
          <Checkbox
            id={source.identifier}
            checked={selected.includes(source.identifier)}
            onCheckedChange={(checked) =>
              handleSelectedChange(!!checked, source.identifier)
            }
          />
        </Label>
      ))}
    </div>
  );
}
