import { expect, type Locator, type Page, test } from "@playwright/test";

const staticRoutes = ["/", "/about/", "/projects/", "/contact/"] as const;
const cvHref = "/cv/CV-Duncan-De-Vlaminck-EN.pdf";

const attachClientErrorTracking = (page: Page) => {
  const clientErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      clientErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    clientErrors.push(error.message);
  });

  return clientErrors;
};

const expectHealthyPage = async (page: Page, path: string) => {
  const clientErrors = attachClientErrorTracking(page);

  await page.goto(path);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("nav[aria-label='Primary navigation']")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    const documentWidth = document.documentElement.scrollWidth;
    const viewportWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.scrollWidth;

    return documentWidth > viewportWidth + 1 || bodyWidth > viewportWidth + 1;
  });

  expect(hasHorizontalOverflow, `${path} should not overflow horizontally`).toBe(false);
  expect(clientErrors, `${path} should not emit console or page errors`).toEqual([]);
};

const clickLocatorCenter = async (page: Page, locator: Locator) => {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  if (!box) {
    throw new Error("Expected locator to have a clickable bounding box.");
  }

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

test.describe("portfolio route health", () => {
  for (const route of staticRoutes) {
    test(`${route} renders without browser errors or horizontal overflow`, async ({ page }) => {
      await expectHealthyPage(page, route);
    });
  }

  test("every project detail discovered from the project list renders cleanly", async ({
    page,
  }) => {
    await expectHealthyPage(page, "/projects/");

    const projectLinks = await page.locator(".project-card__title a").evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href"))
        .filter((href): href is string => href?.startsWith("/projects/") === true)
        .filter((href) => href !== "/projects/")
        .sort(),
    );

    expect(projectLinks.length).toBeGreaterThan(0);

    for (const projectLink of projectLinks) {
      await expectHealthyPage(page, projectLink);
      await expect(page.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
        "href",
        "/projects/",
      );
    }
  });
});

test.describe("portfolio user flows", () => {
  test("marked internal links have an emitted Astro prefetch runtime", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("a[data-astro-prefetch]")).not.toHaveCount(0);

    const moduleScriptBodies = await page.evaluate(async () => {
      const scriptSources = Array.from(
        document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'),
        (script) => script.src,
      );

      return Promise.all(
        scriptSources.map(async (scriptSource) => {
          const response = await fetch(scriptSource);
          return response.ok ? response.text() : "";
        }),
      );
    });

    expect(
      moduleScriptBodies.some(
        (scriptBody) =>
          scriptBody.includes("astroPrefetch") && scriptBody.includes('rel="prefetch"'),
      ),
    ).toBe(true);
  });

  test("primary navigation reaches the main site sections", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "Projects",
      })
      .click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "About",
      })
      .click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();

    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "Contact",
      })
      .click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Contact" })).toBeVisible();
  });

  test("project cards open detail pages and detail pages return to the list", async ({ page }) => {
    await page.goto("/projects/");

    const firstProject = page.locator(".project-card__title a").first();
    const projectHref = await firstProject.getAttribute("href");
    expect(projectHref).toMatch(/^\/projects\/[^/]+\/$/);

    await firstProject.click();
    await expect(page).toHaveURL(new RegExp(`${projectHref?.replaceAll("/", "\\/")}$`));
    await expect(page.getByRole("link", { name: "Back to projects" })).toBeVisible();

    await page.getByRole("link", { name: "Back to projects" }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  });

  test("project card body and technology labels open detail pages", async ({ page }) => {
    await page.goto("/projects/");

    const firstCard = page.locator(".project-card").first();
    const projectHref = await firstCard.locator(".project-card__title a").getAttribute("href");
    expect(projectHref).toMatch(/^\/projects\/[^/]+\/$/);

    await clickLocatorCenter(page, firstCard.locator(".project-card__description"));
    await expect(page).toHaveURL(new RegExp(`${projectHref?.replaceAll("/", "\\/")}$`));

    await page.goto("/projects/");

    await clickLocatorCenter(
      page,
      page.locator(".project-card").first().locator(".project-card__tech-list li").first(),
    );
    await expect(page).toHaveURL(new RegExp(`${projectHref?.replaceAll("/", "\\/")}$`));
  });

  test("contact links expose email, LinkedIn, and CV actions", async ({ page }) => {
    await page.goto("/contact/");

    await expect(page.getByRole("link", { name: "Email Duncan" })).toHaveAttribute(
      "href",
      "mailto:duncandv123@gmail.com",
    );
    await expect(page.getByRole("link", { name: "View LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/duncandv",
    );
    await expect(page.getByRole("link", { name: "View LinkedIn" })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(page.getByRole("link", { name: "View LinkedIn" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", cvHref);
    await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute(
      "download",
      "CV-Duncan-De-Vlaminck-EN.pdf",
    );
  });

  test("CV PDF is served from the static build", async ({ request }) => {
    const response = await request.get(cvHref);

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });
});
