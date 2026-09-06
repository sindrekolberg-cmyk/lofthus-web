import assert from "node:assert/strict";
import { test } from "node:test";

function isNewerSnapshot(incomingSeq, currentSeq) {
  return Number(incomingSeq) > Number(currentSeq);
}

function shouldApplySnapshot(incoming, current) {
  const incomingSeq = Number(incoming.seq || 0);
  const currentSeq = Number(current.seq || 0);
  if (incomingSeq && currentSeq) return isNewerSnapshot(incomingSeq, currentSeq);
  const a = String(incoming.snapshot_id || "");
  const b = String(current.snapshot_id || "");
  if (!a) return false;
  if (!b) return true;
  return a !== b && a > b;
}

function fallbackPollMs(isLive, sseOpen) {
  if (!isLive) return 180000;
  return sseOpen ? 60000 : 15000;
}

function duplicateEvent(seen, eventId) {
  if (!eventId) return true;
  if (seen.has(eventId)) return true;
  seen.add(eventId);
  return false;
}

test("never apply an older snapshot over a newer one", () => {
  assert.equal(shouldApplySnapshot({ seq: 4 }, { seq: 5 }), false);
  assert.equal(shouldApplySnapshot({ seq: 5 }, { seq: 5 }), false);
  assert.equal(shouldApplySnapshot({ seq: 6 }, { seq: 5 }), true);
});

test("reconnect falls back to 15s live polling", () => {
  assert.equal(fallbackPollMs(true, false), 15000);
  assert.equal(fallbackPollMs(true, true), 60000);
  assert.equal(fallbackPollMs(false, false), 180000);
});

test("duplicate events are ignored", () => {
  const seen = new Set();
  assert.equal(duplicateEvent(seen, "a"), false);
  assert.equal(duplicateEvent(seen, "a"), true);
});
