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
  "../app/privacidad/page.tsx",
  "../components/Footer.tsx",
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

test("el permiso enlaza la política sin salir de la conversación", async () => {
  const chat = await readFile(new URL("../components/BreachCheck.tsx", import.meta.url), "utf8");
  assert.match(chat, /href=\{PRIVACY_HREF\}/);
  assert.match(chat, /target="_blank"/);
  assert.match(chat, /privacy: true/);
  const page = await readFile(new URL("../app/privacidad/page.tsx", import.meta.url), "utf8");
  assert.match(page, /Have I Been Pwned/);
  assert.match(page, /No lo guardamos/);
  assert.match(page, /solo el correo/i);
});
