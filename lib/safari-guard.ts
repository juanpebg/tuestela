// Red de seguridad para Safari en el iPhone (iOS 15–17) y para cuando el
// JavaScript de la página no llega a arrancar. El texto es ES5 a propósito:
// tiene que ejecutarse aunque el resto de archivos usen sintaxis más nueva.
// No toca la red, no lee el correo y no usa almacenamiento si el navegador
// lo bloquea (modo privado).

export const FALLBACK_HTML = [
  '<div style="max-width:36rem;margin:0 auto;font-family:Georgia,Times New Roman,serif">',
  '<p style="font-size:2rem;line-height:1.2;margin:0 0 0.75rem">tuEstela</p>',
  "<p style=\"font-family:'Source Sans 3',Georgia,sans-serif;font-size:1.125rem;line-height:1.5;margin:0\">",
  "Si la conversación no llega a abrirse, puedes comprobar el correo desde aquí. ",
  "No lo guardamos: lo preguntamos y lo olvidamos.",
  "</p>",
  '<form action="/api/check" method="post" style="display:flex;flex-direction:column;gap:0.9rem;margin-top:1.4rem;font-family:\'Source Sans 3\',Georgia,sans-serif">',
  '<label style="font-size:0.95rem">Tu correo',
  '<input id="respaldo-email" name="email" type="email" required maxlength="254" autocomplete="email" inputmode="email" style="display:block;width:100%;box-sizing:border-box;margin-top:0.4rem;padding:0.65rem 0.1rem;font:inherit;color:#1e1b4b;background:transparent;border:none;border-bottom:2px solid rgba(30,27,75,0.25)">',
  "</label>",
  '<label style="display:flex;gap:0.6rem;align-items:flex-start;font-size:0.95rem">',
  '<input id="respaldo-consent" name="consent" type="checkbox" value="yes" required style="margin-top:0.2rem">',
  "<span>Solo compruebo mi propio correo.</span>",
  "</label>",
  '<p style="margin:0;font-size:0.95rem">Antes de enviarlo, puedes leer la <a href="/privacidad" target="_blank" rel="noopener noreferrer" style="color:#3f2bab">política de privacidad</a>.</p>',
  '<button id="respaldo-submit" type="submit" style="font:inherit;font-weight:600;background:#f2a52b;color:#0b0920;border:0;border-radius:999px;padding:0.75rem 1.5rem;width:fit-content">Comprobar</button>',
  "</form>",
  '<p style="margin:1.25rem 0 0"><button type="button" id="estela-seguir" style="font:inherit;background:transparent;border:0;padding:0;color:#3f2bab;text-decoration:underline">Seguir en la página</button></p>',
  "</div>",
].join("");

// Oculta el respaldo cuando el guion arranca. Si la entrada se queda
// invisible, .reveal-stuck la devuelve a opacidad 1.
export const CRITICAL_CSS =
  "#estela-respaldo{display:none}html.reveal-stuck .enter{animation:none !important;opacity:1 !important;filter:none !important;transform:none !important}";

