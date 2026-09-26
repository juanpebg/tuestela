import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Ejecutar la función real con las API web de Node y fetch sustituido.
// El entorno aislado no tiene acceso a red, secretos ni .dev.vars.
async function compile(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

const validationCode = await compile("../lib/validation.ts");
const waitlistSettingsCode = await compile("../lib/waitlist.ts");
const waitlistCode = await compile("../functions/api/waitlist.ts");
const env = {
  RESEND_API_KEY: "test-only-not-a-real-key",
  RESEND_AUDIENCE_ID: "test-audience",
  RESEND_FROM: "tuEstela <test@example.invalid>",
};
const contactId = "00000000-0000-4000-8000-000000000001";
const email = "persona@example.invalid";

function harness(fetchImplementation, { expired = false } = {}) {
  const calls = [];
  const logs = [];
  const timeouts = [];
  const validation = {};
  vm.runInNewContext(validationCode, { exports: validation });
  const settings = {};
  vm.runInNewContext(waitlistSettingsCode, { exports: settings });
  const exported = {};
  vm.runInNewContext(waitlistCode, {
    exports: exported,
    require(specifier) {
      if (specifier === "../../lib/waitlist") return settings;
      assert.equal(specifier, "../../lib/validation");
      return validation;
    },
    Response,
    AbortSignal: {
      timeout(milliseconds) {
        timeouts.push(milliseconds);
        return expired
          ? AbortSignal.abort(new DOMException("Prueba de timeout", "TimeoutError"))
          : AbortSignal.timeout(milliseconds);
      },
    },
    console: { error: (...args) => logs.push(args.join(" ")) },
    fetch: async (url, init) => {
      calls.push({ url, ...init });
      if (!fetchImplementation) throw new Error("Red no permitida en pruebas");
      return fetchImplementation(url, init, calls.length);
    },
  });
  return {
    calls,
    logs,
    timeouts,
    publicRequest: exported.onRequestPost,
    enabled: settings.WAITLIST_ENABLED,
    // Ejercitar directamente la lógica activa sin alterar el interruptor.
    submit(payload = { email, consent: true, website: "" }, options = {}) {
      const request = new Request("https://tuestela.example/api/waitlist", {
        method: "POST",
        headers: options.html
          ? {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "text/html",
            }
          : { "Content-Type": "application/json" },
        body: options.html
          ? new URLSearchParams(payload).toString()
          : JSON.stringify(payload),
      });
      return exported.processWaitlistRequest({ request, env });
    },
  };
}

function json(body, status = 200) {
  return Response.json(body, { status });
}

for (const html of [false, true]) {
  test(`el endpoint público pausado devuelve 503 ${html ? "HTML" : "JSON"} sin procesar datos ni configuración`, async () => {
    const app = harness();
    assert.equal(app.enabled, false);
    const request = new Request("https://tuestela.example/api/waitlist", {
      method: "POST",
      headers: {
        Accept: html ? "text/html" : "application/json",
        "Content-Type": "application/json",
      },
      body: "{cuerpo deliberadamente ilegible",
    });
    const response = await app.publicRequest({
      request,
      get env() {
        throw new Error("La pausa no debe leer configuración");
      },
    });
    assert.equal(response.status, 503);
    assert.equal(request.bodyUsed, false);
    if (html) {
      assert.match(response.headers.get("Content-Type"), /text\/html/);
      assert.match(await response.text(), /La lista de espera todavía no está abierta/);
    } else {
      assert.match(response.headers.get("Content-Type"), /application\/json/);
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.match(body.message, /La lista de espera todavía no está abierta/);
    }
    assert.equal(app.calls.length, 0);
    assert.equal(app.logs.length, 0);
    assert.equal(app.timeouts.length, 0);
  });
}

test("la pausa rechaza también un alta válida aunque existan credenciales", async () => {
  const app = harness();
  const request = new Request("https://tuestela.example/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, consent: true, website: "" }),
  });
  assert.equal((await app.publicRequest({ request, env })).status, 503);
  assert.equal(request.bodyUsed, false);
  assert.equal(app.calls.length, 0);
});

test("rechaza entradas inválidas y el honeypot sin consultar Resend", async () => {
  const app = harness();
  assert.equal((await app.submit({ email: "inválido", consent: true })).status, 400);
  assert.equal((await app.submit({ email, consent: false })).status, 400);
  assert.equal((await app.submit(null)).status, 400);
  assert.equal((await app.submit({ email, consent: true, website: "bot" })).status, 200);
  assert.equal(app.calls.length, 0);
});

for (const unsubscribed of [false, true]) {
  test(`un contacto existente (unsubscribed=${unsubscribed}) no recibe escrituras ni correo`, async () => {
    const app = harness(() => json({ id: contactId, unsubscribed }));
    const response = await app.submit();
    assert.equal(response.status, 200);
    assert.equal(app.calls.length, 1);
    assert.equal(app.calls[0].method, undefined);
    assert.equal((await response.json()).ok, true);
  });
}

