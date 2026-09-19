import { getLocale, setLocale, t, translations } from "./i18n.js";
import { requestWorkflow } from "./api.js";
import { preparePhoto, releasePhoto } from "./photo.js";
import { createCamera } from "./camera.js";
import { createPlanStore, makePlan, nextStepIndex } from "./plans.js";
import { validDate } from "./task-utils.js";
import { createVoiceControls } from "./voice.js";
import {
  renderPlan,
  renderGuide,
  renderDay,
  renderExecution,
  el,
} from "./render.js";
const $ = (id) => document.getElementById(id);
let storage;
try {
  storage = localStorage;
} catch {}
const store = createPlanStore(storage);
let photo = null,
  activePlan = null,
  activeSource = null,
  execution = null,
  guideIndex = null,
  busy = false,
  mode = "photo",
  reviewRequired = false,
  photoVersion = 0;
function status(id, key) {
  $(id).hidden = !key;
  $(id).textContent = key ? t(key) : "";
  if (key) $(id).dataset.statusKey = key;
  else delete $(id).dataset.statusKey;
}
function error(id, key) {
  $(id).hidden = false;
  const message = $(id).querySelector("p");
  message.dataset.statusKey = translations[getLocale()][key]
    ? key
    : "planning_failed";
  message.textContent = t(message.dataset.statusKey);
}
function storageWarning() {
  status("storage-warning", store.warning);
}
const voice = createVoiceControls({
  getLocale,
  onVoiceStatus: (key) => status("voice-status", key),
  onSpeechStatus: (key) => status("speech-status", key),
  onListening: (yes) => {
    $("voice-stop").hidden = !yes;
    $("voice-input").disabled = yes || busy;
  },
  onTranscript: (text) => {
    const input = $("message");
    const combined = input.value + (input.value ? "\n" : "") + text;
    if (combined.length > 4000) {
      status("voice-status", "input_invalid");
      return;
    }
    input.value = combined;
    inputChanged();
  },
});
const camera = createCamera({
  video: $("camera-video"),
  onStatus: (key) => status("camera-status", key),
  onState: (state) => {
    $("camera-panel").hidden = state === "off";
    $("camera-start").disabled = state !== "off" || busy;
    $("camera-take").disabled = state !== "active";
    if (state === "active")
      $("camera-panel").scrollIntoView({ block: "nearest" });
  },
  onCapture: async (file) => {
    await choosePhoto(file);
    $("extract-button").focus();
  },
});
$("camera-start").onclick = () => {
  voice.stopAll();
  camera.start();
};
$("camera-take").onclick = () => camera.take();
$("camera-cancel").onclick = () => camera.stop(true);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) camera.stop();
});
// Photo identity and draft identity must move together. Saved plans are untouched.
function clearCurrentDraft() {
  activePlan = null;
  activeSource = null;
  guideIndex = null;
  execution = null;
  $("result").hidden = true;
  $("plan-overview").replaceChildren();
  $("guide").replaceChildren();
  $("execution-details").hidden = true;
  $("execution-list").replaceChildren();
  status("plan-status", null);
}
function invalidatePhotoReview() {
  voice.stopAll();
  clearCurrentDraft();
  reviewRequired = false;
  $("message").value = "";
  $("review-confirm").checked = false;
  $("review-control").hidden = true;
  $("review-note").hidden = true;
  $("uncertainties").replaceChildren();
  status("readability", null);
  $("request-error").hidden = true;
  $("message-form").hidden = mode === "photo";
  inputChanged(false);
}
function inputChanged(edited = true) {
  $("character-count").textContent =
    `${$("message").value.length.toLocaleString(getLocale())} / 4,000`;
  if (reviewRequired && edited) $("review-confirm").checked = false;
  if (activeSource && $("message").value !== activeSource)
    status("plan-status", "source_changed");
}
function setBusy(value, kind) {
  busy = value;
  for (const id of [
    "understand-button",
    "extract-button",
    "extract-retry",
    "retry",
    "photo-file",
    "camera-start",
    "photo-mode",
    "text-mode",
    "ordinary-example",
    "suspicious-example",
    "language-hi",
    "language-en",
    "voice-input",
    "discard-photo",
  ])
    $(id).disabled = value;
  $("message").readOnly = value;
  document
    .querySelectorAll("#plan-overview form button")
    .forEach((b) => (b.disabled = value));
  $("input-workspace").setAttribute("aria-busy", String(value));
  status(
    kind === "photo" ? "photo-status" : "request-status",
    value ? (kind === "photo" ? "extracting" : "planning") : null,
  );
}
function changeMode(next) {
  if (busy) return;
  voice.stopAll();
  camera.stop();
  mode = next;
  $("photo-panel").hidden = next !== "photo";
  $("message-form").hidden = next === "photo" && !reviewRequired;
  for (const name of ["photo", "text"])
    $(name + "-mode").setAttribute("aria-pressed", String(name === next));
}
function deleteSavedPlan(id) {
  store.deletePlan(id);
  if (activePlan?.id === id) clearCurrentDraft();
  render();
}
function changeManualTask(id, done) {
  store.setTasks(
    store.state.tasks.map((task) =>
      task.id === id ? { ...task, done } : task,
    ),
  );
  render();
}
function deleteManualTask(id) {
  store.setTasks(store.state.tasks.filter((task) => task.id !== id));
  render();
}
function refreshDay() {
  renderDay({
    ...store.state,
    onResume: resume,
    onDelete: deleteSavedPlan,
    onTaskChange: changeManualTask,
    onTaskDelete: deleteManualTask,
  });
}
function render() {
  const state = store.state;
  setLocale(state.locale);
  document.body.classList.toggle("large-text", state.large);
  $("text-toggle").textContent = t(state.large ? "standard" : "larger");
  $("text-toggle").setAttribute("aria-pressed", String(state.large));
  $("language-hi").setAttribute("aria-pressed", String(state.locale === "hi"));
  $("language-en").setAttribute("aria-pressed", String(state.locale === "en"));
  $("photo-preview").alt = t("photo_alt");
  document
    .querySelectorAll("[data-status-key]")
    .forEach((n) => (n.textContent = t(n.dataset.statusKey)));
  storageWarning();
  renderCurrent();
  renderExecution(execution);
  refreshDay();
  inputChanged(false);
}
function saved() {
  return activePlan && store.state.plans.some((p) => p.id === activePlan.id);
}
function changeStep(id, patch) {
  if (patch.due !== undefined && !validDate(patch.due)) {
    status("plan-status", "date_invalid");
    return;
  }
  activePlan = {
    ...activePlan,
    steps: activePlan.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  };
  if (saved()) store.savePlan(activePlan);
  render();
  if (guideIndex !== null) $("guide").querySelector(".primary")?.focus();
  else
    document
      .querySelector(
        `[data-step-id="${id}"][data-field="${patch.due !== undefined ? "due" : "done"}"]`,
      )
      ?.focus();
}
function renderCurrent() {
  if (!activePlan) return;
  $("result").hidden = false;
  $("plan-overview").hidden = guideIndex !== null;
  $("guide").hidden = guideIndex === null;
  renderPlan($("plan-overview"), activePlan, {
    saved: saved() && !store.warning,
    onSave: () => {
      try {
        if (store.savePlan(activePlan)) status("plan-status", "saved");
        else status("plan-status", store.warning);
        render();
        $("plan-status").tabIndex = -1;
        $("plan-status").focus();
      } catch (e) {
        status("plan-status", e.message);
      }
    },
    onGuide: (index) => {
      voice.stopAll();
      guideIndex = index;
      renderCurrent();
      $("guide").setAttribute("tabindex", "-1");
      $("guide").focus();
    },
    onChange: changeStep,
    canClarify: !!activeSource,
    onClarify: (clarification) => planMessage(clarification),
    onCopy: async () => {
      try {
        await navigator.clipboard.writeText($("share-summary").value);
        status("plan-status", "copied");
      } catch {
        status("plan-status", "copy_failed");
        $("share-summary").focus();
        $("share-summary").select();
      }
    },
  });
  if (guideIndex !== null)
    renderGuide($("guide"), activePlan, guideIndex, {
      onChange: changeStep,
      onMove: (index) => {
        voice.stopAll();
        guideIndex = index;
        renderCurrent();
        $("guide").focus();
      },
      onOverview: () => {
        voice.stopAll();
        guideIndex = null;
        renderCurrent();
        $("result-heading").focus();
      },
      onListen: (text) => voice.speak(text, activePlan.locale),
    });
}
function resume(id) {
  voice.stopAll();
  activePlan = store.state.plans.find((p) => p.id === id);
  activeSource = null;
  guideIndex = activePlan.steps.length
    ? Math.max(0, nextStepIndex(activePlan))
    : null;
  renderCurrent();
  $("result-heading").focus();
}
async function planMessage(clarification = "") {
  if (busy) return;
  clearCurrentDraft();
  const message = $("message").value;
  if (!message.trim() || message.length > 4000) {
    error("request-error", "input_invalid");
    $("message").focus();
    return;
  }
  if (reviewRequired && !$("review-confirm").checked) {
    error("request-error", "review_required");
    $("review-confirm").focus();
    return;
  }
  if (clarification.length > 800) {
    status("plan-status", "clarification_invalid");
    return;
  }
  voice.stopAll();
  camera.stop();
  $("request-error").hidden = true;
  setBusy(true, "plan");
  try {
    const response = await requestWorkflow("/api/understand", {
      message,
      locale: getLocale(),
      clarification,
    });
    activePlan = makePlan(response.plan, response.locale);
    activeSource = message;
    guideIndex = null;
    execution = response.execution;
    status("plan-status", "draft");
    render();
    $("result-heading").focus();
  } catch (e) {
    execution = e.execution || null;
    renderExecution(execution);
    error("request-error", e.code || "planning_failed");
  } finally {
    setBusy(false, "plan");
  }
}
async function choosePhoto(file) {
  if (busy) return;
  invalidatePhotoReview();
  const version = ++photoVersion;
  releasePhoto(photo);
  photo = null;
  $("photo-preview").hidden = true;
  $("photo-actions").hidden = true;
  $("photo-error").hidden = true;
  try {
    const prepared = await preparePhoto(file);
    if (version !== photoVersion) {
      releasePhoto(prepared);
      return;
    }
    photo = prepared;
    $("photo-preview").src = photo.preview;
    $("photo-preview").hidden = false;
    $("photo-actions").hidden = false;
    status("photo-status", "photo_ready");
  } catch (e) {
    error("photo-error", e.message);
  }
}
async function extract() {
  if (busy || !photo) return;
  voice.stopAll();
  camera.stop();
  $("photo-error").hidden = true;
  setBusy(true, "photo");
  try {
    const response = await requestWorkflow("/api/extract", {
      image: photo.image,
      locale: getLocale(),
    });
    execution = response.execution;
    renderExecution(execution);
    const data = response.extraction;
    status("readability", data.readability);
    $("uncertainties").replaceChildren(
      ...data.uncertain.map((v) => el("li", v)),
    );
    $("review-note").hidden = false;
    $("message-form").hidden = false;
    reviewRequired = true;
    $("review-control").hidden = false;
    $("review-confirm").checked = false;
    $("message").value = data.text;
    inputChanged();
    $("message").focus();
  } catch (e) {
    execution = e.execution || null;
    renderExecution(execution);
    error("photo-error", e.code || "extraction_failed");
  } finally {
    setBusy(false, "photo");
  }
}
$("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  planMessage();
});
$("retry").onclick = () => planMessage();
$("extract-button").onclick = extract;
$("extract-retry").onclick = extract;
$("message").oninput = inputChanged;
for (const name of ["photo", "text"])
  $(name + "-mode").onclick = () => changeMode(name);
