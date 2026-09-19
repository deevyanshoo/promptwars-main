import http from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createGeminiGateway } from "./lib/gemini.mjs";
import { createWorkflow } from "./lib/workflow.mjs";
import { createExtractionWorkflow } from "./lib/extraction.mjs";
import { InputError } from "./lib/contracts.mjs";
import {
  securityHeaders,
  readJson,
  createAdmission,
  HttpError,
} from "./lib/http.mjs";
const generate = createGeminiGateway();
const assets = [
  "app.js",
  "i18n.js",
  "styles.css",
  "task-utils.js",
  "api.js",
  "photo.js",
  "voice.js",
  "plans.js",
  "render.js",
];
const staticFiles = new Map([
  ["/", ["public/index.html", "text/html; charset=utf-8"]],
  ...assets.map((name) => [
    "/" + name,
    [
      "public/" + name,
      name.endsWith(".css")
        ? "text/css; charset=utf-8"
        : "text/javascript; charset=utf-8",
    ],
  ]),
]);
export function createApp({
  workflow = createWorkflow(generate),
  extractionWorkflow = createExtractionWorkflow(generate),
  limit = 20,
} = {}) {
  const admission = createAdmission({ limit });
  return http.createServer(async (req, res) => {
    const send = (status, body, extra = {}) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, {
        ...securityHeaders,
        "Content-Type": "application/json; charset=utf-8",
        ...extra,
      });
      res.end(JSON.stringify(body));
    };
    let path;
    try {
      path = new URL(req.url, "http://localhost").pathname;
    } catch {
      return send(400, { code: "request_invalid" });
    }
    if (req.method === "GET" && path === "/health")
      return send(200, {
        status: "ok",
        service: "daywell-main",
        commit: process.env.APP_COMMIT || "local",
      });
    if (req.method === "GET" && staticFiles.has(path)) {
      try {
        const [file, type] = staticFiles.get(path);
        const content = await readFile(new URL(file, import.meta.url));
        res.writeHead(200, { ...securityHeaders, "Content-Type": type });
        res.end(content);
      } catch {
        send(500, { code: "page_failed" });
      }
      return;
    }
    if (
      req.method !== "POST" ||
      !["/api/understand", "/api/extract"].includes(path)
    )
      return send(404, { code: "not_found" });
    if (
      !/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] || "")
    )
      return send(415, { code: "request_invalid" });
    if (req.headers["sec-fetch-site"] === "cross-site")
      return send(403, { code: "same_origin" });
    if (req.headers.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host)
          return send(403, { code: "same_origin" });
      } catch {
        return send(403, { code: "same_origin" });
      }
    }
    if (!admission.enter())
      return send(
        429,
        { code: "busy", retryable: true },
        { "Retry-After": "60" },
      );
    const controller = new AbortController();
    const disconnect = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on("close", disconnect);
    const timer = setTimeout(() => {
      controller.abort();
      send(408, { code: "timeout", retryable: true });
    }, 50000);
    try {
      const extracting = path === "/api/extract";
      const body = await readJson(req, extracting ? 4300000 : 20000);
      const options = {
        timeoutMs: 45000,
        signal: controller.signal,
        locale: body?.locale,
        clarification: body?.clarification,
      };
      const result = extracting
        ? await extractionWorkflow(body?.image, options)
        : await workflow(body?.message, options);
      send(200, result);
    } catch (error) {
      const cause = error.cause || error;
      const invalid = cause instanceof InputError;
      const code =
        error instanceof HttpError
          ? error.code
          : invalid
            ? cause.message.startsWith("image_")
              ? cause.message
              : "input_invalid"
            : path === "/api/extract"
              ? "extraction_failed"
              : "planning_failed";
      send(error.status || (invalid ? 400 : 502), {
        code,
        error: invalid
          ? cause.message
          : "The required workflow did not complete. Please try again.",
        retryable: !invalid,
        ...(error.execution ? { execution: error.execution } : {}),
      });
      if (!invalid && !(error instanceof HttpError))
        console.error(
          JSON.stringify({
            event: "workflow_failed",
            route: path,
            causeType: cause.name,
            upstreamStatus: Number(cause.status) || null,
          }),
        );
    } finally {
      admission.leave();
      clearTimeout(timer);
      res.off("close", disconnect);
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const server = createApp();
  server.requestTimeout = 55000;
  server.headersTimeout = 10000;
  server.listen(Number(process.env.PORT) || 8080, "0.0.0.0", () =>
    console.log("Daywell main listening"),
  );
}
