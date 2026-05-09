import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const expectedSiteUrl = "https://duncandevlaminck.be";
const expectedLinkedInUrl = "https://www.linkedin.com/in/duncandv";

const errors = [];

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectHtmlFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function extractJsonLdScripts(html, filePath) {
  const scripts = [];
  const scriptPattern =
    /<script\b(?=[^>]*type=(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(scriptPattern)) {
    const rawJson = match[2].trim();

    try {
      scripts.push(JSON.parse(rawJson));
    } catch (error) {
      errors.push(`${filePath}: invalid JSON-LD script (${error.message})`);
    }
  }

  return scripts;
}

function flattenJsonLdNodes(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLdNodes);
  }

  if (value && typeof value === "object") {
    const graphNodes = Array.isArray(value["@graph"])
      ? value["@graph"].flatMap(flattenJsonLdNodes)
      : [];
    return [value, ...graphNodes];
  }

  return [];
}

function hasType(node, type) {
  const nodeType = node["@type"];
  return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
}

function assertNoEmptyStrings(value, location) {
  if (typeof value === "string") {
    if (value.trim().length === 0) {
      errors.push(`${location}: JSON-LD contains an empty string`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertNoEmptyStrings(item, `${location}[${index}]`);
    });
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      assertNoEmptyStrings(item, `${location}.${key}`);
    }
  }
}

function assertAbsoluteUrl(value, location) {
  if (typeof value !== "string") {
    errors.push(`${location}: expected an absolute URL string`);
    return;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(`${location}: expected an HTTP(S) URL`);
    }
  } catch {
    errors.push(`${location}: expected an absolute URL string`);
  }
}

function assertAuthor(value, location) {
  if (!value || typeof value !== "object") {
    errors.push(`${location}: expected an author object`);
    return;
  }

  const hasAuthorReference = value["@id"] === `${expectedSiteUrl}/#person`;
  const hasAuthorName = value.name === "Duncan De Vlaminck";

  if (!hasAuthorReference && !hasAuthorName) {
    errors.push(`${location}: expected Duncan De Vlaminck as author`);
  }
}

function assertPersonNode(nodes, filePath) {
  const person = nodes.find((node) => hasType(node, "Person"));

  if (!person) {
    errors.push(`${filePath}: expected a Person JSON-LD node`);
    return;
  }

  if (person.name !== "Duncan De Vlaminck") {
    errors.push(`${filePath}: expected Person.name to be Duncan De Vlaminck`);
  }

  if (person.url !== `${expectedSiteUrl}/`) {
    errors.push(`${filePath}: expected Person.url to be ${expectedSiteUrl}/`);
  }

  if (person.jobTitle !== "Software Engineer") {
    errors.push(`${filePath}: expected Person.jobTitle to be Software Engineer`);
  }

  if (person.email !== undefined) {
    errors.push(`${filePath}: Person JSON-LD must not include email`);
  }

  if (!Array.isArray(person.sameAs) || !person.sameAs.includes(expectedLinkedInUrl)) {
    errors.push(`${filePath}: expected Person.sameAs to include LinkedIn`);
  }

  if (!Array.isArray(person.knowsAbout) || person.knowsAbout.length < 4) {
    errors.push(`${filePath}: expected Person.knowsAbout to list visible focus topics`);
  }

  assertAbsoluteUrl(person.image, `${filePath}: Person.image`);
}

function assertCreativeWorkNode(nodes, filePath) {
  const creativeWork = nodes.find((node) => hasType(node, "CreativeWork"));

  if (!creativeWork) {
    errors.push(`${filePath}: expected a CreativeWork JSON-LD node`);
    return;
  }

  for (const property of ["url", "mainEntityOfPage"]) {
    assertAbsoluteUrl(creativeWork[property], `${filePath}: CreativeWork.${property}`);
  }

  if (typeof creativeWork.description !== "string") {
    errors.push(`${filePath}: expected CreativeWork.description`);
  }

  assertAuthor(creativeWork.author, `${filePath}: CreativeWork.author`);

  if (!Array.isArray(creativeWork.keywords) || creativeWork.keywords.length === 0) {
    errors.push(`${filePath}: expected CreativeWork.keywords from project tech stack`);
  }
}

const htmlFiles = await collectHtmlFiles(distDir);
const pageNodes = new Map();

for (const filePath of htmlFiles) {
  const html = await readFile(filePath, "utf8");
  const scripts = extractJsonLdScripts(html, filePath);
  const nodes = scripts.flatMap(flattenJsonLdNodes);

  for (const script of scripts) {
    assertNoEmptyStrings(script, filePath);
  }

  pageNodes.set(filePath, nodes);
}

const homePath = path.join(distDir, "index.html");
assertPersonNode(pageNodes.get(homePath) ?? [], homePath);

const projectDetailPages = htmlFiles.filter((filePath) => {
  const relativePath = path.relative(distDir, filePath);
  return (
    relativePath.startsWith(`projects${path.sep}`) &&
    relativePath !== path.join("projects", "index.html")
  );
});

if (projectDetailPages.length === 0) {
  errors.push("Expected at least one project detail page in dist/projects/*/index.html");
}

for (const filePath of projectDetailPages) {
  const nodes = pageNodes.get(filePath) ?? [];
  assertPersonNode(nodes, filePath);
  assertCreativeWorkNode(nodes, filePath);
}

if (errors.length > 0) {
  console.error("JSON-LD validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`JSON-LD validation passed for ${htmlFiles.length} HTML files.`);
