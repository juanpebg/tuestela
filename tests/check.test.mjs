import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

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
const breachesCode = await compile("../lib/breaches.ts");
const checkCode = await compile("../functions/api/check.ts");

// Valor falso a propósito: no es una clave de Have I Been Pwned.
const apiKey = "test-only-not-a-real-key";
const email = "persona@example.invalid";
const defaultEnv = { HIBP_API_KEY: apiKey };

function harness(fetchImplementation, { expired = false } = {}) {
  const calls = [];
  const logs = [];
  const timeouts = [];
  const validation = {};
  vm.runInNewContext(validationCode, { exports: validation });
  const breaches = {};
  vm.runInNewContext(breachesCode, { exports: breaches });
  const exported = {};
  vm.runInNewContext(checkCode, {
    exports: exported,
    require(specifier) {
      if (specifier === "../../lib/breaches") return breaches;
      assert.equal(specifier, "../../lib/validation");
      return validation;
    },
    Response,
    Headers,
    URLSearchParams,
    AbortSignal: {
      timeout(milliseconds) {
        timeouts.push(milliseconds);
        return expired
          ? AbortSignal.abort(new DOMException("Prueba de timeout", "TimeoutError"))
          : AbortSignal.timeout(milliseconds);
      },
    },
    console: {
      error: (...args) => logs.push(args.map((part) => String(part)).join(" ")),
    },
    fetch: async (url, init) => {
      calls.push({ url: String(url), ...init });
      if (!fetchImplementation) throw new Error("Red no permitida en pruebas");
      return fetchImplementation(url, init, calls.length);
    },
  });

  return {
    calls,
    logs,
    timeouts,
    limits: {
      perIp: exported.CHECKS_PER_IP,
      global: exported.CHECKS_GLOBAL,
    },
    post: exported.onRequestPost,
    submit(payload = { email, consent: true }, options = {}) {
      const ip = options.ip ?? "203.0.113.10";
      const headers = {
        "CF-Connecting-IP": ip,
        ...(options.html
          ? {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "text/html",
            }
          : {
              "Content-Type": "application/json",
              Accept: "application/json",
            }),
        ...options.headers,
      };
      const request = new Request("https://tuestela.example/api/check", {
        method: "POST",
        headers,
        body: options.raw ?? (options.html
          ? new URLSearchParams({
              email: payload?.email ?? "",
              ...(payload?.consent ? { consent: "yes" } : {}),
            }).toString()
          : JSON.stringify(payload)),
      });
      return exported.onRequestPost({
        request,
        env: options.env ?? defaultEnv,
      });
    },
  };
}

function json(body, status = 200, headers) {
  return Response.json(body, { status, headers });
}

function adobe() {
  return {
    Name: "Adobe",
    Title: "Adobe",
    Domain: "adobe.com",
    BreachDate: "2013-10-04",
    PwnCount: 152445165,
    Description: `<em>no enseñar</em> ${email}`,
    LogoPath: "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png",
    DataClasses: ["Email addresses", "Passwords", "Phone numbers", "Physical addresses", "Dates of birth"],
    IsVerified: true,
    IsSpamList: false,
  };
}

function assertNoSecrets(text) {
  assert.equal(text.includes(email), false);
  assert.equal(text.includes(encodeURIComponent(email)), false);
  assert.equal(text.includes(apiKey), false);
  assert.equal(text.toLowerCase().includes("haveibeenpwned.com"), false);
}

test("200 traduce la filtración y llama a HIBP sin guardar el correo en la respuesta", async () => {
  const app = harness(() => json([adobe(), { Name: "SoloNombre" }]));
  const response = await app.submit();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.found, true);
  assert.equal(body.breaches[0].title, "Adobe");
  assert.equal(body.breaches[0].date, "4 de octubre de 2013");
  assert.ok(body.breaches.some((item) => item.title === "SoloNombre"));
  assert.ok(body.advice.some((item) => item.label === "Contraseñas"));
  assert.ok(body.advice.some((item) => item.label === "Teléfonos"));
  assert.ok(body.advice.some((item) => item.label === "Direcciones postales"));
  assert.ok(body.advice.some((item) => item.label === "Fechas de nacimiento"));
  assertNoSecrets(JSON.stringify(body));
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].headers["hibp-api-key"], apiKey);
  assert.equal(app.calls[0].headers["user-agent"], "tuestela.es");
  assert.equal(app.calls[0].redirect, "manual");
  assert.equal(app.timeouts[0], 10000);
  const url = new URL(app.calls[0].url);
  assert.equal(url.origin + url.pathname, `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`);
  assert.equal(url.searchParams.get("truncateResponse"), "false");
  assert.equal(url.searchParams.get("IncludeUnverified"), "false");
  assertNoSecrets(app.logs.join("\n"));
});

