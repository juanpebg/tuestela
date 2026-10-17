import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../lib/guide.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const guide = {};
vm.runInNewContext(compiled, {
  exports: guide,
  require(specifier) {
    throw new Error(`guide no debería cargar ${specifier}`);
  },
});
const { compose } = guide;

function card(overrides) {
  return {
    title: "Servicio",
    domain: "servicio.example",
    date: "4 de octubre de 2013",
    leaked: ["Direcciones de correo"],
    note: null,
    affected: "10 cuentas afectadas",
    ...overrides,
  };
}

const empty = {
  found: false,
  summary: "Buena señal: no aparece.",
  detail: "Eso no demuestra nada más.",
  footnote: null,
  breaches: [],
  advice: [],
};

test("sin filtraciones la guía sigue siendo educativa y no cambia el resumen", () => {
  const view = compose(empty);
  assert.equal(view.found, false);
  assert.equal(view.summary, empty.summary);
  assert.match(view.speech, /No apareces en ninguna filtración/);
  assert.equal(view.plan.length, 3);
  assert.equal(view.breaches.length, 0);
});

test("las contraseñas van antes que una lista reciente sin claves", () => {
  const view = compose({
    found: true,
    summary: "Este correo aparece en 2 filtraciones.",
    detail: "detalle",
    footnote: "La fecha es orientativa.",
    advice: [],
    breaches: [
      card({ title: "Reciente", date: "2 de marzo de 2024", leaked: ["Direcciones de correo"] }),
      card({
        title: "Antigua",
        date: "4 de octubre de 2013",
        leaked: ["Contraseñas", "Teléfonos"],
      }),
    ],
  });
  assert.equal(view.breaches[0].title, "Antigua");
  assert.equal(view.breaches[0].group, "primero");
  assert.equal(view.breaches[1].title, "Reciente");
  assert.equal(view.breaches[1].group, "tambien");
  assert.match(view.breaches[0].happened, /Antigua/);
  assert.match(view.breaches[0].todo, /gestor/i);
  assert.equal(view.breaches[0].sources[0].id, "hibp");
  assert.equal(JSON.stringify(view).includes("haveibeenpwned.com"), false);
  assert.equal(JSON.stringify(view).toLowerCase().includes("peligro"), false);
  assert.equal(JSON.stringify(view).toLowerCase().includes("hackeado"), false);
});

test("un nombre repetido suma la fuente y uno nuevo abre otra tarjeta", () => {
  const view = compose(
    {
      found: true,
      summary: "Este correo aparece en 1 filtración.",
      detail: "detalle",
      footnote: "La fecha es orientativa.",
      advice: [],
      breaches: [card({ title: "Adobe", leaked: ["Contraseñas"] })],
    },
    ["adobe", "Canva"],
  );
  assert.equal(view.breaches.length, 2);
  assert.equal(view.breaches[0].title, "Adobe");
  assert.equal(
    JSON.stringify(view.breaches[0].sources.map((source) => source.id)),
    JSON.stringify(["hibp", "xposedornot"]),
  );
  const canva = view.breaches.find((item) => item.title === "Canva");
  assert.equal(canva.sources[0].id, "xposedornot");
  assert.equal(canva.group, "tambien");
  assert.match(view.summary, /2 filtraciones/);
});

test("con muchas filtraciones el primer mensaje no abre con el número", () => {
  const breaches = Array.from({ length: 257 }, (_, index) =>
    card({ title: `Servicio ${index}`, date: "4 de octubre de 2013" }),
  );
  const view = compose({
    found: true,
    summary: "Este correo aparece en 257 filtraciones.",
    detail:
      "Son 257 en total. No hace falta mirarlas una a una: te dejo las primeras y el resto, por si quieres verlo.",
    footnote: "La fecha es orientativa.",
    advice: [],
    breaches,
  });
  assert.equal(view.breaches.length, 257);
  assert.match(view.speech, /Hay bastantes/);
  assert.equal(view.speech.includes("He encontrado"), false);
  assert.equal(view.speech.includes("257"), false);
  assert.match(view.speech, /No es culpa tuya/);
  assert.equal(view.breaches[0].leaked.includes("Direcciones de correo"), true);
});

test("con pocas filtraciones el primer mensaje sigue diciendo cuántas son", () => {
  const view = compose({
    found: true,
    summary: "Este correo aparece en 2 filtraciones.",
    detail: "detalle",
    footnote: null,
    advice: [],
    breaches: [card({ title: "Una" }), card({ title: "Otra", date: "2 de marzo de 2024" })],
  });
  assert.match(view.speech, /He encontrado 2 filtraciones/);
  assert.match(view.speech, /No es culpa tuya/);
});

test("una lista comercial no se coloca como lo primero", () => {
  const view = compose({
    found: true,
    summary: "envíos comerciales",
    detail: "detalle",
    footnote: null,
    advice: [],
    breaches: [
      card({
        title: "Lista",
        leaked: ["Direcciones de correo"],
        note: "Es una lista de correo comercial, no un robo de contraseñas.",
      }),
      card({ title: "Claves", leaked: ["Contraseñas"] }),
    ],
  });
  assert.equal(view.breaches[0].title, "Claves");
  assert.equal(view.breaches[1].group, "tambien");
  assert.match(view.breaches[1].todo, /No cambiaría contraseñas/);
});
