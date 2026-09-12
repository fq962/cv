import cv from "../cv.json";
import { SITE_URL, KNOWS_ABOUT, absoluteUrl, truncate } from "./consts";

const { basics, work, education, skills, languages, certificates, projects } = cv;

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** La persona: el nodo central del grafo, referenciado por todo lo demás. */
export function personSchema() {
  const [givenName, ...family] = basics.name.split(" ");

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: basics.name,
    givenName,
    familyName: family.join(" "),
    jobTitle: basics.label,
    description: basics.summary,
    url: `${SITE_URL}/`,
    image: absoluteUrl(basics.image),
    email: `mailto:${basics.email}`,
    telephone: basics.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: basics.location.city,
      addressRegion: basics.location.region,
      postalCode: basics.location.postalCode,
      addressCountry: basics.location.countryCode,
    },
    sameAs: basics.profiles.map(({ url }) => url),
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: languages.map(({ language }) => ({
      "@type": "Language",
      name: language,
    })),
    worksFor: work
      .filter(({ endDate }) => endDate === null)
      .map(({ name, url }) => ({ "@type": "Organization", name, url })),
    hasOccupation: work.map(({ position, name, startDate, endDate, summary }) => ({
      "@type": "Occupation",
      name: position,
      description: summary,
      occupationLocation: { "@type": "Organization", name },
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    })),
    alumniOf: education.map(({ institution, url, startDate, endDate }) => ({
      "@type": "CollegeOrUniversity",
      name: institution,
      url,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    })),
    hasCredential: certificates
      .filter(({ featured }) => featured)
      .map(({ name, issuer, url }) => ({
        "@type": "EducationalOccupationalCredential",
        name,
        url,
        credentialCategory: "certificate",
        recognizedBy: { "@type": "Organization", name: issuer },
      })),
    skills: skills.map(({ name }) => name).join(", "),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: `${basics.name} — Portafolio`,
    description: truncate(basics.summary),
    inLanguage: "es",
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
  };
}

/** La home es una ProfilePage: le dice a Google que la página trata sobre la persona. */
export function profilePageSchema() {
  return {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#webpage`,
    url: `${SITE_URL}/`,
    name: `Portafolio de ${basics.name}`,
    description: truncate(basics.summary),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
    primaryImageOfPage: absoluteUrl(basics.image),
    inLanguage: "es",
  };
}

type Project = (typeof projects)[number];

export function projectSchema(project: Project) {
  const pageUrl = absoluteUrl(`/proyectos/${project.id}`);

  return {
    "@type": "WebApplication",
    "@id": `${pageUrl}#project`,
    name: project.name,
    description: project.description,
    url: project.url ?? pageUrl,
    applicationCategory:
      "applicationCategory" in project
        ? project.applicationCategory
        : "WebApplication",
    operatingSystem: "Web",
    image: absoluteUrl(`/og/${project.id}.png`),
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    keywords: project.highlights.join(", "),
    inLanguage: "es",
    isPartOf: { "@id": WEBSITE_ID },
    ...("skills" in project && project.skills
      ? { about: project.skills.map(({ name }) => name) }
      : {}),
  };
}

export function projectPageSchema(project: Project) {
  const pageUrl = absoluteUrl(`/proyectos/${project.id}`);

  return {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${project.name} — Proyecto de ${basics.name}`,
    description: truncate(project.description),
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": `${pageUrl}#project` },
    primaryImageOfPage: absoluteUrl(`/og/${project.id}.png`),
    inLanguage: "es",
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(({ name, path }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

/** Lista de todos los proyectos, para que se entienda la home como portafolio. */
export function projectCollectionSchema() {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}/#proyectos`,
    name: `Proyectos de ${basics.name}`,
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.name,
      ...(project.id
        ? { url: absoluteUrl(`/proyectos/${project.id}`) }
        : project.url
          ? { url: project.url }
          : {}),
    })),
  };
}
