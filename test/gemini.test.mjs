import test from "node:test";
import assert from "node:assert/strict";
import { createGeminiGateway } from "../lib/gemini.mjs";

const input = { message: "A public notice", locale: "hi", prompt: "Explain the notice.", schema: { type: "object" } };
const complete = (text) => ({ text, candidates: [{ finishReason: "STOP" }] });

test("provider failure releases capacity so the next request can succeed", async () => {
  let calls = 0;
  const generate = createGeminiGateway({
    maxConcurrent: 1,
    client: { models: { generateContent: async () => {
      if (++calls === 1) throw new Error("Temporary provider failure");
      return complete('{"summary":"ready"}');
    } } },
  });
  await assert.rejects(generate(input), /Temporary/);
  assert.deepEqual(await generate(input), { summary: "ready" });
});

test("admission prevents a fifth concurrent call without disturbing accepted work", async () => {
  const finish = [];
  const generate = createGeminiGateway({
    client: { models: { generateContent: () => new Promise(resolve => finish.push(resolve)) } },
  });
  const accepted = Array.from({ length: 4 }, () => generate(input));
  await assert.rejects(generate(input), /capacity/);
  assert.equal(finish.length, 4);
  finish.forEach(resolve => resolve(complete('{}')));
  await Promise.all(accepted);
});

test("truncated and malformed provider output cannot become successful results", async () => {
  const responses = [
    { text: '{}', candidates: [{ finishReason: "MAX_TOKENS" }] },
    complete('{broken'),
  ];
  const generate = createGeminiGateway({
    client: { models: { generateContent: async () => responses.shift() } },
  });
  await assert.rejects(generate(input), /Incomplete/);
  await assert.rejects(generate(input), SyntaxError);
});