for (const status of [401, 403, 429, 500]) {
  test(`una consulta fallida (${status}) no crea contactos ni envía correos`, async () => {
    const app = harness(() => json({ message: "fallo simulado" }, status));
    assert.equal((await app.submit()).status, 502);
    assert.equal(app.calls.length, 1);
  });
}

test("solo un 404 permite crear un contacto y enviar su bienvenida", async () => {
  const app = harness((_url, _init, call) => {
    if (call === 1) return json({}, 404);
    if (call === 2) return json({ id: contactId });
    return json({ id: "test-email" });
  });
  const response = await app.submit();
  assert.equal(response.status, 200);
  assert.equal(app.calls.length, 3);
  assert.match(app.calls[0].url, /\/contacts\/persona%40example.invalid$/);
  assert.deepEqual(JSON.parse(app.calls[1].body), { email, unsubscribed: false });
  assert.equal(app.calls[2].url, "https://api.resend.com/emails");
  assert.deepEqual(JSON.parse(app.calls[2].body).to, [email]);
  assert.equal(app.calls[2].headers["Idempotency-Key"], `waitlist-welcome/v1/${contactId}`);
  assert.equal(app.calls[2].headers["Idempotency-Key"].includes(email), false);
  assert.deepEqual(app.timeouts, [10000, 10000, 10000]);
  assert.ok(app.calls.every((call) => call.signal instanceof AbortSignal));
});

test("dos altas concurrentes utilizan la misma clave de bienvenida", async () => {
  const app = harness((url, init) => {
    if (!init.method) return json({}, 404);
    if (url.endsWith("/contacts")) return json({ id: contactId });
    return json({ id: "test-email" });
  });
  const responses = await Promise.all([app.submit(), app.submit()]);
  assert.ok(responses.every((response) => response.status === 200));
  const emails = app.calls.filter((call) => call.url.endsWith("/emails"));
  assert.equal(emails.length, 2);
  assert.equal(emails[0].headers["Idempotency-Key"], emails[1].headers["Idempotency-Key"]);
  assert.equal(emails[0].body, emails[1].body);
});

test("un fallo al crear el contacto no envía una bienvenida", async () => {
  const app = harness((_url, _init, call) => json({}, call === 1 ? 404 : 500));
  assert.equal((await app.submit()).status, 502);
  assert.equal(app.calls.length, 2);
});

for (const failingCall of [1, 2, 3]) {
  test(`un error de red en el paso ${failingCall} se controla sin datos personales en logs`, async () => {
    const app = harness((_url, _init, call) => {
      if (call === failingCall) throw new Error(`Fallo privado de ${email}`);
      return call === 1 ? json({}, 404) : json({ id: contactId });
    });
    const response = await app.submit();
    assert.equal(response.status, failingCall === 3 ? 200 : 502);
    assert.equal(app.calls.length, failingCall);
    assert.ok(app.logs.length > 0);
    assert.equal(app.logs.join(" ").includes(email), false);
  });
}

test("una consulta agotada devuelve un error controlado y no continúa", async () => {
  const app = harness((_url, init) => {
    init.signal.throwIfAborted();
    throw new Error("Se esperaba una señal agotada");
  }, { expired: true });
  assert.equal((await app.submit()).status, 502);
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].signal.aborted, true);
  assert.deepEqual(app.timeouts, [10000]);
});

test("un error HTTP al enviar correo conserva el éxito del alta", async () => {
  const app = harness((_url, _init, call) => {
    if (call === 1) return json({}, 404);
    if (call === 2) return json({ id: contactId });
    return json({}, 503);
  });
  assert.equal((await app.submit()).status, 200);
  assert.equal(app.calls.length, 3);
});

test("una respuesta de alta sin ID no provoca un envío sin protección", async () => {
  const app = harness((_url, _init, call) => call === 1 ? json({}, 404) : json({}));
  assert.equal((await app.submit()).status, 200);
  assert.equal(app.calls.length, 2);
});

test("un cuerpo de alta ilegible conserva el éxito y omite la bienvenida", async () => {
  const app = harness((_url, _init, call) => call === 1 ? json({}, 404) : new Response("{"));
  assert.equal((await app.submit()).status, 200);
  assert.equal(app.calls.length, 2);
});

test("el formulario sin JavaScript conserva una respuesta HTML controlada", async () => {
  const app = harness(() => json({ id: contactId }));
  const response = await app.submit({ email, consent: "on", website: "" }, { html: true });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Content-Type"), /text\/html/);
  assert.match(await response.text(), /Volver a tuEstela/);
  assert.equal(app.calls.length, 1);
});
