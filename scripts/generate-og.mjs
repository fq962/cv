/**
 * Genera las imágenes Open Graph (1200x630) y los iconos del sitio.
 *
 *   node scripts/generate-og.mjs
 *
 * Se ejecuta a mano y el resultado se versiona en `public/`, así el build
 * de Astro sigue siendo puramente estático y no depende de sharp.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const ogDir = path.join(publicDir, "og");

const cv = JSON.parse(await fs.readFile(path.join(root, "cv.json"), "utf8"));

/** Dominio mostrado al pie de cada tarjeta, tomado del propio CV. */
const SITE_HOST = new URL(cv.basics.url).host;

const WIDTH = 1200;
const HEIGHT = 630;
const INK = "#111111";
const MUTED = "#6b7280";
const BG = "#ffffff";
const ACCENT = "#1e40af";

const escape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Corta un texto en líneas usando un ancho medio de glifo aproximado. */
function wrap(text, { fontSize, maxWidth, maxLines }) {
  const perChar = fontSize * 0.5;
  const perLine = Math.max(1, Math.floor(maxWidth / perChar));
  const lines = [];
  let current = "";

  for (const word of String(text).split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= perLine) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    const consumed = lines.join(" ").length;
    if (consumed < String(text).length) {
      lines[maxLines - 1] = `${last.slice(0, perLine - 1).trimEnd()}…`;
    }
  }
  return lines;
}

const SERIF = "Georgia, 'Times New Roman', serif";

function textBlock(lines, { x, y, fontSize, lineHeight, fill, weight = "normal" }) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" font-family="${SERIF}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${escape(line)}</text>`
    )
    .join("\n    ");
}

/** Pastillas de tecnologías, recortadas al ancho disponible. */
function chips(items, { x, y, maxWidth }) {
  const fontSize = 22;
  const padding = 18;
  const height = 44;
  const gap = 12;

  let cursor = x;
  const parts = [];

  for (const item of items) {
    const width = Math.round(item.length * fontSize * 0.52) + padding * 2;
    if (cursor + width > x + maxWidth) break;
    parts.push(
      `<rect x="${cursor}" y="${y}" width="${width}" height="${height}" rx="10" fill="#f3f4f6" />
    <text x="${cursor + padding}" y="${y + 30}" font-family="${SERIF}" font-size="${fontSize}" fill="${INK}">${escape(item)}</text>`
    );
    cursor += width + gap;
  }
  return parts.join("\n    ");
}

async function roundedPhoto(size, radius) {
  const source = path.join(publicDir, "me.webp");
  try {
    await fs.access(source);
  } catch {
    return null;
  }

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );

  return sharp(source)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function render(svg, overlays, outFile) {
  const image = sharp(Buffer.from(svg));
  const composed = overlays.length ? image.composite(overlays) : image;
  await composed.png({ compressionLevel: 9 }).toFile(outFile);
  console.log(`  ✓ ${path.relative(root, outFile)}`);
}

/** Marco común: fondo, filete superior y firma inferior. */
function frame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}" />
    <rect width="${WIDTH}" height="10" fill="${ACCENT}" />
    ${inner}
    <text x="80" y="560" font-family="${SERIF}" font-size="24" fill="${MUTED}">${escape(SITE_HOST)}</text>
  </svg>`;
}

async function buildDefaultOg() {
  const { name, label, location, summary } = cv.basics;

  const TITLE = { size: 86, line: 92 };
  const LABEL = { size: 34, line: 44 };
  const BODY = { size: 24, line: 34 };

  const titleLines = wrap(name, { fontSize: TITLE.size, maxWidth: 690, maxLines: 2 });
  const labelLines = wrap(label, { fontSize: LABEL.size, maxWidth: 690, maxLines: 2 });
  const summaryLines = wrap(summary, { fontSize: BODY.size, maxWidth: 690, maxLines: 2 });

  // Flujo vertical: cada bloque arranca donde terminó el anterior.
  let cursor = 215;
  const title = textBlock(titleLines, { x: 80, y: cursor, fontSize: TITLE.size, lineHeight: TITLE.line, fill: INK, weight: "bold" });

  cursor += (titleLines.length - 1) * TITLE.line + 62;
  const sublabel = textBlock(labelLines, { x: 80, y: cursor, fontSize: LABEL.size, lineHeight: LABEL.line, fill: ACCENT });

  cursor += (labelLines.length - 1) * LABEL.line + 52;
  const body = textBlock(summaryLines, { x: 80, y: cursor, fontSize: BODY.size, lineHeight: BODY.line, fill: MUTED });

  const svg = frame(`
    <text x="80" y="110" font-family="${SERIF}" font-size="26" fill="${MUTED}" letter-spacing="4">PORTAFOLIO · ${escape(location.city.toUpperCase())}, ${escape(location.region.toUpperCase())}</text>
    ${title}
    ${sublabel}
    ${body}
  `);

  const photo = await roundedPhoto(300, 48);
  const overlays = photo ? [{ input: photo, top: 175, left: 810 }] : [];
  await render(svg, overlays, path.join(ogDir, "default.png"));
}

