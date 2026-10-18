"use client";
import { useEffect, useRef, useState } from "react";
import { getHistory, importLegacyHistory } from "@/app/_actions/game";
import { authClient } from "@/lib/who/auth-client";
import { readLocalHistory, type HistoryEntry } from "@/lib/game/local-history";
import { readLegacyHistory, markLegacyHistoryImported } from "@/lib/game/legacy-history";

export function useHistory(artist?: string) {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const importing = useRef(false);

  // Returns true if anything new landed on the account.
  const importLegacy = async () => {
    const legacy = readLegacyHistory();
    if (legacy.length === 0 || importing.current) return false; // Empty after LEGACY_ENDS too

    importing.current = true;
    try {
      const added = await importLegacyHistory(legacy);
      if (added === null) return false; // Closed - leave it in the browser for anonymous play
      markLegacyHistoryImported();
      return added > 0;
    } catch {
      return false; // Try again next load; the server skips days it already has
    } finally {
      importing.current = false;
    }
  };

  useEffect(() => {
    if (!artist) return;

    const load = async () => {
      const rounds = await getHistory(artist);
      if (rounds === null) return setHistory(readLocalHistory(artist));

      setHistory(rounds);
      if (await importLegacy()) setHistory(await getHistory(artist));
    };

    load();
    window.addEventListener("gameComplete", load);
    return () => window.removeEventListener("gameComplete", load);
  }, [artist, userId]);

  return history;
}
