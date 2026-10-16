import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Los textos que ve la persona no deben sonar a plantilla.
const FILES = [
  "../components/BreachCheck.tsx",
  "../components/check/copy.ts",
  "../components/check/lessons.ts",
  "../components/scenes/Comprobar.tsx",
  "../lib/guide.ts",
  "../lib/breaches.ts",
  "../functions/api/check.ts",
];

const BANNED = /\b(corto|cortos|breve|breves|rápido|rápida|rápidos|rápidas|rápidamente)\b/i;

test("los textos visibles no dicen corto, breve ni rápido", async () => {
  for (const relative of FILES) {
    const text = await readFile(new URL(relative, import.meta.url), "utf8");
    const visible = text
      .split("\n")
      .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*") && !line.trim().startsWith("/*"))
      .join("\n");
    assert.equal(BANNED.test(visible), false, relative);
  }
});