for (const id of ["photo-file"])
  $(id).onchange = (e) => {
    camera.stop();
    if (e.target.files[0]) choosePhoto(e.target.files[0]);
    e.target.value = "";
  };
$("discard-photo").onclick = () => {
  invalidatePhotoReview();
  photoVersion++;
  releasePhoto(photo);
  photo = null;
  $("photo-preview").removeAttribute("src");
  $("photo-preview").hidden = true;
  $("photo-actions").hidden = true;
  status("photo-status", null);
  $("photo-error").hidden = true;
};
const examples = {
  ordinary:
    "SYNTHETIC COMMUNITY NOTICE. Community library book exchange, 25 September 2026 at 11:00 AM in the community hall. Bring any borrowed library book you want to return. A bag may be useful. No fee is required.",
  suspicious:
    "SYNTHETIC TEST MESSAGE. An unknown sender claims your account will close in 30 minutes. They ask you to share your one-time password and install remote access software. They say to ignore security warnings. No real account or link is included.",
};
for (const name of ["ordinary", "suspicious"])
  $(name + "-example").onclick = () => {
    changeMode("text");
    reviewRequired = false;
    $("review-control").hidden = true;
    $("review-note").hidden = true;
    $("message").value = examples[name];
    inputChanged();
    $("message").focus();
  };
