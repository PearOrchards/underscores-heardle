// Technically could put this in the DB but since it's mostly static,
// I really couldn't see the point lmao

import { IconType } from "@/app/_components/ui/icon";
import type { ArtistsSongsOutput } from "../../../prisma/contract";

export type SongSource = {
  /** UI name for the source */
  name: string;
  /** Accompanying Lucide icon */
  icon: IconType;
  /** How the source is stored in the database */
  identifier: keyof ArtistsSongsOutput;
}

export const applicationSources = [
  { name: "SoundCloud", icon: "Cloud", identifier: "soundcloud" },
  { name: "Pillowcase", icon: "BedSingle", identifier: "tracker" },
  { name: "Deezer", icon: "Heart", identifier: "deezer" },
] satisfies SongSource[];
