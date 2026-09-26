# ADR 0012 — Favicon transparente

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Complementa:** ADR 0011; sustituye únicamente el fondo crema del favicon.

## Contexto

JuanPe pide que el favicon conserve la transparencia del logo, sin fondo
crema ni blanco.

## Decisión

Generar `app/icon.png` a 64 × 64 px desde `logo-2.png`, conservando su canal
alfa y sin añadir un fondo opaco. El icono de Apple de 180 × 180 px mantiene
el fondo crema. El resto del ADR 0011 sigue vigente.

## Por qué

La transparencia permite que el símbolo se integre en la pestaña del navegador
como solicita JuanPe.

## Qué sacrificamos

La cara y el cuello también son transparentes en el original, por lo que su
apariencia depende del fondo de la pestaña.

## Alternativas descartadas

Mantener un fondo crema o blanco en el favicon contradice esta preferencia.
