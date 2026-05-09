# Accessibility

This portfolio treats accessibility as part of the static build quality gate.
The current pass covers semantic structure, keyboard navigation, readable
contrast, and automated Lighthouse checks across every generated route.

## Baseline

The issue #18 baseline is measured with Lighthouse 13.3.0 against Astro preview
output from `bun run build`.

| Route | Accessibility |
| :--- | ---: |
| `/` | 100 |
| `/about/` | 100 |
| `/contact/` | 100 |
| `/projects/` | 100 |
| `/projects/codifly-web-and-mobile-delivery/` | 100 |
| `/projects/m-v-events-mobile-app/` | 100 |
| `/projects/optimus-erp-platform/` | 100 |

## Audit Command

Run the repeatable accessibility audit from the repository root:

```sh
bun run audit:accessibility
```

The command builds the site, starts `astro preview`, audits every generated
`dist/**/index.html` route with Lighthouse, and writes JSON reports to
`.lighthouse/accessibility/`.

The audit fails when any route has a Lighthouse accessibility score below 100.
This intentionally catches semantic regressions such as skipped heading levels,
missing accessible names, and form or link labeling issues.

Lighthouse requires a local Chrome or Chromium browser. If the command cannot
find a browser, install Chrome/Chromium locally and rerun the audit.

## Manual Checks

Automated checks do not replace manual review. For accessibility passes, verify:

- the skip link appears on keyboard focus and moves focus to the main content;
- header navigation, project cards, contact links, external links, and CV
  download links are reachable and understandable with the keyboard;
- focus outlines are visible on links and button-styled links;
- each page has one `h1`, then sequential section and card headings;
- external links that open a new tab include `rel="noopener noreferrer"`;
- responsive navigation wraps without hiding or overlapping links.

## Contrast

The current design tokens meet WCAG AA contrast for text use:

| Pair | Contrast |
| :--- | ---: |
| `--color-text` on `--color-page` | 15.48:1 |
| `--color-text-muted` on `--color-page` | 6.07:1 |
| `--color-accent` on `--color-page` | 8.44:1 |
| `--color-text` on `--color-surface` | 16.45:1 |
| `--color-text-muted` on `--color-surface` | 6.45:1 |
| `--color-accent` on `--color-surface` | 8.97:1 |
| `--color-accent-foreground` on `--color-accent` | 8.97:1 |

Borders are intentionally low contrast and are not used as the only way to
communicate interactive state.

## Issue #18 Outcome

The core UI dependencies for the accessibility pass are present: homepage,
About page, projects listing page, and project detail template. The accessibility
gate now runs in CI, and the known heading-order issue on the projects listing
is fixed by rendering project card titles as `h2` on that page.
