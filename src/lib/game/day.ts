export const DAY_MS = 8.64e7;

/** right now */
export const currentDay = () => Math.floor(Date.now() / DAY_MS);

/** midnight before now */
export const startOfDay = (day: number) => new Date(day * DAY_MS);

/** midnight after now */
export const endOfDay = (day: number) => startOfDay(day + 1);