test("el correo se normaliza y el + queda codificado en la ruta", async () => {
  const app = harness(() => json([]));
  const alias = "Mas+Alias@Example.INVALID";
  assert.equal((await app.submit({ email: `  ${alias}  `, consent: true })).status, 200);
  assert.match(app.calls[0].url, /\/mas%2Balias%40example.invalid\?/);
});

test("404 es un resultado vacío, no un error", async () => {
  const app = harness(() => new Response(null, { status: 404 }));
  const response = await app.submit();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.found, false);
  assert.deepEqual(body.breaches, []);
  assert.match(body.summary, /Buena señal/);
  assertNoSecrets(JSON.stringify(body));
  assert.equal(app.logs.length, 0);
});

test("429 copia retry-after, avisa en castellano y la siguiente consulta no llama a HIBP", async () => {
  const app = harness(() => json({ message: `espera ${email}` }, 429, { "retry-after": "12" }));
  const first = await app.submit();
  assert.equal(first.status, 429);
  assert.equal(first.headers.get("retry-after"), "12");
  const body = await first.json();
  assert.match(body.message, /12 segundos/);
  assertNoSecrets(JSON.stringify(body));
  const second = await app.submit({ email, consent: true }, { ip: "203.0.113.99" });
  assert.equal(second.status, 429);
  assert.equal(app.calls.length, 1);
  assertNoSecrets(app.logs.join("\n"));
});

test("sin retry-after se esperan 60 segundos", async () => {
  const app = harness(() => new Response(null, { status: 429 }));
  const response = await app.submit();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
  assert.match((await response.json()).message, /60 segundos/);
});

test("una fecha retry-after se convierte en segundos", async () => {
  const when = new Date(Date.now() + 30_000).toUTCString();
  const app = harness(() => new Response(null, { status: 429, headers: { "retry-after": when } }));
  const response = await app.submit();
  const seconds = Number(response.headers.get("retry-after"));
  assert.ok(seconds >= 20 && seconds <= 35);
});

for (const status of [401, 403, 500, 503]) {
  test(`un ${status} de HIBP no filtra la clave ni el correo`, async () => {
    const app = harness(() => json({ message: `${email} ${apiKey}` }, status));
    const response = await app.submit();
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.match(body.message, /No hemos podido consultar/);
    assertNoSecrets(JSON.stringify(body));
    assert.match(app.logs.join("\n"), new RegExp(`HIBP: ${status}`));
    assertNoSecrets(app.logs.join("\n"));
  });
}

test("una redirección no se sigue", async () => {
  const app = harness(
    () => new Response(null, { status: 302, headers: { location: `https://example.invalid/?q=${email}` } }),
  );
  assert.equal((await app.submit()).status, 502);
  assert.equal(app.calls.length, 1);
  assertNoSecrets(app.logs.join("\n"));
});

test("un fallo de red no escribe el correo ni la URL en el log", async () => {
  const app = harness(() => {
    throw new Error(`Fallo privado de ${email} en https://haveibeenpwned.com/api/v3/breachedaccount/${email}`);
  });
  const response = await app.submit();
  assert.equal(response.status, 502);
  assert.match(app.logs.join("\n"), /fallo de red/);
  assertNoSecrets(app.logs.join("\n"));
  assertNoSecrets(JSON.stringify(await response.json()));
});

test("un tiempo de espera agotado se controla", async () => {
  const app = harness((url, init) => {
    init.signal.throwIfAborted();
    throw new Error("Se esperaba una señal agotada");
  }, { expired: true });
  assert.equal((await app.submit()).status, 502);
  assert.equal(app.calls[0].signal.aborted, true);
  assert.deepEqual(app.timeouts, [10000]);
  assertNoSecrets(app.logs.join("\n"));
});

test("una respuesta 200 ilegible o solo con nombres no se presenta como buena noticia", async () => {
  const broken = harness(() => new Response("{", { status: 200, headers: { "content-type": "application/json" } }));
  assert.equal((await broken.submit()).status, 502);
  const namesOnly = harness(() => json(["Adobe"]));
  assert.equal((await namesOnly.submit()).status, 502);
  assertNoSecrets(namesOnly.logs.join("\n"));
});

