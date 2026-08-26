import { expect, type Locator, type Page, test } from "@playwright/test";

const staticRoutes = ["/", "/about/", "/projects/", "/contact/"] as const;
const cvHref = "/cv/CV-Duncan-De-Vlaminck-EN.pdf";
const themeStorageKey = "portfolio-theme";

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

const expectNoHorizontalOverflow = async (page: Page, path: string) => {
  const hasHorizontalOverflow = await page.evaluate(() => {
    const documentWidth = document.documentElement.scrollWidth;
    const viewportWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.scrollWidth;

    return documentWidth > viewportWidth + 1 || bodyWidth > viewportWidth + 1;
  });

  expect(hasHorizontalOverflow, `${path} should not overflow horizontally`).toBe(false);
};

const openPrimaryNavigationIfCollapsed = async (page: Page) => {
  const menuToggle = page.locator("[data-nav-toggle]");

  if (await menuToggle.isVisible()) {
    const expanded = await menuToggle.getAttribute("aria-expanded");

    if (expanded !== "true") {
      await menuToggle.click();
    }
  }

  await expect(page.locator("nav[aria-label='Primary navigation']")).toBeVisible();
};

const expectHealthyPage = async (page: Page, path: string) => {
  const clientErrors = attachClientErrorTracking(page);

  await page.goto(path);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("[data-theme-toggle]")).toBeVisible();

  const menuToggle = page.locator("[data-nav-toggle]");
  const primaryNav = page.locator("nav[aria-label='Primary navigation']");

  if (await menuToggle.isVisible()) {
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    await expect(primaryNav).toBeHidden();
    await openPrimaryNavigationIfCollapsed(page);
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
  } else {
    await expect(primaryNav).toBeVisible();
  }

  await expectNoHorizontalOverflow(page, path);
  expect(clientErrors, `${path} should not emit console or page errors`).toEqual([]);
};

const expectCssToken = async (page: Page, token: string, expectedValue: string) => {
  await expect
    .poll(() =>
      page.evaluate(
        (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
        token,
      ),
    )
    .toBe(expectedValue);
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
    await openPrimaryNavigationIfCollapsed(page);

    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "Projects",
      })
      .click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

    await openPrimaryNavigationIfCollapsed(page);
    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "About",
      })
      .click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();

    await openPrimaryNavigationIfCollapsed(page);
    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "Contact",
      })
      .click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Contact" })).toBeVisible();
  });

  test("mobile navigation opens, closes with Escape, and does not overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuToggle = page.locator("[data-nav-toggle]");
    const primaryNav = page.locator("nav[aria-label='Primary navigation']");

    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute("aria-label", "Open menu");
    await expect(primaryNav).toBeHidden();
    await expectNoHorizontalOverflow(page, "/");

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    await expect(menuToggle).toHaveAttribute("aria-label", "Close menu");
    await expect(primaryNav).toBeVisible();
    await expect(primaryNav.getByRole("link").first()).toBeFocused();
    await expectNoHorizontalOverflow(page, "/");

    await page.keyboard.press("Escape");
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    await expect(menuToggle).toHaveAttribute("aria-label", "Open menu");
    await expect(primaryNav).toBeHidden();
    await expect(menuToggle).toBeFocused();
    await expectNoHorizontalOverflow(page, "/");
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

test.describe("portfolio theme control", () => {
  test("system dark preference applies dark tokens without a stored preference", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(
      page.getByRole("button", { name: "Theme: Dark. Switch to light mode" }),
    ).toBeVisible();
    await expectCssToken(page, "--color-page", "#101418");
    await expectCssToken(page, "--color-text", "#edf2f7");
  });

  test("missing or invalid stored preference falls back to system theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript((key) => localStorage.setItem(key, "system"), themeStorageKey);
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(
      page.getByRole("button", { name: "Theme: Light. Switch to dark mode" }),
    ).toBeVisible();
    await expectCssToken(page, "--color-page", "#f7f8fa");
  });

  test("manual theme toggles persist and survive reloads", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Theme: Light. Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(
      page.getByRole("button", { name: "Theme: Dark. Switch to light mode" }),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), themeStorageKey))
      .toBe("dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectCssToken(page, "--color-page", "#101418");

    await page.getByRole("button", { name: "Theme: Dark. Switch to light mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(
      page.getByRole("button", { name: "Theme: Light. Switch to dark mode" }),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), themeStorageKey))
      .toBe("light");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expectCssToken(page, "--color-page", "#f7f8fa");
  });

  test("theme toggle is reachable and operable from the keyboard", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Theme: Light. Switch to dark mode" });
    let reachedTrigger = false;

    for (let tabIndex = 0; tabIndex < 8; tabIndex += 1) {
      await page.keyboard.press("Tab");

      if (await trigger.evaluate((button) => button === document.activeElement)) {
        reachedTrigger = true;
        break;
      }
    }

    expect(reachedTrigger).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(
      page.getByRole("button", { name: "Theme: Dark. Switch to light mode" }),
    ).toBeFocused();
  });
});
