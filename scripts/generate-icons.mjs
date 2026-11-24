// Gera favicon, ícones do PWA e apple-touch-icon a partir da marca órbitaGO
// (planeta laranja + anel em órbita + satélite com rastro, sobre tile escuro).
// A geometria espelha `LogoMark` em src/components/orbita/logo.tsx.
// Rode com `node scripts/generate-icons.mjs` sempre que mudar a marca.
// Requer `sharp` (devDependency).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";

const INK = "#141416"; // --ink (tile)
const INK_GLOW = "#2C2C35";

// Geometria em unidades de 64 (centro 32,32) — igual ao LogoMark.
const PLANET_R = 15;
const RING = { rx: 27, ry: 8.5, tilt: -24 };
const at = (deg) => {
  const t = (deg * Math.PI) / 180;
  return [RING.rx * Math.cos(t), RING.ry * Math.sin(t)];
};
const SAT = at(38);
const FRONT_ARC = `M ${-RING.rx} 0 A ${RING.rx} ${RING.ry} 0 0 0 ${RING.rx} 0`;
const f = (n) => +n.toFixed(2);

/**
 * @param {object} o
 * @param {number} o.size        lado do PNG
 * @param {number} o.radius      raio do canto do tile (0 = sangria total: maskable/apple)
 * @param {number} o.scale       escala do glifo (maskable precisa caber na safe zone)
 * @param {boolean} o.detail     estrelas (somem nos tamanhos minúsculos)
 * @param {number} o.ringWidth   espessura do anel (mais grosso no favicon)
 */
function iconSvg({ size, radius, scale, detail, ringWidth }) {
  const s = size / 64;
  const stars = detail
    ? [
        [13, 15, 0.9, 0.55],
        [51, 12, 0.7, 0.4],
        [53, 51, 0.8, 0.35],
        [9, 46, 0.6, 0.3],
      ]
        .map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}"/>`)
        .join("")
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="tile" cx="0.28" cy="0.18" r="0.95">
      <stop offset="0" stop-color="${INK_GLOW}"/>
      <stop offset="1" stop-color="${INK}"/>
    </radialGradient>
    <radialGradient id="planet" cx="0.34" cy="0.28" r="0.85">
      <stop offset="0" stop-color="#FFB37D"/>
      <stop offset="0.45" stop-color="#FF6A1F"/>
      <stop offset="1" stop-color="#C9430A"/>
    </radialGradient>
    <clipPath id="planetClip"><circle r="${PLANET_R}"/></clipPath>
  </defs>
  <rect width="64" height="64" rx="${radius / s}" fill="url(#tile)"/>
  ${stars}
  <g transform="translate(32 32) scale(${scale})">
    <g transform="rotate(${RING.tilt})">
      <ellipse rx="${RING.rx}" ry="${RING.ry}" fill="none" stroke="#fff" stroke-width="${ringWidth}"/>
    </g>
    <circle r="${PLANET_R}" fill="url(#planet)"/>
    <g clip-path="url(#planetClip)">
      <path transform="rotate(${RING.tilt})" d="${FRONT_ARC}" fill="none" stroke="${INK}" stroke-width="${ringWidth + 3}"/>
    </g>
    <g transform="rotate(${RING.tilt})">
      <path d="${FRONT_ARC}" fill="none" stroke="#fff" stroke-width="${ringWidth}" stroke-linecap="round"/>
      <circle cx="${f(SAT[0])}" cy="${f(SAT[1])}" r="${detail ? 3.6 : 4.2}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
    </g>
  </g>
</svg>`;
}

/** Badge de notificação Android: silhueta branca em fundo transparente (o sistema só usa o alfa). */
function badgeSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <mask id="cut">
      <rect width="64" height="64" fill="#fff"/>
      <g transform="translate(32 32) rotate(${RING.tilt})">
        <path d="${FRONT_ARC}" fill="none" stroke="#000" stroke-width="7"/>
      </g>
    </mask>
  </defs>
  <g transform="translate(32 32)">
    <circle r="${PLANET_R + 1}" fill="#fff" mask="url(#cut)" transform="translate(-32 -32)" cx="32" cy="32"/>
    <g transform="rotate(${RING.tilt})">
      <ellipse rx="${RING.rx + 1}" ry="${RING.ry + 0.5}" fill="none" stroke="#fff" stroke-width="4.5"/>
    </g>
  </g>
</svg>`;
}

async function render(svg, file) {
  await writeFile(file, await sharp(Buffer.from(svg)).png().toBuffer());
  console.log("wrote", path.relative(ROOT, file));
}

async function main() {
  const iconsDir = path.join(ROOT, "public/icons");
  const appDir = path.join(ROOT, "src/app");
  await mkdir(iconsDir, { recursive: true });

  const tile = (size) => ({ size, radius: size * 0.225, scale: 1, detail: true, ringWidth: 3.2 });
  await render(iconSvg(tile(192)), path.join(iconsDir, "icon-192.png"));
  await render(iconSvg(tile(512)), path.join(iconsDir, "icon-512.png"));
  // Maskable: sangria total; glifo encolhido para caber no círculo seguro (80% do lado).
  await render(iconSvg({ ...tile(512), radius: 0, scale: 0.78 }), path.join(iconsDir, "icon-512-maskable.png"));
  await render(iconSvg({ ...tile(192), radius: 0, scale: 0.78 }), path.join(iconsDir, "icon-192-maskable.png"));
  await render(badgeSvg(96), path.join(iconsDir, "badge-96.png"));

  // apple-touch-icon: o iOS arredonda sozinho → sangria total.
  await render(iconSvg({ ...tile(180), radius: 0, scale: 0.9 }), path.join(appDir, "apple-icon.png"));
  // Favicon: PNG 32 (fallback) + SVG nítido em qualquer densidade. Sem estrelas/rastro, anel mais grosso.
  const fav = { size: 32, radius: 32 * 0.25, scale: 0.94, detail: false, ringWidth: 4.4 };
  await render(iconSvg(fav), path.join(appDir, "icon.png"));
  await writeFile(path.join(appDir, "icon.svg"), iconSvg({ ...fav, size: 64, radius: 16 }));
  console.log("wrote src/app/icon.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
