import test from "node:test";
import assert from "node:assert/strict";
import { createVoiceControls } from "../public/voice.js";

function harness(t) {
  const sessions = [],
    events = [],
    transcripts = [],
    listeners = {};
  let locale = "hi";
  class Recognition {
    constructor() {
      sessions.push(this);
    }
    start() {
      if (this.constructor.failStart) throw new Error("start failed");
    }
    stop() {
      this.stopped = true;
      this.onend?.();
    }
  }
  const values = {
    SpeechRecognition: Recognition,
    speechSynthesis: undefined,
    document: {
      hidden: false,
      addEventListener: (key, fn) => {
        listeners[key] = fn;
      },
    },
    addEventListener: (key, fn) => {
      listeners[key] = fn;
    },
  };
  for (const [key, value] of Object.entries(values)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : delete globalThis[key],
    );
  }
  const voice = createVoiceControls({
    getLocale: () => locale,
    onVoiceStatus: (value) => events.push(["voice", value]),
    onSpeechStatus: (value) => events.push(["speech", value]),
    onListening: (value) => events.push(["listening", value]),
    onTranscript: (value) => transcripts.push(value),
  });
  return {
    voice,
    sessions,
    events,
    transcripts,
    listeners,
    Recognition,
    setLocale: (value) => {
      locale = value;
    },
  };
}
function result(session, text) {
  session.onresult({
    resultIndex: 0,
    results: [Object.assign([{ transcript: text }], { isFinal: true })],
  });
}
function lateEvents(session) {
  session.onstart();
  result(session, "stale text");
  session.onerror({ error: "not-allowed" });
  session.onend();
}

test("a retired recognition session cannot overwrite a newer session or append text", (t) => {
  const h = harness(t);
  h.voice.startDictation();
  const old = h.sessions[0];
  old.onstart();
  h.setLocale("en");
  h.voice.startDictation();
  const current = h.sessions[1];
  current.onstart();
  assert.equal(old.lang, "hi-IN");
  assert.equal(current.lang, "en-IN");
  const before = structuredClone(h.events);
  lateEvents(old);
  assert.deepEqual(h.events, before);
  assert.deepEqual(h.transcripts, []);
  result(current, "review this text");
  current.onend();
  assert.deepEqual(h.transcripts, ["review this text"]);
  assert.deepEqual(h.events.at(-1), ["voice", "dictation_review"]);
});

test("Stop retires ownership before synchronous end and discards queued results", (t) => {
  const h = harness(t);
  h.voice.startDictation();
  h.sessions[0].onstart();
  h.voice.stopDictation();
  const before = structuredClone(h.events);
  lateEvents(h.sessions[0]);
  assert.deepEqual(h.events, before);
  assert.deepEqual(h.transcripts, []);
  assert.equal(h.sessions[0].stopped, true);
  assert.deepEqual(h.events.at(-1), ["listening", false]);
  assert.ok(
    h.events.some(
      ([kind, value]) => kind === "voice" && value === "dictation_review",
    ),
  );
});

test("navigation, backgrounding, pagehide and competing playback invalidate dictation", (t) => {
  const h = harness(t);
  for (const stop of [
    () => h.voice.stopAll(),
    () => {
      document.hidden = true;
      h.listeners.visibilitychange();
    },
    () => h.listeners.pagehide(),
    () => h.voice.speak("read this"),
  ]) {
    h.voice.startDictation();
    const session = h.sessions.at(-1);
    session.onstart();
    stop();
    const before = structuredClone(h.events);
    lateEvents(session);
    assert.deepEqual(h.events, before);
    assert.equal(session.stopped, true);
  }
  assert.deepEqual(h.transcripts, []);
});

test("failed start and an ended session cannot deliver late callbacks", (t) => {
  const h = harness(t);
  h.Recognition.failStart = true;
  h.voice.startDictation();
  const before = structuredClone(h.events);
  lateEvents(h.sessions[0]);
  assert.deepEqual(h.events, before);
  assert.deepEqual(h.events.at(-1), ["voice", "voice_failed"]);
  h.Recognition.failStart = false;
  h.voice.startDictation();
  const current = h.sessions.at(-1);
  current.onerror({ error: "not-allowed" });
  current.onend();
  const ended = structuredClone(h.events);
  lateEvents(current);
  assert.deepEqual(h.events, ended);
  assert.ok(
    h.events.some(
      ([kind, value]) => kind === "voice" && value === "voice_denied",
    ),
  );
});
