// Mock data for server-action. All contain an "a" so they're all shown as suggestions.
// ANSWER is deliberately not first or last so that the tests checking suggestions don't break.
const ARTIST = "underscores";
const ANSWER = "underscores & acaer - cradlesong";
const SONGS = [
  "underscores - joshua (for a school project)",
  "underscores - whoop whoop (for a school project)",
  "underscores - let's play (underscores remix)",
  "underscores & acaer - cradlesong",
  "underscores - the niche market (mashup)",
  "underscores - pause",
];

// Encode a server-action return value as a React Flight (text/x-component) payload.
// Chunk 0 is the action-result envelope whose `a` (return value) lazily references
// chunk 1, which holds the value.
const flight = (value: unknown) =>
  `0:{"a":"$@1","f":"","q":"","i":true,"b":"development"}\n1:${JSON.stringify(value)}\n`;

type Status = "PLAYING" | "WON" | "LOST" | "FORFEIT";

// shaped like GameView from _actions/game.ts, once the game is over
const view = ({ guesses, status }: { guesses: string[]; status: Status }) => ({
  artist: ARTIST,
  day: Math.floor(Date.now() / 8.64e7),
  guesses: [...guesses],
  status,
  song: status === "PLAYING"
    ? undefined
    : { answer: ANSWER, link: "https://example.com/mock", source: "tracker", offset: 0 },
});

// Stub the audio pipeline for every test. Since normally the API relies on outside data,
// those with poor internet could have flaky e2e test results.
beforeEach(() => {
  cy.intercept(/\/api\/audio/, {
    statusCode: 200,
    headers: { "X-Offset": "0", "content-type": "audio/mpeg" },
    fixture: "audio.mp3,null",
  });

  // Game actions are all Server Actions (POST + Next-Action header), so we have to figure out which
  // by checking its action id against Next's manifest (see cypress' config)
  cy.task<Record<string, string>>("serverActions").then((actions) => {
    const state: { guesses: string[]; status: Status } = { guesses: [], status: "PLAYING" };

    cy.intercept({ method: "POST", url: "**/artists/**" }, (req) => {
      const id = req.headers["next-action"];
      const action = actions[Array.isArray(id) ? id[0] : id];
      if (!action) return; // idk let it through

      let args: unknown[];
      try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        args = Array.isArray(body) ? body : [];
      } catch {
        args = [];
      }

      const send = (value: unknown) =>
        req.reply({
          statusCode: 200,
          headers: { "content-type": "text/x-component" },
          body: flight(value),
        });

      switch (action) {
        case "getTodayGame":
          return send(view(state));
        // submitGuess(artist, guess), and a submitSkip is just an empty guess ("")
        case "submitGuess":
        case "submitSkip": {
          if (state.status !== "PLAYING") return send(view(state));
          // "$undefined" is Flight's encoding for undefined
          const guess = action === "submitGuess" && typeof args[1] === "string" && args[1] !== "$undefined"
            ? args[1]
            : "";
          state.guesses.push(guess);
          if (guess === ANSWER) state.status = "WON";
          else if (state.guesses.length >= 6) state.status = "LOST";
          return send(view(state));
        }
        case "submitForfeit":
          if (state.status === "PLAYING") state.status = state.guesses.length === 0 ? "FORFEIT" : "LOST";
          return send(view(state));
        case "getHistory":
          return send(null); // Same as the server for a logged-out player
        case "SongSuggestions": 
          const query = typeof args[1] === "string" ? args[1] : "";
          return send(
            query === ""
              ? SONGS
              : SONGS.filter((s) => s.toLowerCase().includes(query.toLowerCase())),
          );
      }
    });
  });
});

// player.tsx calls play() without catching the returned promise. In headless Electron,
// play() rejects with NotSupportedError or AbortError — not real failures, since play/stop UI
// is driven by React state, not actual playback.
Cypress.on("uncaught:exception", (err) => {
  if (
    ["NotSupportedError", "AbortError", "NotAllowedError"].includes(err.name)
  ) {
    return false;
  }
  return undefined;
});
