import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { t, getLocale, translations } from "../public/i18n.js";
test("Hindi first visit and complete explicit translation key parity", async () => {
  assert.equal(getLocale(), "hi");
  assert.equal(t("heading"), "आज किस काम में मदद चाहिए?");
  assert.deepEqual(Object.keys(translations.hi), Object.keys(translations.en));
  for (const locale of ["hi", "en"])
    for (const value of Object.values(translations[locale])) {
      assert.ok(value.trim());
      assert.doesNotMatch(value, /[–—]/);
    }
  const html = await readFile(
    new URL("../public/index.html", import.meta.url),
    "utf8",
  );
  for (const match of html.matchAll(
    /data-i18n(?:-label|-placeholder)?="([^"]+)"/g,
  ))
    assert.ok(translations.hi[match[1]], match[1]);
  const source = await readFile(
    new URL("../public/i18n.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /MutationObserver/);
});
