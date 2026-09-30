// Gera os ícones do PWA a partir de um SVG simples (moeda dourada sobre fundo
// esmeralda, ecoando o mascote Cobre) — não há logo final ainda. Rode com
// `node scripts/generate-icons.mjs` sempre que precisar regenerar os PNGs em
// `public/icons/` e `src/app/{icon,apple-icon}.png`. Requer `sharp` (devDependency).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const BG = "#20B878"; // --g
const GOLD = "#FFC21F"; // --y
const GOLD_RING = "#D39500"; // --yd

/**
 * @param {{ size: number; cornerRadius: number; coinRatio: number }} opts
 * cornerRadius = 0 → fundo em sangria total (ícones "maskable" e o apple-icon,
 * que recebem a máscara/cantos arredondados do próprio sistema operacional).
 */
function iconSvg({ size, cornerRadius, coinRatio }) {
  const c = size / 2;
  const r = size * coinRatio;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${BG}" />
  <circle cx="${c}" cy="${c}" r="${r}" fill="${GOLD_RING}" />
  <circle cx="${c}" cy="${c}" r="${r * 0.86}" fill="${GOLD}" />
</svg>`;
}

async function render(svg, file) {
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(file, buf);
  console.log("wrote", path.relative(ROOT, file));
}

async function main() {
  const iconsDir = path.join(ROOT, "public/icons");
  await mkdir(iconsDir, { recursive: true });

  await render(iconSvg({ size: 192, cornerRadius: 192 * 0.22, coinRatio: 0.32 }), path.join(iconsDir, "icon-192.png"));
  await render(iconSvg({ size: 512, cornerRadius: 512 * 0.22, coinRatio: 0.32 }), path.join(iconsDir, "icon-512.png"));
  // Maskable: fundo em sangria total, glifo dentro da "safe zone" (~40% de raio) do padrão de ícones adaptáveis.
  await render(iconSvg({ size: 512, cornerRadius: 0, coinRatio: 0.28 }), path.join(iconsDir, "icon-512-maskable.png"));

  const appDir = path.join(ROOT, "src/app");
  await render(iconSvg({ size: 32, cornerRadius: 32 * 0.22, coinRatio: 0.32 }), path.join(appDir, "icon.png"));
  // apple-touch-icon: iOS aplica sua própria máscara de cantos, então o fundo vai em sangria total.
  await render(iconSvg({ size: 180, cornerRadius: 0, coinRatio: 0.34 }), path.join(appDir, "apple-icon.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
