import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";

// Derivados de entrega: conserva los originales y su dibujo, sin reinterpretarlos.
// Ejecutar desde la raíz del proyecto: node scripts/prepare-brand.mjs
await mkdir("public/brand", { recursive: true });
const symbol = await sharp("assets/brand/logo-2.png").trim().toBuffer();
// La franja inferior contiene el nombre completo, separado del símbolo por aire.
const wordmarkStrip = await sharp("assets/brand/logo-background.png")
  .extract({ left: 0, top: 900, width: 1254, height: 354 })
  .toBuffer();
const wordmark = await sharp(wordmarkStrip).trim().toBuffer();

await sharp(wordmark).resize({ width: 600 }).webp({ quality: 95 }).toFile("public/brand/wordmark.webp");
await sharp(symbol).resize({ width: 256 }).webp({ quality: 90 }).toFile("public/brand/symbol.webp");
// El favicon conserva la transparencia original, sin base ni nombre.
await sharp(symbol)
  .resize(60, 60, { fit: "contain", background: "#00000000" })
  .extend({ top: 2, bottom: 2, left: 2, right: 2, background: "#00000000" })
  .png()
  .toFile("app/icon.png");
await sharp(symbol)
  .resize(156, 156, { fit: "contain", background: "#fdf6e9" })
  .flatten({ background: "#fdf6e9" })
  .extend({ top: 12, bottom: 12, left: 12, right: 12, background: "#fdf6e9" })
  .png()
  .toFile("app/apple-icon.png");

for (const file of ["wordmark", "symbol"]) {
  const { width, height } = await sharp(`public/brand/${file}.webp`).metadata();
  const { size } = await stat(`public/brand/${file}.webp`);
  console.log(`${file}: ${width} × ${height}, ${size} bytes`);
}
