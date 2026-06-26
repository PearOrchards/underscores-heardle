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

// Stub the audio pipeline for every test. Since normally the API relies on outside data,
// those with poor internet could have flaky e2e test results.
beforeEach(() => {
  cy.intercept(/\/api\/audio/, {
    statusCode: 200,
    headers: { "X-Offset": "0", "content-type": "audio/mpeg" },
    fixture: "audio.mp3,null",
  });

  // SongToday / SongSuggestions / IsGuessCorrect are server actions (POST with a Next-Action header)
  // We can't match on the action id (it changes per build), so we distinguish the three by their argument shape:
  // - SongToday(artist) -> [artist]
  // - SongSuggestions(artist, query) -> artist first
  // - IsGuessCorrect(guess, artist) -> artist second
  cy.intercept({ method: "POST", url: "**/artists/**" }, (req) => {
    let args: unknown;
    try {
      args = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return; // not a server-action body — let it through
    }
    if (!Array.isArray(args)) return;

    const send = (value: unknown) =>
      req.reply({
        statusCode: 200,
        headers: { "content-type": "text/x-component" },
        body: flight(value),
      });

    if (args.length === 1 && args[0] === ARTIST) {
      // SongToday(artist)
      send({
        answer: ANSWER,
        link: "https://example.com/mock",
        source: "tracker",
        offset: 0,
      });
    } else if (args.length === 2 && args[0] === ARTIST) {
      // SongSuggestions(artist, query)
      const query = typeof args[1] === "string" ? args[1] : "";
      send(
        query === ""
          ? SONGS
          : SONGS.filter((s) => s.toLowerCase().includes(query.toLowerCase())),
      );
    } else if (args.length === 2 && args[1] === ARTIST) {
      // IsGuessCorrect(guess, artist)
      // "$undefined" is Flight's encoding for undefined
      const guess = args[0] === "$undefined" ? undefined : args[0];
      send(guess === ANSWER);
    }
    // Anything else: leave untouched
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
