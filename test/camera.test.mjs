import test from "node:test";
import assert from "node:assert/strict";
import { createCamera } from "../public/camera.js";
function harness(mediaDevices, frame = async () => ({ name: "still.jpg" })) {
  const events = [],
    frames = [];
  const video = { pause() {}, async play() {}, srcObject: null };
  const camera = createCamera({
    video,
    mediaDevices,
    frame,
    onStatus: (s) => events.push(s),
    onState: (s) => events.push(s),
    onCapture: (f) => frames.push(f),
  });
  return { camera, events, frames, video };
}
function stream() {
  const track = {
    stopped: false,
    stop() {
      this.stopped = true;
    },
  };
  return { track, getTracks: () => [track] };
}
test("camera requests video only, captures one still and stops tracks before handing it off", async () => {
  const source = stream();
  let constraints;
  const h = harness({
    getUserMedia: async (value) => {
      constraints = value;
      return source;
    },
  });
  await h.camera.start();
  assert.equal(constraints.audio, false);
  assert.equal(h.video.srcObject, source);
  assert.equal(h.frames.length, 0);
  await h.camera.take();
  assert.equal(source.track.stopped, true);
  assert.equal(h.video.srcObject, null);
  assert.equal(h.frames.length, 1);
  assert.ok(h.events.includes("camera_captured"));
});
test("cancel and a late permission response stop every track without capture", async () => {
  const source = stream();
  let release;
  const h = harness({ getUserMedia: () => new Promise((r) => (release = r)) });
  const start = h.camera.start();
  h.camera.stop(true);
  release(source);
  await start;
  assert.equal(source.track.stopped, true);
  assert.equal(h.frames.length, 0);
  const next = stream();
  const live = harness({ getUserMedia: async () => next });
  await live.camera.start();
  live.camera.stop();
  assert.equal(next.track.stopped, true);
});
test("denied and missing cameras retain explicit upload fallback states", async () => {
  for (const [name, key] of [
    ["NotAllowedError", "camera_denied"],
    ["NotFoundError", "camera_missing"],
  ]) {
    const h = harness({
      getUserMedia: async () => {
        throw Object.assign(new Error(), { name });
      },
    });
    await h.camera.start();
    assert.equal(h.events.at(-1), key);
    assert.equal(h.frames.length, 0);
    assert.equal(h.video.srcObject, null);
  }
  const h = harness(undefined);
  await h.camera.start();
  assert.ok(h.events.includes("camera_unavailable"));
});
