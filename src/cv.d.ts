export interface CV {
  basics: Basics;
  work: Array<Work>;
  volunter: Array<Volunter>;
  education: Array<Education>;
  awards: Array<Awards>;
  certificatesUrl: string;
  certificates: Array<Certificates>;
  publications: Array<Publications>;
  skills: Array<Skills>;
  languages: Array<Languages>;
  interests: Array<Interests>;
  references: Array<References>;
  projects: Array<Projects>;
}

interface Basics {
  name: string;
  label: string;
  image: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: Location;
  profiles: Array<Profiles>;
}

interface Location {
  addres: string;
  postalCode: string;
  city: string;
  countryCode: string;
  region: string;
}

interface Profiles {
  network: string;
  username: string;
  url: string;
}

interface Work {
  name: string;
  position: string;
  url: string;
  startDate: DateStr;
  endDate: DateStr | null;
  summary: string;
  highlights: Highlight;
}

type DateStr = `${string}-${string}-${string}`;

interface Volunter {
  organization: string;
  position: string;
  url: string;
  startDate: DateStr;
  endDate: DateStr;
  summary: string;
  highlights: Highlight;
}

interface Skills {
  name: string;
  level: string;
  keywords: Array<string>;
  image: string;
}

interface Awards {
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

interface Certificates {
  name: string;
  category: string;
  issuer: string;
  featured: boolean;
  url: string;
}

interface Publications {
  name: string;
  publisher: string;
  releaseDate: DateStr;
  url: string;
  summary: string;
}

interface Education {
  institution: string;
  url: string;
  area: sring;
  studyType: string;
  startDate: DateStr;
  endDate: DateStr;
  score: string;
  courses: Array<string>;
}

interface Languages {
  language: Language;
  frequency: string;
}

type Language =
  | "Spanish"
  | "English"
  | "German"
  | "France"
  | "Italian"
  | "Korean"
  | "Portuguese"
  | "Chinese"
  | "Arabic"
  | "Dutch"
  | "Finnish"
  | "Russian"
  | "Turkish"
  | "Hindi"
  | "Bengali"
  | string;

interface Projects {
  /** Identificador usado para la página de detalle y las capturas: `/proyectos/{id}` y `/projects-screenshots/{id}-01.webp` */
  id?: string;
  name: string;
  isActive: boolean;
  role?: string;
  period?: string;
  /** Valor de schema.org usado en los datos estructurados de la página de detalle. */
  applicationCategory?: string;
  description: string;
  longDescription?: Array<string>;
  highlights: Highlight;
  skills?: Array<ProjectSkill>;
  url: string | null;
  links?: Array<ProjectLink>;
  github?: string;
}

interface ProjectSkill {
  name: string;
  image: string | null;
}

interface ProjectLink {
  label: string;
  url: string;
}

interface Interests {
  name: string;
  keywords: Array<stirng>;
}

interface References {
  name: string;
  reference: string;
}

type Highlight = Array<String>;
