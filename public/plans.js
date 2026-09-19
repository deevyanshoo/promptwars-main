import {
  validDate,
  validTask,
  localDate,
  dueCue,
  sortTasks,
} from "./task-utils.js";
export const STORAGE_KEY = "daywell.main.v2";
const id = () => globalThis.crypto.randomUUID();
const text = (v, max) =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const texts = (v, max, count) =>
  Array.isArray(v) && v.length <= count && v.every((s) => text(s, max));
export function validPlan(p) {
  return (
    !!p &&
    text(p.id, 80) &&
    ["hi", "en"].includes(p.locale) &&
    Number.isFinite(p.created) &&
    text(p.summary, 800) &&
    Array.isArray(p.steps) &&
    p.steps.length <= 5 &&
    p.steps.every(
      (s) =>
        text(s.id, 80) &&
        text(s.text, 280) &&
        typeof s.done === "boolean" &&
        validDate(s.due),
    ) &&
    new Set(p.steps.map((s) => s.id)).size === p.steps.length &&
    texts(p.preparation, 280, 3) &&
    texts(p.cautions, 280, 5) &&
    texts(p.questions, 280, 7) &&
    ["ordinary", "uncertain", "substantial"].includes(p.risk) &&
    typeof p.instructionsWithheld === "boolean"
  );
}
export function makePlan(response, locale) {
  return {
    id: id(),
    created: Date.now(),
    locale,
    summary: response.summary,
    steps: response.steps.map((text) => ({
      id: id(),
      text,
      done: false,
      due: "",
    })),
    preparation: [...response.preparation],
    cautions: [...response.cautions],
    questions: [...response.questions],
    risk: response.risk,
    instructionsWithheld: response.instructionsWithheld,
  };
}
export function completeStep(plan, stepId, done) {
  return {
    ...plan,
    steps: plan.steps.map((s) => (s.id === stepId ? { ...s, done } : s)),
  };
}
export function nextStepIndex(plan) {
  return plan.steps.findIndex((s) => !s.done);
}
export function nextUsefulAction(plans, tasks) {
  const candidates = plans.flatMap((plan) => {
    const step = plan.steps.find((s) => !s.done);
    return step ? [{ ...step, title: step.text, created: plan.created }] : [];
  });
  return (
    sortTasks([...candidates, ...tasks.filter((task) => !task.done)])[0] || null
  );
}
export function planStatus(plan, today = localDate()) {
  const pending = plan.steps.filter((s) => !s.done);
  if (!pending.length) return "completed";
  const cues = pending.map((step) => dueCue(step, today));
  return (
    ["overdue", "due_today", "upcoming"].find((key) => cues.includes(key)) ||
    "no_date"
  );
}
export function createPlanStore(storage) {
  let state = { version: 2, locale: "hi", large: false, plans: [], tasks: [] },
    warning = null,
    readOnly = false;
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (
        p.version !== 2 ||
        !["hi", "en"].includes(p.locale) ||
        typeof p.large !== "boolean" ||
        !Array.isArray(p.plans) ||
        p.plans.length > 30 ||
        !p.plans.every(validPlan) ||
        new Set(p.plans.map((v) => v.id)).size !== p.plans.length ||
        !Array.isArray(p.tasks) ||
        p.tasks.length > 100 ||
        !p.tasks.every(validTask)
      )
        throw new Error("corrupt");
      state = p;
    } else {
      const legacy = storage?.getItem("daywell.v1");
      if (legacy) {
        const old = JSON.parse(legacy);
        if (
          !Array.isArray(old.tasks) ||
          old.tasks.length > 100 ||
          !old.tasks.every(validTask)
        )
          throw new Error("corrupt");
        state = {
          ...state,
          tasks: old.tasks,
          locale: old.locale === "en" ? "en" : "hi",
          large: old.large === true,
        };
        warning = "storage_migrated";
      }
    }
    if (!storage) warning = "storage_unavailable";
  } catch {
    warning = "storage_corrupt";
    readOnly = true;
  }
  function persist() {
    if (readOnly) {
      warning = "storage_corrupt";
      return false;
    }
    try {
      if (!storage) throw new Error();
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      warning = null;
      return true;
    } catch {
      warning = "storage_failed";
      return false;
    }
  }
  return {
    get state() {
      return structuredClone(state);
    },
    get warning() {
      return warning;
    },
    preferences(locale, large) {
      state.locale = locale;
      state.large = large;
      return persist();
    },
    savePlan(plan) {
      if (!validPlan(plan)) throw new Error("plan_invalid");
      if (
        !state.plans.some((p) => p.id === plan.id) &&
        state.plans.length >= 30
      )
        throw new Error("plan_limit");
      const copy = structuredClone(plan);
      state.plans = state.plans.filter((p) => p.id !== copy.id);
      state.plans.unshift(copy);
      return persist();
    },
    deletePlan(planId) {
      state.plans = state.plans.filter((p) => p.id !== planId);
      return persist();
    },
    setTasks(tasks) {
      if (tasks.length > 100 || !tasks.every(validTask))
        throw new Error("task_invalid");
      state.tasks = structuredClone(tasks);
      return persist();
    },
    clear() {
      try {
        if (!storage) throw new Error();
        storage.removeItem(STORAGE_KEY);
        storage.removeItem("daywell.v1");
        state = {
          version: 2,
          locale: "hi",
          large: false,
          plans: [],
          tasks: [],
        };
        warning = null;
        readOnly = false;
        return true;
      } catch {
        warning = "clear_failed";
        return false;
      }
    },
  };
}
