import type { CollectionEntry } from "astro:content";
import { siteProfile } from "../data/siteProfile";

type Project = CollectionEntry<"projects">;

export type JsonLdNode = Record<string, unknown>;
export type JsonLdInput = JsonLdNode | JsonLdNode[];

const schemaContext = "https://schema.org";

const toAbsoluteUrl = (value: string, siteUrl: string | URL) => new URL(value, siteUrl).toString();

const getPersonId = (siteUrl: string | URL) => `${toAbsoluteUrl("/", siteUrl)}#person`;

export const createJsonLdGraph = (nodes: JsonLdNode[]): JsonLdNode => ({
  "@context": schemaContext,
  "@graph": nodes,
});

export const createPersonJsonLd = (siteUrl: string | URL): JsonLdNode => ({
  "@type": "Person",
  "@id": getPersonId(siteUrl),
  name: siteProfile.name,
  jobTitle: siteProfile.jobTitle,
  url: toAbsoluteUrl("/", siteUrl),
  image: toAbsoluteUrl(siteProfile.image.src, siteUrl),
  sameAs: [...siteProfile.sameAs],
  knowsAbout: [...siteProfile.knowsAbout],
});

export const createProjectCreativeWorkJsonLd = (
  project: Project,
  siteUrl: string | URL,
): JsonLdNode => {
  const projectUrl = toAbsoluteUrl(`/projects/${project.id}/`, siteUrl);
  const links = project.data.links?.map((link) => link.href).filter((href) => href.length > 0);

  return {
    "@type": "CreativeWork",
    "@id": `${projectUrl}#creative-work`,
    name: project.data.title,
    description: project.data.seoDescription ?? project.data.description,
    url: projectUrl,
    mainEntityOfPage: projectUrl,
    image: toAbsoluteUrl(siteProfile.image.src, siteUrl),
    author: {
      "@id": getPersonId(siteUrl),
      "@type": "Person",
      name: siteProfile.name,
    },
    keywords: project.data.techStack,
    ...(links && links.length > 0 ? { sameAs: links } : {}),
  };
};

export const serializeJsonLd = (structuredData: JsonLdInput) =>
  JSON.stringify(structuredData)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
