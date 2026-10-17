import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

test("las cabeceras no envían COOP y conservan la CSP", async () => {
  const headers = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  assert.equal(headers.includes("Cross-Origin-Opener-Policy"), false);
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(headers, /script-src 'self' 'unsafe-inline'/);
});

test("el build incluye Safari 15 e iOS 15", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.browserslist.includes("safari 15"));
  assert.ok(pkg.browserslist.includes("ios_saf 15"));
});

test("el guion de respaldo es ES5, polyfilla y no usa almacenamiento real si falla", () => {
  const printed = execFileSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--eval",
      `import { SAFARI_GUARD } from "./lib/safari-guard.ts"; process.stdout.write(SAFARI_GUARD);`,
    ],
    { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8" },
  );

  assert.equal(printed.includes("=>"), false);
  assert.equal(printed.includes("static{"), false);
  assert.equal(printed.includes("static {"), false);
  assert.equal(printed.includes("(?<="), false);
  assert.equal(printed.includes("(?<!"), false);
  assert.equal(/\bawait\b/.test(printed), false);
  assert.match(printed, /Array\.prototype\.at/);
  assert.match(printed, /Object\.hasOwn/);
  assert.match(printed, /localStorage/);
  assert.match(printed, /action=\\"\/api\/check\\"/);
  new Function(printed);

  const listeners = {};
  const respaldo = {
    id: "estela-respaldo",
    innerHTML: "<p>formulario</p>",
    textContent: "tuEstela formulario",
    style: {},
    setAttribute() {},
  };
  const sample = { style: { opacity: "0" } };
  const context = {
    window: null,
    document: {
      documentElement: { className: "" },
      body: {
        textContent: "",
        appendChild() {},
      },
      readyState: "complete",
      getElementById(id) {
        return id === "estela-respaldo" ? respaldo : null;
      },
      querySelector() {
        return sample;
      },
      querySelectorAll() {
        return [sample];
      },
      addEventListener(type, fn) {
        listeners[type] = fn;
      },
      createElement() {
        return respaldo;
      },
    },
    Object,
    Array,
    String,
    TypeError,
    Number,
    RegExp,
    Date,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    parseFloat,
    addEventListener(type, fn) {
      listeners[type] = fn;
    },
    setTimeout(fn) {
      fn();
    },
    getComputedStyle(node) {
      return {
        display: "block",
        visibility: "visible",
        opacity: node.style.opacity || "0",
      };
    },
  };
  context.window = context;
  let localWrites = 0;
  const blocked = {
    getItem() {
      return null;
    },
    setItem() {
      localWrites += 1;
      throw new Error("QuotaExceededError");
    },
    removeItem() {},
  };
  context.localStorage = blocked;
  context.sessionStorage = blocked;
  const previousAt = Array.prototype.at;
  const previousHasOwn = Object.hasOwn;
  delete Array.prototype.at;
  delete Object.hasOwn;
  vm.createContext(context);
  try {
  vm.runInContext(printed, context);

  assert.equal([1, 2, 3].at(-1), 3);
  assert.equal("ab".at(-2), "a");
  assert.equal(Object.hasOwn({ a: 1 }, "a"), true);
  context.localStorage.setItem("correo", "no");
  assert.equal(context.localStorage.getItem("correo"), "no");
  assert.ok(localWrites >= 1);

  listeners.error({ target: context.window, message: "SyntaxError: Unexpected token '{'" });
  assert.equal(respaldo.style.display, "block");
  assert.equal(respaldo.style.position, "fixed");

  listeners.click({ target: { id: "estela-seguir" } });
  assert.equal(respaldo.style.display, "none");
  } finally {
    if (previousAt) Array.prototype.at = previousAt;
    if (previousHasOwn) Object.hasOwn = previousHasOwn;
  }
});

test("el HTML de la página lleva el guion, el respaldo y la entrada visible sin JS", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /id="estela-guard"/);
  assert.match(layout, /id="estela-respaldo"/);
  assert.match(layout, /\.enter \{ opacity: 1/);
  const readme = await readFile(new URL("../docs/decisions/README.md", import.meta.url), "utf8");
  assert.match(readme, /0016-safari-ios-no-se-queda-en-blanco\.md/);
  const hero = await readFile(new URL("../components/scenes/Hero.tsx", import.meta.url), "utf8");
  assert.match(hero, /className="enter /);
});
