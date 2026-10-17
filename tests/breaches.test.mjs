import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../lib/breaches.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const breaches = {};
vm.runInNewContext(compiled, { exports: breaches });
const { explainDataClass, presentBreaches, noBreachView } = breaches;

// Catálogo público de HIBP (GET /api/v3/dataclasses) el 2026-10-16.
// Si falta una, el test falla: no queremos enseñar el nombre en inglés
// por no haber escrito la explicación.
const DATA_CLASSES = [
  "Academic records",
  "Account balances",
  "Address book contacts",
  "Age groups",
  "Ages",
  "AI prompts",
  "Appointments",
  "Apps installed on devices",
  "Astrological signs",
  "Audio recordings",
  "Auth tokens",
  "Avatars",
  "Bank account numbers",
  "Beauty ratings",
  "Biometric data",
  "Bios",
  "Browser user agent details",
  "Browsing histories",
  "Buying preferences",
  "Car ownership statuses",
  "Career levels",
  "Cellular network names",
  "Charitable donations",
  "Chat logs",
  "Citizenship statuses",
  "Clothing sizes",
  "Comments",
  "Company names",
  "Credit card CVV",
  "Credit cards",
  "Credit scores",
  "Credit status information",
  "Cryptocurrency wallet addresses",
  "Customer feedback",
  "Customer interactions",
  "Customer service records",
  "Dates of birth",
  "Deceased date",
  "Deceased statuses",
  "Delivery instructions",
  "Device information",
  "Device serial numbers",
  "Device usage tracking data",
  "Disabilities",
  "Display names",
  "Drinking habits",
  "Driver's licenses",
  "Drug habits",
  "Earnings",
  "Eating habits",
  "Education levels",
  "Email addresses",
  "Email messages",
  "Employers",
  "Employment statuses",
  "Encrypted keys",
  "Ethnicities",
  "Family members' names",
  "Family plans",
  "Family structure",
  "Financial investments",
  "Financial transactions",
  "Fitness levels",
  "Flights taken",
  "Forum posts",
  "Genders",
  "Geographic locations",
  "Government issued IDs",
  "Health insurance information",
  "Historical passwords",
  "HIV statuses",
  "Home ownership statuses",
  "Homepage URLs",
  "IMEI numbers",
  "IMSI numbers",
  "Income levels",
  "Instant messenger identities",
  "IP addresses",
  "IQ levels",
  "Job applications",
  "Job titles",
  "Language preferences",
  "Latitude and longitude pairs",
  "Licence plates",
  "Living costs",
  "Loan information",
  "Login histories",
  "Loyalty program details",
  "MAC addresses",
  "Marital statuses",
  "Military service",
  "Mnemonic phrases",
  "Mothers maiden names",
  "Names",
  "Nationalities",
  "Net worths",
  "Nicknames",
  "Occupations",
  "Parenting plans",
  "Partial credit card data",
  "Partial dates of birth",
  "Partial government issued IDs",
  "Partial phone numbers",
  "Passport numbers",
  "Password hints",
  "Password strengths",
  "Passwords",
  "Payment histories",
  "Payment methods",
  "Personal descriptions",
  "Personal health data",
  "Personal interests",
  "Phone numbers",
  "Photos",
  "Physical addresses",
  "Physical attributes",
  "PINs",
  "Places of birth",
  "Political donations",
  "Political views",
  "Private messages",
  "Professional skills",
  "Profile photos",
  "Profile statistics",
  "Purchases",
  "Purchasing habits",
  "Races",
  "Recovery email addresses",
  "Relationship statuses",
  "Religions",
  "Reward program balances",
  "Salutations",
  "School grades (class levels)",
  "Security questions and answers",
  "Sexual fetishes",
  "Sexual orientations",
  "Shipment tracking numbers",
  "Smoking habits",
  "SMS messages",
  "Social connections",
  "Social media profiles",
  "Social security numbers",
  "Socioeconomic levels",
  "Spoken languages",
  "Spouses names",
  "Support tickets",
  "Survey results",
  "Tattoo status",
  "Taxation records",
  "Telecommunications carrier",
  "Time zones",
  "Travel habits",
  "Travel plans",
  "User statuses",
  "User website URLs",
  "Usernames",
  "Utility bills",
  "Vehicle details",
  "Vehicle identification numbers (VINs)",
  "Vehicle registration plates",
  "VIP statuses",
  "Warranty claims",
  "Website activity",
  "Work habits",
  "Years of professional experience",
];

test("cada tipo de dato conocido tiene explicación y recomendación en castellano", () => {
  const missing = [];
  for (const name of DATA_CLASSES) {
    const advice = explainDataClass(name);
    if (
      advice.label === name ||
      advice.explanation.length < 40 ||
      advice.recommendation.length < 40
    ) {
      missing.push(name);
    }
  }
  assert.deepEqual(missing, []);
});

test("contraseñas, teléfonos, direcciones y fechas de nacimiento dicen qué hacer", () => {
  const passwords = explainDataClass("Passwords");
  assert.equal(passwords.label, "Contraseñas");
  assert.match(passwords.explanation, /contraseña/i);
  assert.match(passwords.recommendation, /Cámbiala/);
  assert.match(passwords.recommendation, /no la repitas/i);

  const phones = explainDataClass("Phone numbers");
  assert.equal(phones.label, "Teléfonos");
  assert.match(phones.explanation, /teléfono/i);
  assert.match(phones.recommendation, /SMS/);

  const addresses = explainDataClass("Physical addresses");
  assert.equal(addresses.label, "Direcciones postales");
  assert.match(addresses.explanation, /dirección física/i);
  assert.match(addresses.recommendation, /No confirmes datos/);

  const birth = explainDataClass("Dates of birth");
  assert.equal(birth.label, "Fechas de nacimiento");
  assert.match(birth.explanation, /fecha de nacimiento/i);
  assert.match(birth.recommendation, /contraseña/i);
});

