import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../lib/providers/xposedornot.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const xon = {};
vm.runInNewContext(compiled, {
  exports: xon,
  require(specifier) {
    throw new Error(`xposedornot no debería cargar ${specifier}`);
  },
});

test("la bandera solo acepta true, 1 o yes", () => {
  assert.equal(xon.xonEnabled(undefined), false);
  assert.equal(xon.xonEnabled(""), false);
  assert.equal(xon.xonEnabled("false"), false);
  assert.equal(xon.xonEnabled("no"), false);
  assert.equal(xon.xonEnabled(" YES "), true);
  assert.equal(xon.xonEnabled("1"), true);
  assert.equal(xon.xonEnabled("true"), true);
});

test("los nombres anidados se aplanan y un error es lista vacía", () => {
  assert.equal(
    JSON.stringify(xon.namesFromXon({ breaches: [["Adobe", "Canva"], "LinkedIn"] })),
    JSON.stringify(["Adobe", "Canva", "LinkedIn"]),
  );
  assert.equal(JSON.stringify(xon.namesFromXon({ Error: "Not found" })), "[]");
  assert.equal(JSON.stringify(xon.namesFromXon({ breaches: null })), "[]");
  assert.equal(xon.namesFromXon({ breaches: { Adobe: true } }), null);
  assert.equal(xon.namesFromXon(null), null);
});
