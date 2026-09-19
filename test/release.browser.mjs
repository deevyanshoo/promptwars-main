// Optional browser runner. Playwright is a verification tool, not an app dependency.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs APP_URL=http://localhost:8084 node test/release.browser.mjs
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {}),
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--disable-features=Translate,TranslateUI",
  ],
});
const context = await browser.newContext();
await context.addInitScript(() => {
  window.testRecognitionSessions = [];
  window.SpeechRecognition = class {
    constructor() {
      window.testRecognitionSessions.push(this);
    }
    start() {
      this.onstart?.();
    }
    stop() {
      this.onend?.();
    }
  };
  const schedule = window.setInterval.bind(window);
  window.setInterval = (callback, delay, ...args) => {
    if (delay === 60000) window.refreshDayTimer = callback;
    return schedule(callback, delay, ...args);
  };
});
const page = await context.newPage();
const plan = {
  summary: "Plan A, for photo A only.",
  steps: ["Verify notice A."],
  preparation: [],
  cautions: ["Check source A."],
  questions: ["Who sent this notice?"],
  risk: "ordinary",
  instructionsWithheld: false,
  dateNeedsClarification: false,
};
const execution = { nodes: [] };
let failPlan = false,
  failExtraction = false;
const planRequests = [];
await page.route("**/api/extract", (route) =>
  route.fulfill({
    status: failExtraction ? 502 : 200,
    contentType: "application/json",
    body: JSON.stringify(
      failExtraction
        ? { code: "extraction_failed" }
        : {
            locale: "en",
            extraction: {
              text: "PHOTO A reviewed source",
              readability: "readable",
              uncertain: [],
            },
            execution,
          },
    ),
  }),
);
await page.route("**/api/understand", (route) => {
  planRequests.push(route.request().postDataJSON());
  return route.fulfill({
    status: failPlan ? 502 : 200,
    contentType: "application/json",
    body: JSON.stringify(
      failPlan
        ? { code: "planning_failed" }
        : { locale: "en", plan, execution },
    ),
  });
});
const upload = async () => {
  const data = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 100;
    c.height = 100;
    c.getContext("2d").fillRect(0, 0, 100, 100);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.locator("#photo-file").setInputFiles({
    name: "synthetic.png",
    mimeType: "image/png",
    buffer: Buffer.from(data, "base64"),
  });
  await page.locator("#photo-preview").waitFor({ state: "visible" });
};
const prepareA = async () => {
  failPlan = false;
  failExtraction = false;
  await page.locator("#photo-mode").click();
  await upload();
  await page.locator("#extract-button").click();
  await page.waitForFunction(
    () => !document.querySelector("#extract-button").disabled,
  );
  await page.locator("#review-confirm").check();
  await page.locator("#understand-button").click();
  await page.locator(".explanation").waitFor({ state: "visible" });
};
const assertCleared = async () => {
  assert.equal(await page.locator("#message").inputValue(), "");
  assert.equal(await page.locator("#review-confirm").isChecked(), false);
  assert.equal(await page.locator("#review-note").isVisible(), false);
  assert.equal(await page.locator("#result").isVisible(), false);
  assert.equal(await page.locator("#plan-overview").textContent(), "");
  await page.locator("#text-toggle").click();
  await page.locator("#language-hi").click();
  await page.locator("#language-en").click();
  assert.equal(await page.locator("#result").isVisible(), false);
};
try {
  await page.goto(process.env.APP_URL || "http://localhost:8084");
  await page.locator("#language-en").click();
  await prepareA();
  await page
    .getByRole("button", { name: "Save this plan", exact: true })
    .click();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("daywell.main.v2")).plans,
  );
  assert.equal(saved.length, 1);
  await upload();
  await assertCleared();
  failExtraction = true;
  await page.locator("#extract-button").click();
  await page.locator("#photo-error").waitFor({ state: "visible" });
  await assertCleared();
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).plans,
    ),
    saved,
  );
  console.log(
    "PASS: replacing A with B clears review, checked consent and current draft, including failed extraction and preference renders; saved A preserved",
  );
  await prepareA();
  await page.locator("#discard-photo").click();
  await assertCleared();
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).plans,
    ),
    saved,
  );
  console.log(
    "PASS: removing photo invalidates current review/draft and preserves saved plans",
  );
  await prepareA();
  await page.locator("#camera-start").click();
  await page.waitForFunction(
    () =>
      !document.querySelector("#camera-take").disabled &&
      document.querySelector("#camera-video").videoWidth > 0,
  );
  await page.locator("#camera-take").click();
  await page.locator("#photo-preview").waitFor({ state: "visible" });
  await assertCleared();
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).plans,
    ),
    saved,
  );
  console.log("PASS: camera capture invalidates the previous review and draft");
  await prepareA();
  await page.locator("#text-mode").click();
  await page.locator("#message").fill("Source B should fail");
  await page.locator("#review-confirm").check();
  failPlan = true;
  await page.locator("#understand-button").click();
  await page.locator("#request-error").waitFor({ state: "visible" });
  await page.locator("#text-toggle").click();
  await page.locator("#language-hi").click();
  await page.locator("#language-en").click();
  assert.equal(await page.locator("#result").isVisible(), false);
  assert.equal(await page.locator("#plan-overview").textContent(), "");
  assert.equal(
    await page.locator("#message").inputValue(),
    "Source B should fail",
  );
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).plans,
    ),
    saved,
  );
  console.log(
    "PASS: failed B cannot resurrect A through language or text-size changes; B input retained and saved A preserved",
  );
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("daywell.main.v2"));
    state.plans[0].steps = [];
    localStorage.setItem("daywell.main.v2", JSON.stringify(state));
  });
  await page.reload();
  await page.getByRole("button", { name: "Resume plan", exact: true }).click();
  assert.equal(await page.locator("#guide").isVisible(), false);
  assert.equal(await page.locator("#plan-overview").isVisible(), true);
  console.log("PASS: zero-step saved plan resumes in overview");
  await page.evaluate(() => window.refreshDayTimer());
  await page.getByRole("button", { name: "Delete plan", exact: true }).click();
  assert.equal(await page.locator("#result").isVisible(), false);
  await page.locator("#text-toggle").click();
  assert.equal(await page.locator("#result").isVisible(), false);
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).plans.length,
    ),
    0,
  );
  await page.locator("#task-title").fill("Test manual task");
  await page.locator("#manual-form button").click();
  await page.evaluate(() => window.refreshDayTimer());
  await page.locator("#task-list input[type=checkbox]").check();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).tasks[0].done,
    ),
    true,
  );
  await page.locator("#task-list button").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("daywell.main.v2")).tasks.length,
    ),
    0,
  );
  console.log(
    "PASS: timer-refreshed controls use shared delete/complete handlers and clear an open deleted plan",
  );

  await prepareA();
  const reviewedSource = "  Reviewed notice A.\nKeep this exact spacing.  ";
  const beforeReviewValidation = planRequests.length;
  await page.locator("#review-confirm").uncheck();
  await page.locator("#understand-button").click();
  await page.locator("#request-error").waitFor({ state: "visible" });
  assert.equal(planRequests.length, beforeReviewValidation);
  await page.locator("#review-confirm").check();
  await page.locator("#retry").click();
  await page.locator("#result").waitFor({ state: "visible" });
  assert.equal(planRequests.length, beforeReviewValidation + 1);
  await page.locator("#message").fill(reviewedSource);
  await page.locator("#review-confirm").check();
  await page.locator("#understand-button").click();
  await page.locator("#clarification").waitFor({ state: "visible" });
  const clarification =
    "  Sent by our community group.\nRoom 4 is confirmed.  ";
  await page.locator("#clarification").fill(clarification);
  failPlan = true;
  await page.locator("#plan-overview form button").click();
  await page.locator("#request-error").waitFor({ state: "visible" });
  const reviewedRequest = {
    message: reviewedSource,
    locale: "en",
    clarification,
  };
  assert.deepEqual(planRequests.at(-1), reviewedRequest);
  await page.locator("#text-toggle").click();
  await page.locator("#retry").click();
  await page.waitForFunction(() => !document.querySelector("#retry").disabled);
  assert.deepEqual(planRequests.at(-1), reviewedRequest);
  assert.equal(await page.locator("#message").inputValue(), reviewedSource);
  const beforeUncheckedRetry = planRequests.length;
  await page.locator("#review-confirm").uncheck();
  await page.locator("#retry").click();
  assert.equal(planRequests.length, beforeUncheckedRetry);
  await page.locator("#review-confirm").check();
  failPlan = false;
  await page.locator("#retry").click();
  await page.locator("#result").waitFor({ state: "visible" });
  assert.deepEqual(planRequests.at(-1), reviewedRequest);
  console.log(
    "PASS: repeated retry preserves exact reviewed source, locale and clarification across text sizing and still requires review confirmation",
  );

  failPlan = true;
  await page.locator("#clarification").fill("Old clarification for A");
  await page.locator("#plan-overview form button").click();
  await page.locator("#request-error").waitFor({ state: "visible" });
  await page.locator("#message").fill("New source B");
  assert.equal(await page.locator("#request-error").isVisible(), false);
  assert.equal(await page.locator("#review-confirm").isChecked(), false);
  await page.locator("#review-confirm").check();
  await page.locator("#understand-button").click();
  await page.locator("#request-error").waitFor({ state: "visible" });
  assert.deepEqual(planRequests.at(-1), {
    message: "New source B",
    locale: "en",
    clarification: "",
  });
  await page.locator("#language-hi").click();
  assert.equal(await page.locator("#request-error").isVisible(), false);
  failPlan = false;
  await page.locator("#understand-button").click();
  await page.locator("#result").waitFor({ state: "visible" });
  assert.deepEqual(planRequests.at(-1), {
    message: "New source B",
    locale: "hi",
    clarification: "",
  });
  console.log(
    "PASS: changed source or language invalidates old retry; the next explicit request contains no stale clarification",
  );

  await page.locator("#text-mode").click();
  await page.locator("#voice-input").click();
  await page.locator("#voice-stop").click();
  await page.locator("#voice-input").click();
  const beforeLateSpeech = await page.locator("#message").inputValue();
  await page.evaluate(() => {
    const old = window.testRecognitionSessions[0];
    old.onstart();
    old.onresult({
      resultIndex: 0,
      results: [Object.assign([{ transcript: "STALE" }], { isFinal: true })],
    });
    old.onerror({ error: "not-allowed" });
    old.onend();
  });
  assert.equal(await page.locator("#message").inputValue(), beforeLateSpeech);
  assert.equal(await page.locator("#voice-stop").isVisible(), true);
  assert.equal(await page.locator("#voice-input").isDisabled(), true);
  await page.locator("#language-en").click();
  await page.evaluate(() => {
    const old = window.testRecognitionSessions.at(-1);
    old.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: "WRONG LANGUAGE" }], { isFinal: true }),
      ],
    });
    old.onend();
  });
  assert.equal(await page.locator("#message").inputValue(), beforeLateSpeech);
  assert.equal(await page.locator("#voice-stop").isVisible(), false);
  assert.equal(await page.locator("#voice-input").isEnabled(), true);
  console.log(
    "PASS: stale recognition callbacks cannot append text, stop a newer session or undo language-change cleanup in the real UI",
  );

  await prepareA();
  const date = page.locator('#plan-overview input[type="date"]');
  const row = page.locator("#plan-overview .step-row");
  await date.fill("2000-01-01");
  assert.match(await row.innerText(), /Overdue/);
  await page.locator("#language-hi").click();
  assert.match(await row.innerText(), /तारीख निकल गई/);
  await page.locator("#language-en").click();
  const today = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  await date.fill(today);
  assert.match(await row.innerText(), /Due today/);
  await date.fill("2099-01-01");
  assert.match(await row.innerText(), /Upcoming/);
  await page
    .getByRole("button", { name: "Save this plan", exact: true })
    .click();
  await row.locator('input[type="checkbox"]').check();
  assert.match(await row.innerText(), /Completed/);
  await page.reload();
  await page.getByRole("button", { name: "Resume plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Back to overview", exact: true })
    .click();
  assert.equal(await row.locator('input[type="checkbox"]').isChecked(), true);
  await row.locator('input[type="checkbox"]').uncheck();
  assert.match(await row.innerText(), /Upcoming/);
  assert.equal(await date.inputValue(), "2099-01-01");
  console.log(
    "PASS: production date cues retain Hindi/English translations and completion/undo survives saved-plan reload",
  );
} finally {
  await browser.close();
}