test("un tipo de dato desconocido no se oculta y usa el texto de reserva", () => {
  const advice = explainDataClass("Clase inventada 2099");
  assert.equal(advice.label, "Clase inventada 2099");
  assert.match(advice.explanation, /Have I Been Pwned/);
  assert.match(advice.recommendation, /Desconfía/);
});

test("el nombre se busca sin distinguir mayúsculas ni espacios alrededor", () => {
  assert.equal(explainDataClass("  passwords ").label, "Contraseñas");
});

const email = "persona@example.invalid";

function breach(overrides) {
  return {
    Name: "Adobe",
    Title: "Adobe",
    Domain: "adobe.com",
    BreachDate: "2013-10-04",
    PwnCount: 152445165,
    Description: `<em>secreto</em> ${email}`,
    LogoPath: "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png",
    DataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
    IsVerified: true,
    IsFabricated: false,
    IsSensitive: false,
    IsRetired: false,
    IsSpamList: false,
    IsMalware: false,
    ...overrides,
  };
}

test("una filtración real se ordena, se traduce y no arrastra HTML ni el correo", () => {
  const view = presentBreaches([
    breach(),
    breach({
      Name: "Ejemplo",
      Title: "Ejemplo",
      Domain: "ejemplo.es",
      BreachDate: "2020-01-15",
      PwnCount: 10,
      DataClasses: ["Phone numbers", "Passwords"],
    }),
  ]);
  assert.equal(view.found, true);
  assert.equal(view.breaches[0].title, "Ejemplo");
  assert.equal(view.breaches[0].date, "15 de enero de 2020");
  assert.equal(view.breaches[1].date, "4 de octubre de 2013");
  assert.equal(view.breaches[1].affected, "152.445.165 cuentas afectadas");
  assert.deepEqual(JSON.parse(JSON.stringify(view.breaches[1].leaked)), [
    "Direcciones de correo",
    "Pistas de contraseña",
    "Contraseñas",
    "Nombres de usuario",
  ]);
  const passwordAdvice = view.advice.filter((item) => item.label === "Contraseñas");
  assert.equal(passwordAdvice.length, 1);
  const dumped = JSON.stringify(view);
  assert.equal(dumped.includes(email), false);
  assert.equal(dumped.includes("<em>"), false);
  assert.equal(dumped.includes("LogoPath"), false);
  assert.equal(dumped.includes("haveibeenpwned.com"), false);
  assert.match(view.summary, /2 filtraciones/);
  assert.match(view.footnote, /orientativa/);
});

test("sin filtraciones el mensaje es explícito y tranquilo", () => {
  assert.deepEqual(presentBreaches([]), noBreachView());
  assert.match(noBreachView().summary, /Buena señal/);
  assert.match(noBreachView().detail, /no demuestra/i);
});

test("una lista que no son fichas de filtración no se disfraza de buena noticia", () => {
  assert.equal(presentBreaches(["Adobe"]), null);
  assert.equal(presentBreaches([{ sinTitulo: true }]), null);
  assert.equal(presentBreaches({ Name: "Adobe" }), null);
});

test("una lista comercial no se cuenta como un robo de contraseñas", () => {
  const view = presentBreaches([
    breach({
      Title: "Lista comercial",
      DataClasses: ["Email addresses"],
      IsSpamList: true,
      PwnCount: 3,
    }),
  ]);
  assert.match(view.summary, /envíos comerciales/);
  assert.match(view.breaches[0].note, /correo comercial/);
  assert.match(view.detail, /no hace falta cambiar contraseñas/i);
});

test("las filtraciones sensibles o retiradas no se enseñan", () => {
  const view = presentBreaches([
    breach({ IsSensitive: true }),
    breach({ Title: "Retirada", Name: "Retirada", IsRetired: true }),
  ]);
  assert.equal(view.found, false);
  assert.equal(view.breaches.length, 0);
});

test("muchas filtraciones no prometen recorrerlas todas", () => {
  const list = Array.from({ length: 20 }, (_, index) =>
    breach({
      Name: `N${index}`,
      Title: `Servicio ${index}`,
      Domain: `s${index}.example`,
      BreachDate: "2019-01-02",
      PwnCount: 10,
    }),
  );
  const view = presentBreaches(list);
  assert.equal(view.breaches.length, 20);
  assert.match(view.summary, /20 filtraciones/);
  assert.match(view.detail, /Son 20 en total/);
  assert.equal(view.detail.includes("por partes"), false);
  const few = presentBreaches([breach(), breach({ Name: "Otra", Title: "Otra" })]);
  assert.match(few.detail, /por partes/);
});

test("si no hay tipos de dato, se dice y se recomienda un paso", () => {
  const view = presentBreaches([breach({ DataClasses: [] })]);
  assert.deepEqual(JSON.parse(JSON.stringify(view.breaches[0].leaked)), [
    "No se detalla qué datos concretos se filtraron",
  ]);
  assert.equal(view.advice[0].label, "Datos no detallados");
  assert.match(view.advice[0].recommendation, /contraseña/i);
});
