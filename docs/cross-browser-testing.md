# Cross-Browser Testing

Issue #23 adds a repeatable cross-browser smoke gate for launch readiness. The
checks cover the static portfolio routes, primary user flows, responsive
viewports, and the CV PDF link.

## Browser Matrix

| Engine | Desktop viewport | Mobile-sized viewport | Purpose |
| :-- | :-- | :-- | :-- |
| Chromium | 1366 x 768 | 390 x 844 | Chrome-family rendering and responsive layout |
| Firefox | 1366 x 768 | 390 x 844 | Firefox rendering and responsive layout |
| WebKit | 1366 x 768 | 390 x 844 | Safari-family rendering proxy |

Real Safari is not available in this Windows workspace. Playwright WebKit is the
repeatable Safari proxy for this issue; real Safari on macOS or iOS should be
used later if a browser-specific report points to Safari-only behavior.

## Commands

Install the Playwright browser binaries once on a local machine:

```sh
bun run install:cross-browser
```

Run the local cross-browser gate from the repository root:

```sh
bun run test:cross-browser
```

CI installs browsers with Linux system dependencies:

```sh
bun run install:cross-browser:ci
```

CI runs the tests against the `dist` output already produced by the build step:

```sh
bun run test:cross-browser:ci
```

## Coverage

The Playwright smoke suite verifies:

- homepage, About, projects list, contact, and all project detail pages
  discovered from the projects list;
- one visible `h1`, visible main content, and visible primary navigation on
  each page;
- no console errors, page errors, or horizontal layout overflow in each browser
  project;
- primary navigation between Projects, About, and Contact;
- project-card navigation to a detail page and the Back to projects link;
- contact page email, LinkedIn, and CV link attributes;
- the static CV PDF returns a successful PDF response.

## Issue #23 Outcome

| Requirement | Outcome |
| :-- | :-- |
| Chrome desktop and mobile-sized viewports | Covered by Chromium desktop and mobile Playwright projects |
| Safari where available | Covered by WebKit desktop and mobile Playwright projects; real Safari unavailable in this workspace |
| Firefox where available | Covered by Firefox desktop and mobile Playwright projects |
| Responsive layout issues | Automated overflow checks are part of the browser gate; concrete defects should become follow-up issues |
| Clear outcome and dependencies | This document records the outcome; issue dependencies were already marked satisfied before implementation |

## Follow-Up Policy

When a browser-specific defect is discovered, create a GitHub issue with:

- route and user flow;
- browser or engine project;
- viewport size;
- reproduction steps;
- screenshot, trace, or console output when available.

Small layout or content defects found while running issue #23 can be fixed in
the same main-branch work. Broader design decisions, real-device Safari checks,
or defects requiring product judgment should be tracked as follow-up issues.
