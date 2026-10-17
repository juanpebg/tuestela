import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../components/check/cards.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const cards = {};
vm.runInNewContext(compiled, {
  exports: cards,
  require(specifier) {
    throw new Error(`cards no debería cargar ${specifier}`);
  },
});
const { usableCard, fallbackCard } = cards;

test("una ficha sin datos filtrados sigue pudiendo pintarse", () => {
  const card = usableCard({ title: "Adobe", date: "ayer" });
  assert.equal(card.title, "Adobe");
  assert.equal(
    JSON.stringify(card.leaked),
    JSON.stringify(["No se detalla qué datos concretos se filtraron"]),
  );
  assert.equal(Array.isArray(card.leaked), true);
});

test("un dato que no es texto no entra en la ficha", () => {
  const card = usableCard({
    title: "Rota",
    leaked: [{ label: "Contraseñas" }, "Nombres", "Nombres", null, "  Teléfonos  "],
    sources: [{ id: "hibp", label: "Have I Been Pwned" }, "mal", { id: "hibp" }],
    happened: "Pasó algo.",
  });
  assert.equal(JSON.stringify(card.leaked), JSON.stringify(["Nombres", "Teléfonos"]));
  assert.equal(card.sources.length, 1);
  assert.equal(card.sources[0].label, "Have I Been Pwned");
  assert.equal(card.happened, "Pasó algo.");
});

test("si no hay título ni datos, no hay ficha", () => {
  assert.equal(usableCard(null), null);
  assert.equal(usableCard({ leaked: [null, { a: 1 }] }), null);
  assert.equal(usableCard("Adobe"), null);
});

test("la ficha de reserva cuenta algo y deja un paso", () => {
  const card = fallbackCard();
  assert.equal(typeof card.title, "string");
  assert.equal(card.leaked.length > 0, true);
  assert.match(card.todo, /verificación en dos pasos/);
});
