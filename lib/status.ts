export const FIXTURE_LIVE = "live";
export const FIXTURE_PAUSE = "pause";
export const FIXTURE_FINISHED = "finished";
export const FIXTURE_UPCOMING = "not_started";

export const AUTOSUB_CONFIRMED = "confirmed";
export const AUTOSUB_PROJECTED = "pending";

export function isFixtureLive(status: string | undefined) {
  return status === FIXTURE_LIVE || status === FIXTURE_PAUSE;
}

export function isFixtureFinished(status: string | undefined) {
  return status === FIXTURE_FINISHED;
}

export function isFixtureUpcoming(status: string | undefined) {
  return status === FIXTURE_UPCOMING;
}

export function isPlayerPlaying(status: string | undefined) {
  return isFixtureLive(status);
}

export function isPlayerFinished(status: string | undefined) {
  return isFixtureFinished(status);
}

export function isPlayerUpcoming(status: string | undefined) {
  return isFixtureUpcoming(status);
}

export function fixtureNeverOngoing(status: string | undefined, label: string | undefined) {
  if (!isFixtureFinished(status)) return true;
  return !String(label || "").toLowerCase().includes("pågår");
}
