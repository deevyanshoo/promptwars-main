export function createVoiceControls({
  getLocale,
  onVoiceStatus,
  onSpeechStatus,
  onTranscript,
  onListening,
}) {
  const Recognition =
    globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  const synth = globalThis.speechSynthesis;
  let recognition = null,
    voices = synth?.getVoices() || [],
    reading = false;
  synth?.addEventListener("voiceschanged", () => {
    voices = synth.getVoices();
  });
  function stopDictation() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    onListening(false);
  }
  function stopReading(announce = true) {
    if (synth) {
      synth.cancel();
      if (reading && announce) onSpeechStatus("reading_stopped");
    }
    reading = false;
  }
  function stopAll() {
    stopDictation();
    stopReading();
  }
  function startDictation() {
    stopAll();
    if (!Recognition) {
      onVoiceStatus("voice_unsupported");
      return;
    }
    const r = new Recognition();
    recognition = r;
    r.lang = getLocale() === "hi" ? "hi-IN" : "en-IN";
    r.continuous = false;
    r.interimResults = false;
    let failed = false,
      received = false;
    r.onstart = () => {
      onListening(true);
      onVoiceStatus("listening");
    };
    r.onresult = (e) => {
      let result = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) result += e.results[i][0].transcript + " ";
      if (result.trim()) {
        received = true;
        onTranscript(result.trim());
      }
    };
    r.onerror = (e) => {
      failed = true;
      onVoiceStatus(
        {
          "not-allowed": "voice_denied",
          "service-not-allowed": "voice_denied",
          "no-speech": "voice_silence",
          network: "voice_network",
          aborted: "dictation_review",
        }[e.error] || "voice_failed",
      );
    };
    r.onend = () => {
      if (recognition === r) recognition = null;
      onListening(false);
      if (!failed)
        onVoiceStatus(received ? "dictation_review" : "voice_silence");
    };
    try {
      r.start();
    } catch {
      recognition = null;
      onListening(false);
      onVoiceStatus("voice_failed");
    }
  }
  function speak(text, language = getLocale()) {
    stopAll();
    if (!synth || !globalThis.SpeechSynthesisUtterance) {
      onSpeechStatus("speech_unsupported");
      return;
    }
    voices = synth.getVoices();
    const voice =
      voices.find(
        (v) => v.lang.toLowerCase() === (language === "hi" ? "hi-in" : "en-in"),
      ) || voices.find((v) => v.lang.toLowerCase().startsWith(language));
    if (!voice) {
      onSpeechStatus("voice_missing");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.9;
    u.onstart = () => {
      reading = true;
      onSpeechStatus("reading");
    };
    u.onend = () => {
      reading = false;
      onSpeechStatus("reading_done");
    };
    u.onerror = (e) => {
      reading = false;
      if (!["interrupted", "canceled"].includes(e.error))
        onSpeechStatus("speech_failed");
    };
    synth.speak(u);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAll();
  });
  globalThis.addEventListener("pagehide", stopAll);
  return { startDictation, stopDictation, speak, stopReading, stopAll };
}
