# ADR 0002 — Cómo tratamos las alertas de seguridad de las dependencias

- **Fecha:** 2026-08-02
- **Estado:** Aceptada

## Contexto

Nada más crear el proyecto, `npm audit` reportó **3 vulnerabilidades de severidad
alta** en dos dependencias transitivas (dependencias de nuestras dependencias):

- `postcss` ≤ 8.5.17 — la copia interna que instala Next.js. Los avisos afectan a
  herramientas que procesan CSS *de terceros no confiables*; en este proyecto
  PostCSS solo procesa nuestro propio CSS, y solo durante el build.
- `sharp` < 0.35.0 — librería de imágenes que Next.js instala. Mismo caso: solo
  se ejecuta en build sobre nuestras propias imágenes; en una web estática ni
  siquiera se usa en producción.

Es decir: la explotabilidad real aquí era prácticamente nula. Pero "prácticamente
nula" no es cero, y un `npm audit` en rojo en un proyecto de ciberseguridad es
inaceptable, aunque sea ruido.

## Decisión

Forzamos versiones parcheadas con el campo [`overrides`](../../package.json) de npm
(`postcss ^8.5.25`, `sharp ^0.35.3`), que sustituye la versión vulnerable en todo el
árbol de dependencias. Verificamos después que `npm audit` queda en 0 y que el build
sigue funcionando.

## Por qué

1. **Confianza verificable.** Cualquiera puede clonar este repo, ejecutar
   `npm audit` y ver 0 vulnerabilidades. No pedimos que confíes: compruébalo.
2. **El contexto puede cambiar.** Una vulnerabilidad "inexplotable hoy" puede
   volverse real cuando cambia cómo usas la dependencia. Parchear cuando es barato
   evita tener que recordarlo cuando sea urgente.
3. **Sin esperar al proveedor.** Next.js aún fija internamente las versiones
   viejas; `overrides` nos permite parchear sin esperar a que ellos actualicen.
   Cuando lo hagan, retiraremos los overrides.

## Qué sacrificamos

- Los `overrides` son responsabilidad nuestra: si una versión forzada rompiera algo
  interno de Next.js, el error sería nuestro, no del framework. Lo mitigamos
  verificando el build tras cada cambio de dependencias.

## Alternativas que descartamos

- **`npm audit fix --force`**, lo que sugiere el propio npm. Habría "resuelto" la
  alerta **degradando Next.js de la versión 16 a la 9** (siete versiones mayores
  hacia atrás, año 2020). Moraleja que nos llevamos por escrito: nunca ejecutes
  correcciones automáticas de seguridad sin leer qué van a hacer.
- **Ignorar la alerta** por ser build-time y de bajo riesgo. Técnicamente
  defendible, pero indefendible para un proyecto que quiere ganarse a la comunidad
  de seguridad con hechos.