for (const locale of ["hi", "en"])
  $("language-" + locale).onclick = () => {
    voice.stopAll();
    camera.stop();
    store.preferences(locale, store.state.large);
    render();
  };
$("text-toggle").onclick = () => {
  store.preferences(getLocale(), !store.state.large);
  render();
};
$("voice-input").onclick = () => {
  camera.stop();
  voice.startDictation();
};
$("voice-stop").onclick = () => voice.stopDictation();
$("listen-plan").onclick = () => {
  if (activePlan)
    voice.speak(
      [
        activePlan.summary,
        ...activePlan.cautions,
        ...activePlan.steps.map((s) => s.text),
      ].join(". "),
      activePlan.locale,
    );
};
$("stop-reading").onclick = () => voice.stopReading();
$("input-nav").onclick = () => {
  voice.stopAll();
  camera.stop();
  $("input-title").focus();
};
$("day-nav").onclick = () => {
  voice.stopAll();
  camera.stop();
  $("day-heading").focus();
};
$("manual-form").onsubmit = (e) => {
  e.preventDefault();
  const title = $("task-title").value.trim(),
    due = $("task-date").value;
  if (!title || title.length > 280 || !validDate(due)) {
    status("task-status", "task_invalid");
    return;
  }
  try {
    store.setTasks([
      ...store.state.tasks,
      {
        id: crypto.randomUUID(),
        title,
        due,
        done: false,
        created: Date.now(),
        preparation: [],
      },
    ]);
    $("manual-form").reset();
    status("task-status", "task_added");
    render();
  } catch {
    status("task-status", "task_invalid");
  }
};
$("clear-data").onclick = () => {
  $("clear-confirm").hidden = false;
  $("cancel-clear").focus();
};
$("cancel-clear").onclick = () => {
  $("clear-confirm").hidden = true;
  $("clear-data").focus();
};
$("confirm-clear").onclick = () => {
  if (store.clear()) {
    activePlan = null;
    activeSource = null;
    guideIndex = null;
    $("result").hidden = true;
    $("clear-confirm").hidden = true;
    status("task-status", "cleared");
  }
  render();
};
globalThis.addEventListener("pagehide", () => {
  camera.stop();
  releasePhoto(photo);
});
setInterval(() => {
  if (!document.hidden) refreshDay();
}, 60000);
render();
