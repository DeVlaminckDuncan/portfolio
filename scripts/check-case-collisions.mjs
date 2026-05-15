import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function findCaseCollisions(paths) {
  const siblingsByParent = new Map();

  for (const path of paths) {
    const parts = path.split(/[\\/]+/).filter(Boolean);
    let parentKey = ".";
    let parentDisplay = ".";

    for (const part of parts) {
      const normalizedName = part.toLowerCase();
      const siblings = getOrCreate(siblingsByParent, parentKey, () => ({
        parent: parentDisplay,
        namesByNormalizedName: new Map(),
      }));
      const variants = getOrCreate(siblings.namesByNormalizedName, normalizedName, () => new Set());
      variants.add(part);

      parentKey = parentKey === "." ? normalizedName : `${parentKey}/${normalizedName}`;
      parentDisplay = parentDisplay === "." ? part : `${parentDisplay}/${part}`;
    }
  }

  const collisions = [];

  for (const siblings of siblingsByParent.values()) {
    for (const [normalizedName, variants] of siblings.namesByNormalizedName.entries()) {
      if (variants.size > 1) {
        collisions.push({
          parent: siblings.parent,
          normalizedName,
          variants: [...variants].sort(),
        });
      }
    }
  }

  return collisions.sort((left, right) => {
    const parentOrder = left.parent.localeCompare(right.parent);
    if (parentOrder !== 0) {
      return parentOrder;
    }

    return left.normalizedName.localeCompare(right.normalizedName);
  });
}

function getOrCreate(map, key, createValue) {
  if (!map.has(key)) {
    map.set(key, createValue());
  }

  return map.get(key);
}

function readTrackedPaths() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
}

function formatCollision(collision) {
  return `${collision.parent}: ${collision.variants.join(", ")} all normalize to ${collision.normalizedName}`;
}

function main() {
  const collisions = findCaseCollisions(readTrackedPaths());

  if (collisions.length === 0) {
    console.log("No case-colliding tracked paths found.");
    return;
  }

  console.error("Found tracked path components that differ only by case:");
  for (const collision of collisions) {
    console.error(`- ${formatCollision(collision)}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
