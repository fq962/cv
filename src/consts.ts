import { basics, skills, work, education } from "../cv.json";

/** Dominio canónico del sitio, sin barra final. */
export const SITE_URL = (basics.url ?? "https://dfquintanilla.dev").replace(
  /\/$/,
  "",
);

export const SITE = {
  url: SITE_URL,
  name: `${basics.name} — Portafolio`,
  shortName: basics.name,
  lang: "es",
  locale: "es_HN",
  localeAlternates: ["es_ES", "es_MX"],
  themeColor: "#ffffff",
  themeColorDark: "#111111",
  /** Imagen Open Graph por defecto (generada con `npm run og`). */
  ogImage: "/og/default.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
} as const;

/** Palabras clave derivadas del propio CV, sin listas duplicadas a mano. */
export const KEYWORDS = [
  basics.name,
  "Ingeniero de Software",
  "Analista Desarrollador",
  "Desarrollador FullStack",
  "Desarrollador Honduras",
  "Portafolio",
  "CV",
  ...skills.map(({ name }) => name),
  ...work.map(({ name }) => name),
  basics.location.city,
  basics.location.region,
];

/** Temas sobre los que la Person "sabe", para el JSON-LD. */
export const KNOWS_ABOUT = [
  ...skills.map(({ name }) => name),
  ".NET",
  "NextJS",
  "NestJS",
  "Flutter",
  "SCRUM",
  "Data Warehouse",
  "ETL",
  "SEO",
];

export const SOCIAL_URLS = basics.profiles.map(({ url }) => url);

export const CURRENT_JOB =
  work.find(({ endDate }) => endDate === null) ?? work[0];
export const SCHOOL = education[0];

/** Recorta un texto para usarlo como meta description. */
export function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:]+\S*$/, "")}…`;
}

/**
 * Convierte una ruta relativa en URL absoluta sobre el dominio canónico.
 * Las rutas de página se normalizan con barra final para coincidir con el
 * canonical y el sitemap que genera Astro en formato `directory`.
 */
export function absoluteUrl(pathname: string) {
  const url = new URL(pathname, `${SITE_URL}/`);
  const isFile = /\.[a-z0-9]+$/i.test(url.pathname);

  if (!isFile && !url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url.toString();
}

/**
 * Año de una fecha `YYYY-MM-DD`. Se lee de la cadena en vez de construir un
 * `Date`: al parsear una fecha ISO como UTC y mostrarla en hora local, un
 * `2026-01-01` se convertía en 2025.
 */
export function getYear(date: string | null | undefined, fallback = "Actual") {
  return date ? date.slice(0, 4) : fallback;
}
