// Optional browser runner. Playwright is a verification tool, not an app dependency.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs APP_URL=http://localhost:8084 node test/release.browser.mjs
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--disable-features=Translate,TranslateUI",
  ],
});
const context = await browser.newContext();
const page = await context.newPage();
const plan = {
  summary: "Plan A, for photo A only.",
  steps: ["Verify notice A."],
  preparation: [],
  cautions: ["Check source A."],
  questions: [],
  risk: "ordinary",
  instructionsWithheld: false,
  dateNeedsClarification: false,
};
const execution = { nodes: [] };
let failPlan = false,
  failExtraction = false;
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
await page.route("**/api/understand", (route) =>
  route.fulfill({
    status: failPlan ? 502 : 200,
    contentType: "application/json",
    body: JSON.stringify(
      failPlan
        ? { code: "planning_failed" }
        : { locale: "en", plan, execution },
    ),
  }),
);
const upload = async () => {
  const data = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 100;
    c.height = 100;
    c.getContext("2d").fillRect(0, 0, 100, 100);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page
    .locator("#photo-file")
    .setInputFiles({
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
} finally {
  await browser.close();
}
