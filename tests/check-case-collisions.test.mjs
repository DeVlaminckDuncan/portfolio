import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { findCaseCollisions } from "../scripts/check-case-collisions.mjs";

describe("findCaseCollisions", () => {
  it("reports sibling directory components that differ only by case", () => {
    const collisions = findCaseCollisions([
      ".Jules/palette.md",
      ".Jules/sentinel.md",
      ".jules/bolt.md",
    ]);

    assert.deepEqual(collisions, [
      {
        parent: ".",
        normalizedName: ".jules",
        variants: [".Jules", ".jules"],
      },
    ]);
  });

  it("does not report unique casing within the same directory tree", () => {
    const collisions = findCaseCollisions([
      ".Jules/bolt.md",
      ".Jules/palette.md",
      ".Jules/sentinel.md",
      "scripts/check-case-collisions.mjs",
    ]);

    assert.deepEqual(collisions, []);
  });
});
