export const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=()",
  "Cache-Control": "no-store",
};
export class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
export async function readJson(req, maxBytes) {
  let size = 0;
  const chunks = [];
  if (Number(req.headers["content-length"]) > maxBytes)
    throw new HttpError(413, "request_size");
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, "request_size");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "request_invalid");
  }
}
export function createAdmission({ limit = 20, maxActive = 2 } = {}) {
  let active = 0,
    times = [];
  return {
    enter() {
      const now = Date.now();
      times = times.filter((t) => now - t < 60000);
      if (times.length >= limit || active >= maxActive) return false;
      times.push(now);
      active++;
      return true;
    },
    leave() {
      active--;
    },
  };
}
