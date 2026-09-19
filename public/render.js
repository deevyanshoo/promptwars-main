import { t, getLocale } from "./i18n.js";
import { localDate, sortTasks } from "./task-utils.js";
import { nextStepIndex, planStatus } from "./plans.js";
export function el(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}
function button(key, fn, cls) {
  const n = el("button", t(key), cls);
  n.type = "button";
  n.addEventListener("click", fn);
  return n;
}
function listSection(parent, key, items, cls) {
  if (!items.length) return;
  const s = el("section", undefined, cls);
  s.append(el("h3", t(key)));
  const list = el("ul");
  items.forEach((item) => list.append(el("li", item)));
  s.append(list);
  parent.append(s);
}
export function formatDate(date) {
  return new Intl.DateTimeFormat(getLocale() === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date + "T12:00:00"));
}
export function renderPlan(
  root,
  plan,
  { saved, onSave, onGuide, onChange, onClarify, canClarify, onCopy },
) {
  root.replaceChildren();
  root.append(el("p", plan.summary, "explanation"));
  if (plan.instructionsWithheld)
    root.append(el("p", t("risk_pause"), "notice warning"));
  listSection(root, "cautions", plan.cautions, "cautions");
  listSection(root, "questions", plan.questions);
  if (plan.preparation.length) {
    listSection(root, "preparation", plan.preparation);
    root.append(el("p", t("preparation_hint"), "small muted"));
  }
  root.append(el("h3", t("steps")));
  const list = el("ol", undefined, "steps");
  for (const step of plan.steps) {
    const li = el("li", undefined, "step-row");
    const label = el("label", undefined, "check-row");
    const check = el("input");
    check.type = "checkbox";
    check.dataset.stepId = step.id;
    check.dataset.field = "done";
    check.checked = step.done;
    check.setAttribute(
      "aria-label",
      t(step.done ? "undo_for" : "done_for", { text: step.text }),
    );
    check.addEventListener("change", () =>
      onChange(step.id, { done: check.checked }),
    );
    label.append(check, el("span", step.text, step.done ? "done-text" : ""));
    li.append(label);
    const dateLabel = el("label", t("due_label"), "date-label");
    const date = el("input");
    date.type = "date";
    date.dataset.stepId = step.id;
    date.dataset.field = "due";
    date.min = "1900-01-01";
    date.max = "2100-12-31";
    date.value = step.due;
    date.setAttribute("aria-label", t("date_for", { text: step.text }));
    date.addEventListener("change", () =>
      onChange(step.id, { due: date.value }),
    );
    dateLabel.append(date);
    li.append(dateLabel);
    if (step.done) li.append(el("p", t("completed"), "small"));
    else if (step.due)
      li.append(
        el(
          "p",
          t(
            step.due < localDate()
              ? "overdue"
              : step.due === localDate()
                ? "due_today"
                : "upcoming",
          ) +
            ": " +
            formatDate(step.due),
          "small",
        ),
      );
    list.append(li);
  }
  root.append(list, el("p", t("completion_note"), "small muted"));
  const actions = el("div", undefined, "actions");
  if (plan.steps.length)
    actions.append(
      button(
        "start_guide",
        () => onGuide(Math.max(0, nextStepIndex(plan))),
        "primary",
      ),
    );
  actions.append(
    button(
      saved ? "already_saved" : "save_plan",
      onSave,
      saved ? "" : "primary",
    ),
  );
  if (saved) actions.lastChild.disabled = true;
  root.append(actions, el("p", t("save_notice"), "small muted"));
  const copy = button("copy_summary", onCopy);
  root.append(copy);
  const share = el("textarea");
  share.readOnly = true;
  share.rows = 4;
  share.setAttribute("aria-label", t("share_label"));
  share.value = [
    t("share_prefix"),
    plan.summary,
    ...plan.cautions,
    ...plan.steps.map((s) => s.text),
  ].join("\n");
  share.id = "share-summary";
  root.append(share);
  if (plan.questions.length) {
    if (canClarify) {
      const form = el("form");
      const label = el("label", t("clarification_label"));
      label.htmlFor = "clarification";
      const input = el("textarea");
      input.id = "clarification";
      input.maxLength = 800;
      input.rows = 2;
      const submit = el("button", t("recheck"));
      submit.type = "submit";
      form.append(
        label,
        input,
        el("p", t("clarification_hint"), "small muted"),
        submit,
      );
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        onClarify(input.value);
      });
      root.append(form);
    } else root.append(el("p", t("source_needed"), "notice"));
  }
}
export function renderGuide(
  root,
  plan,
  index,
  { onChange, onMove, onOverview, onListen },
) {
  root.replaceChildren();
  const step = plan.steps[index];
  if (nextStepIndex(plan) === -1) root.append(el("h3", t("all_complete")));
  if (step) {
    root.append(
      el(
        "p",
        t("step_position", { current: index + 1, total: plan.steps.length }),
        "muted",
      ),
      el("h3", t("current_step")),
      el("p", step.text, "current-step"),
    );
    if (step.due) root.append(el("p", formatDate(step.due)));
    const actions = el("div", undefined, "actions");
    actions.append(
      button("listen", () => onListen(step.text)),
      button(
        step.done ? "undo" : "done",
        () => onChange(step.id, { done: !step.done }),
        "primary",
      ),
    );
    root.append(actions);
    const nav = el("div", undefined, "actions");
    const back = button("back", () => onMove(index - 1));
    back.disabled = index === 0;
    const next = button("next", () => onMove(index + 1));
    next.disabled = index === plan.steps.length - 1;
    nav.append(back, next, button("overview", onOverview));
    root.append(nav);
  }
  root.append(el("p", t("completion_note"), "small muted"));
  listSection(root, "cautions", plan.cautions, "cautions");
  listSection(root, "preparation", plan.preparation);
}
export function renderDay({
  plans,
  tasks,
  onResume,
  onDelete,
  onTaskChange,
  onTaskDelete,
}) {
  const saved = document.querySelector("#saved-plans");
  saved.replaceChildren();
  if (plans.length) saved.append(el("h3", t("plans_title")));
  plans.forEach((p) => {
    const row = el("article", undefined, "saved-plan");
    row.append(
      el("p", p.summary, "plan-title"),
      el("p", t(planStatus(p)), "small"),
    );
    const actions = el("div", undefined, "actions");
    actions.append(
      button("resume", () => onResume(p.id)),
      button("delete_plan", () => onDelete(p.id), "text-action"),
    );
    row.append(actions);
    saved.append(row);
  });
  const list = document.querySelector("#task-list");
  list.replaceChildren();
  for (const task of sortTasks(tasks)) {
    const row = el("div", undefined, "task-row");
    const label = el("label", undefined, "check-row");
    const check = el("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.setAttribute(
      "aria-label",
      t(task.done ? "undo_for" : "done_for", { text: task.title }),
    );
    check.onchange = () => onTaskChange(task.id, check.checked);
    label.append(check, el("span", task.title, task.done ? "done-text" : ""));
    row.append(label);
    if (task.due)
      row.append(
        el(
          "p",
          t(
            task.done
              ? "completed"
              : task.due < localDate()
                ? "overdue"
                : task.due === localDate()
                  ? "due_today"
                  : "upcoming",
          ) +
            ": " +
            formatDate(task.due),
          "small",
        ),
      );
    const del = button("delete", () => onTaskDelete(task.id), "text-action");
    del.setAttribute("aria-label", t("delete_task", { text: task.title }));
    row.append(del);
    list.append(row);
  }
  const pending = [
    ...plans.flatMap((p) => p.steps.map((s) => ({ ...s, title: s.text }))),
    ...tasks,
  ]
    .filter((s) => !s.done)
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  const today = localDate();
  document.querySelector("#day-counts").textContent = t("day_counts", {
    overdue: pending.filter((s) => s.due && s.due < today).length,
    today: pending.filter((s) => s.due === today).length,
    upcoming: pending.filter((s) => s.due > today).length,
  });
  document.querySelector("#next-action").textContent = pending.length
    ? t("next_action", { text: pending[0].title })
    : t(plans.length || tasks.length ? "day_complete" : "day_empty");
  document.querySelector("#today").textContent = formatDate(today);
}
export function renderExecution(execution) {
  const root = document.querySelector("#execution-list");
  root.replaceChildren();
  if (!execution) return;
  document.querySelector("#execution-details").hidden = false;
  for (const node of execution.nodes || []) {
    root.append(
      el(
        "p",
        `${t(node.id)}: ${t("node_" + node.status)} (${(node.durationMs / 1000).toFixed(1)} ${t("seconds")})`,
      ),
    );
  }
}