export const SAFARI_GUARD = `(function () {
  var markup = ${JSON.stringify(FALLBACK_HTML)};
  var started = new Date().getTime();

  function hasClass(node, name) {
    return new RegExp("(^|\\\\s)" + name + "(\\\\s|$)").test(node.className);
  }

  function addClass(node, name) {
    if (!hasClass(node, name)) node.className += (node.className ? " " : "") + name;
  }

  function at(index) {
    var len = this.length;
    var relative = Number(index);
    var k = relative < 0 ? len + relative : relative;
    if (k < 0 || k >= len) return undefined;
    return this[k];
  }

  if (!Array.prototype.at) Array.prototype.at = at;
  if (!String.prototype.at) String.prototype.at = at;
  var typed = ["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array"];
  for (var i = 0; i < typed.length; i++) {
    var Ctor = window[typed[i]];
    if (Ctor && Ctor.prototype && !Ctor.prototype.at) Ctor.prototype.at = at;
  }
  if (!Object.hasOwn) {
    Object.hasOwn = function (object, property) {
      if (object == null) throw new TypeError("Cannot convert undefined or null to object");
      return Object.prototype.hasOwnProperty.call(Object(object), property);
    };
  }

  function memoryStore() {
    var data = {};
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
      },
      setItem: function (key, value) {
        data[String(key)] = String(value);
      },
      removeItem: function (key) {
        delete data[String(key)];
      },
      clear: function () {
        data = {};
      },
      key: function (index) {
        var names = Object.keys(data);
        return names[index] || null;
      },
      get length() {
        return Object.keys(data).length;
      }
    };
  }

  function storageBlocked(name) {
    try {
      var store = window[name];
      if (!store) return false;
      var probe = "__estela_" + name;
      store.setItem(probe, "1");
      store.removeItem(probe);
      return false;
    } catch (err) {
      return true;
    }
  }

  function shieldStorage(name) {
    if (!storageBlocked(name)) return;
    var store = memoryStore();
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        get: function () {
          return store;
        }
      });
    } catch (err) {}
  }

  shieldStorage("localStorage");
  shieldStorage("sessionStorage");

  var root = document.documentElement;

  function paint(box) {
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Comprobación de respaldo");
    box.style.display = "block";
    box.style.position = "fixed";
    box.style.top = "0";
    box.style.right = "0";
    box.style.bottom = "0";
    box.style.left = "0";
    box.style.zIndex = "80";
    box.style.overflow = "auto";
    box.style.background = "#fdf6e9";
    box.style.color = "#1e1b4b";
    box.style.padding = "2.5rem 1.5rem";
  }

  function ensureBox() {
    var box = document.getElementById("estela-respaldo");
    if (!box) {
      box = document.createElement("div");
      box.id = "estela-respaldo";
      box.innerHTML = markup;
      var parent = document.body || document.documentElement;
      parent.appendChild(box);
    } else if (!box.innerHTML) {
      box.innerHTML = markup;
    }
    return box;
  }

  function showFallback() {
    try {
      paint(ensureBox());
    } catch (err) {}
  }

  function visibleEnough(node) {
    if (!node || !window.getComputedStyle) return true;
    var style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    var opacity = parseFloat(style.opacity);
    return !(opacity < 0.2);
  }

  function settleEntrance() {
    var sample = document.querySelector(".enter");
    if (!sample || visibleEnough(sample)) return;
    addClass(root, "reveal-stuck");
    var nodes = document.querySelectorAll(".enter");
    for (var n = 0; n < nodes.length; n++) {
      nodes[n].style.animation = "none";
      nodes[n].style.opacity = "1";
      nodes[n].style.filter = "none";
      nodes[n].style.transform = "none";
    }
    window.setTimeout(function () {
      if (!visibleEnough(sample)) showFallback();
    }, 400);
  }

  function pageHasText() {
    var body = document.body;
    if (!body) return false;
    var text = body.textContent || "";
    var box = document.getElementById("estela-respaldo");
    if (box && box.textContent) text = text.split(box.textContent).join("");
    return text.replace(/\\s+/g, "").length > 40;
  }

  window.addEventListener("error", function (event) {
    var target = event && event.target;
    if (target && target !== window && target.nodeType) return;
    var message = event && event.message ? String(event.message) : "";
    var syntax = /SyntaxError|Unexpected token/.test(message);
    if (target && target !== window && target.nodeType && !syntax) return;
    if (syntax || new Date().getTime() - started < 12000) {
      showFallback();
    }
  });

  window.addEventListener("unhandledrejection", function () {
    if (new Date().getTime() - started < 12000) showFallback();
  });

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || target.id !== "estela-seguir") return;
    var box = document.getElementById("estela-respaldo");
    if (box) box.style.display = "none";
  });

  function watch() {
    if (!pageHasText()) showFallback();
    settleEntrance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.setTimeout(watch, 4500);
    });
  } else {
    window.setTimeout(watch, 4500);
  }
})();`;