test("sin clave no se lee el cuerpo ni se llama a HIBP", async () => {
  for (const key of [undefined, "", "   ", "linea\ninyectada"]) {
    const app = harness();
    const request = new Request("https://tuestela.example/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent: true }),
    });
    const response = await app.post({ request, env: { HIBP_API_KEY: key } });
    assert.equal(response.status, 500);
    assert.match((await response.json()).message, /no está configurado/);
    assert.equal(app.calls.length, 0);
    assert.equal(app.logs.join("\n").includes("inyectada"), false);
    assert.equal(request.bodyUsed, false);
  }
});

test("rechaza correo inválido, sin consentimiento y cuerpo ilegible sin llamar a HIBP", async () => {
  const app = harness();
  assert.equal((await app.submit({ email: "no-es-correo", consent: true })).status, 400);
  assert.equal((await app.submit({ email, consent: false })).status, 400);
  assert.equal((await app.submit({ email, consent: "yes" })).status, 400);
  assert.equal((await app.submit(null)).status, 400);
  assert.equal((await app.submit({ email: "a@b", consent: true })).status, 400);
  const huge = await app.submit({ email, consent: true }, { raw: "x".repeat(5000), headers: { "content-type": "application/json" } });
  assert.equal(huge.status, 400);
  assert.equal(app.calls.length, 0);
  assertNoSecrets(app.logs.join("\n"));
});

test("el formulario sin JavaScript recibe HTML con la atribución y sin el correo", async () => {
  const app = harness(() => new Response(null, { status: 404 }));
  const response = await app.submit({ email, consent: true }, { html: true });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /Buena señal/);
  assert.match(html, /Datos de Have I Been Pwned/);
  assert.match(html, /href="https:\/\/haveibeenpwned.com"/);
  assert.match(html, /CC BY 4\.0/);
  assert.match(html, /Volver a tuEstela/);
  assert.equal(html.includes(email), false);
});

test("el límite por IP no gasta la cuota de otra dirección", async () => {
  const app = harness(() => json([]));
  for (let i = 0; i < app.limits.perIp; i += 1) {
    assert.equal((await app.submit()).status, 200);
  }
  const blocked = await app.submit();
  assert.equal(blocked.status, 429);
  assert.match((await blocked.json()).message, /muchas consultas/);
  assert.equal(app.calls.length, app.limits.perIp);
  assert.equal((await app.submit({ email, consent: true }, { ip: "203.0.113.20" })).status, 200);
  assert.equal(app.calls.length, app.limits.perIp + 1);
});

test("el límite global de la instancia protege la clave compartida", async () => {
  const app = harness(() => json([]));
  for (let i = 0; i < app.limits.global; i += 1) {
    assert.equal((await app.submit({ email, consent: true }, { ip: `203.0.113.${i + 1}` })).status, 200);
  }
  const blocked = await app.submit({ email, consent: true }, { ip: "198.51.100.20" });
  assert.equal(blocked.status, 429);
  assert.equal(app.calls.length, app.limits.global);
});

test("un correo inválido no consume el límite", async () => {
  const app = harness(() => json([]));
  for (let i = 0; i < app.limits.perIp + 2; i += 1) {
    assert.equal((await app.submit({ email: "mal", consent: true })).status, 400);
  }
  assert.equal((await app.submit()).status, 200);
  assert.equal(app.calls.length, 1);
});

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", ".git", "out", ".next", ".wrangler"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

test("el repositorio no contiene una clave de HIBP ni la API en el cliente", async () => {
  const root = path.resolve(new URL("..", import.meta.url).pathname);
  const files = await walk(root);
  const hexKey = /hibp-api-key["']?\s*[:=]\s*["']?[0-9a-f]{8,}/i;
  const assigned = /HIBP_API_KEY\s*=\s*["']?[0-9a-f]{8,}/i;
  const zeros = "0".repeat(32);
  for (const file of files) {
    if (!/\.(ts|tsx|mjs|js|md|example|css|json|html)$/.test(file) && !file.endsWith(".dev.vars.example")) {
      continue;
    }
    const text = await readFile(file, "utf8");
    assert.equal(hexKey.test(text), false, file);
    assert.equal(assigned.test(text), false, file);
    assert.equal(text.includes(zeros), false, file);
    if (file.includes(`${path.sep}components${path.sep}`) || file.includes(`${path.sep}app${path.sep}`)) {
      assert.equal(text.includes("HIBP_API_KEY"), false, file);
      assert.equal(text.includes("hibp-api-key"), false, file);
      assert.equal(text.includes("/api/v3/"), false, file);
    }
  }
});
