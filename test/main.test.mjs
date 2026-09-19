import test from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { validateUpload, MAX_IMAGE_BYTES } from "../lib/images.mjs";
import {
  createExtractionWorkflow,
  validateExtraction,
} from "../lib/extraction.mjs";
import {
  createPlanStore,
  makePlan,
  completeStep,
  nextStepIndex,
  planStatus,
  STORAGE_KEY,
} from "../public/plans.js";
function png(width = 32, height = 32) {
  const chunk = (name, data) => {
    const b = Buffer.alloc(data.length + 12);
    b.writeUInt32BE(data.length);
    b.write(name, 4);
    data.copy(b, 8);
    return b;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return {
    mimeType: "image/png",
    data: Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(Buffer.alloc(32 * 97))),
      chunk("IEND", Buffer.alloc(0)),
    ]).toString("base64"),
  };
}
test("invalid upload types, base64, signature, MIME and limits make zero AI calls", async () => {
  let calls = 0;
  const run = createExtractionWorkflow(async () => {
    calls++;
  });
  for (const image of [
    null,
    { mimeType: "application/pdf", data: "AAAA" },
    { ...png(), mimeType: "image/jpeg" },
    { ...png(), data: "not base64" },
    { ...png(), data: "A".repeat(Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4) },
    png(1601, 32),
    png(1, 32),
  ])
    await assert.rejects(run(image));
  assert.equal(calls, 0);
  assert.equal(validateUpload(png()).width, 32);
});
test("photo DAG validates extraction, preserves text and returns actual nodes", async () => {
  const source = "Notice, 25 September 2026.";
  const result = await createExtractionWorkflow(async (args) => {
    assert.equal(args.locale, "hi");
    assert.equal(args.preserveSourceLanguage, true);
    return { text: source, readability: "readable", uncertain: [] };
  })(png(), { locale: "hi" });
  assert.equal(result.extraction.text, source);
  assert.deepEqual(
    result.execution.nodes.map((n) => n.status),
    ["completed", "completed", "completed"],
  );
});
test("unreadable and too-long extraction never invent text; malformed extraction fails", async () => {
  for (const readability of ["unreadable", "too_long"]) {
    assert.equal(
      validateExtraction({
        text: "",
        readability,
        uncertain: ["Try another photo."],
      }).text,
      "",
    );
    assert.throws(() =>
      validateExtraction({ text: "invented", readability, uncertain: [] }),
    );
  }
  for (const value of [
    {},
    { text: "x", readability: "partial", uncertain: [] },
    { text: "x".repeat(4001), readability: "readable", uncertain: [] },
  ])
    await assert.rejects(createExtractionWorkflow(async () => value)(png()));
});
const response = {
  summary: "The notice describes a meeting.",
  steps: ["Check the time.", "Prepare a bag."],
  preparation: ["A bag may help."],
  cautions: ["Confirm details."],
  questions: [],
  risk: "ordinary",
  instructionsWithheld: false,
};
const memory = () => {
  const m = new Map();
  return {
    getItem: (k) => m.get(k) || null,
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
  };
};
test("explicit save, completion, undo, dates and reload preserve plan content", () => {
  const storage = memory(),
    store = createPlanStore(storage);
  let p = makePlan(response, "hi");
  assert.equal(storage.getItem(STORAGE_KEY), null);
  p.steps[0].due = "2026-09-18";
  assert.equal(planStatus(p, "2026-09-19"), "overdue");
  store.savePlan(p);
  p = completeStep(p, p.steps[0].id, true);
  store.savePlan(p);
  const restored = createPlanStore(storage).state.plans[0];
  assert.equal(restored.steps[0].done, true);
  assert.equal(nextStepIndex(restored), 1);
  assert.equal(
    completeStep(restored, restored.steps[0].id, false).steps[0].done,
    false,
  );
  store.preferences("en", true);
  assert.deepEqual(store.state.plans[0].steps, restored.steps);
  assert.equal(store.state.plans[0].locale, "hi");
  assert.equal("source" in restored, false);
});
test("corrupt storage is preserved, quota and unavailable storage fail visibly", () => {
  const storage = memory();
  storage.setItem(STORAGE_KEY, "broken");
  const store = createPlanStore(storage);
  assert.equal(store.warning, "storage_corrupt");
  assert.equal(store.savePlan(makePlan(response, "en")), false);
  assert.equal(storage.getItem(STORAGE_KEY), "broken");
  assert.equal(store.clear(), true);
  assert.equal(store.savePlan(makePlan(response, "en")), true);
  const missing = createPlanStore(null);
  assert.equal(missing.warning, "storage_unavailable");
  assert.equal(missing.savePlan(makePlan(response, "hi")), false);
  const quota = createPlanStore({
    getItem: () => null,
    setItem: () => {
      throw new Error("quota");
    },
  });
  assert.equal(quota.savePlan(makePlan(response, "hi")), false);
  assert.equal(quota.warning, "storage_failed");
});