async function buildProjectOg(project) {
  const titleLines = wrap(project.name, { fontSize: 76, maxWidth: 1040, maxLines: 2 });
  const descLines = wrap(project.description, { fontSize: 26, maxWidth: 1040, maxLines: 3 });
  const meta = [project.role, project.period].filter(Boolean).join(" · ");

  const titleTop = 210;
  const descTop = titleTop + titleLines.length * 88 + 30;

  const svg = frame(`
    <text x="80" y="120" font-family="${SERIF}" font-size="26" fill="${MUTED}" letter-spacing="4">PROYECTO · ${escape(cv.basics.name.toUpperCase())}</text>
    ${textBlock(titleLines, { x: 80, y: titleTop, fontSize: 76, lineHeight: 88, fill: INK, weight: "bold" })}
    ${meta ? `<text x="80" y="${titleTop + titleLines.length * 88 - 20}" font-family="${SERIF}" font-size="28" fill="${ACCENT}">${escape(meta)}</text>` : ""}
    ${textBlock(descLines, { x: 80, y: descTop + 30, fontSize: 26, lineHeight: 36, fill: MUTED })}
    ${chips(project.highlights.slice(0, 5), { x: 80, y: 460, maxWidth: 1040 })}
  `);

  await render(svg, [], path.join(ogDir, `${project.id}.png`));
}

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 16 16">
  <rect width="16" height="16" rx="3.4" fill="#111111"/>
  <path fill="#ffffff" fill-rule="evenodd" d="M6.78 5.47a.75.75 0 0 1 0 1.06L5.81 7.5l.97.97a.75.75 0 1 1-1.06 1.06l-1.5-1.5a.75.75 0 0 1 0-1.06l1.5-1.5a.75.75 0 0 1 1.06 0Zm2.44 1.06a.75.75 0 0 1 1.06-1.06l1.5 1.5a.75.75 0 0 1 0 1.06l-1.5 1.5a.75.75 0 1 1-1.06-1.06l.97-.97-.97-.97Z" clip-rule="evenodd"/>
</svg>`;

/** Envuelve un PNG en un contenedor .ico (soportado desde Windows Vista). */
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: icono
  header.writeUInt16LE(1, 4); // número de imágenes

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // ancho (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // alto
  entry.writeUInt8(0, 2); // colores de la paleta
  entry.writeUInt8(0, 3); // reservado
  entry.writeUInt16LE(1, 4); // planos
  entry.writeUInt16LE(32, 6); // bits por píxel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

async function buildIcons() {
  for (const [file, size] of [
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ]) {
    await sharp(Buffer.from(ICON_SVG))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(publicDir, file));
    console.log(`  ✓ ${path.join("public", file)}`);
  }

  // /favicon.ico: lo piden navegadores y crawlers aunque haya un SVG declarado.
  const png32 = await sharp(Buffer.from(ICON_SVG))
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(path.join(publicDir, "favicon.ico"), pngToIco(png32, 32));
  console.log("  ✓ public/favicon.ico");
}

await fs.mkdir(ogDir, { recursive: true });

console.log("Generando imágenes Open Graph…");
await buildDefaultOg();
for (const project of cv.projects.filter((project) => project.id)) {
  await buildProjectOg(project);
}

console.log("Generando iconos…");
await buildIcons();

console.log("Listo.");
