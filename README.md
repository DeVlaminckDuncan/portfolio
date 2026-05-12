# Portfolio

Personal software engineering portfolio built with Astro and TypeScript.

This repository contains the static-first foundation for Duncan De Vlaminck's
software engineering portfolio. The site includes Home, About, Projects,
project detail, and Contact pages, with structured project content, SEO
metadata, structured data, accessibility checks, cross-browser smoke tests, and
Cloudflare Pages deployment documentation.

## Tech Stack

- **Astro 6** provides the static site framework and file-based routing from
  `src/pages/`, plus content collections for project entries.
- **TypeScript** uses Astro's strict configuration so components and content can
  grow with type checking from the start.
- **Bun 1.3.9** is the package manager and script runner for local development
  and CI installs.
- **Biome** handles formatting and linting with a single project configuration.
- **Playwright** runs cross-browser smoke coverage across Chromium, Firefox,
  and WebKit desktop and mobile-sized viewports.
- **Lighthouse** powers repeatable accessibility and performance audits for the
  generated static routes.
- **GitHub Actions** validates pull requests and pushes to `main` by installing
  dependencies, running CI checks, building the site, and running the launch
  quality gates.
- **Static output** is configured in `astro.config.mjs`, keeping the site simple
  to host on static platforms.

## Local Setup

Use Node.js `>=22.12.0` and Bun `1.3.9`.

```sh
bun install
bun run dev
```

The development server runs from the repository root. Astro prints the local
URL in the terminal after `bun run dev` starts.

## Project Structure

```text
/
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Astro exposes routes from `src/pages/`. Shared page shells belong in
`src/layouts/`, reusable UI belongs in `src/components/`, global styles belong
in `src/styles/`, and structured project content lives in `src/content/`.

## Development Commands

Run commands from the repository root:

| Command                     | Action                                                  |
| :-------------------------- | :------------------------------------------------------ |
| `bun install`               | Install dependencies                                    |
| `bun run dev`               | Start the local Astro development server                |
| `bun run check`                  | Type-check Astro and TypeScript files                |
| `bun run lint`                   | Lint the project with Biome                          |
| `bun run format`                 | Format the project with Biome                        |
| `bun run format:check`           | Check Biome formatting without writing               |
| `bun run check:ci`               | Run Biome CI checks and Astro type checks            |
| `bun run build`                  | Type-check and build the static site                 |
| `bun run validate:structured-data` | Validate JSON-LD in generated HTML                  |
| `bun run test:cross-browser`     | Build and run the Playwright cross-browser smoke gate |
| `bun run audit:accessibility`    | Build and run Lighthouse accessibility audits        |
| `bun run audit:performance`      | Build and run Lighthouse performance audits          |
| `bun run audit:performance:ci`   | Run the performance audit against an existing build  |
| `bun run preview`                | Preview the built site locally                       |

## Deployment

The site deploys from `main` to Cloudflare Pages as a static Astro build. The
Pages project uses `bun install --frozen-lockfile && bun run build` as the build
command and `dist` as the build output directory. Deployment settings and
verification steps are documented in [`docs/deployment.md`](docs/deployment.md).

## Architecture Notes

- Static output is configured explicitly in `astro.config.mjs`.
- TypeScript uses Astro's strict configuration.
- Visual foundations are documented in [`docs/design-system.md`](docs/design-system.md).
- SEO metadata and JSON-LD structured data are generated from shared profile
  and project content.
- The repository currently has no blog, CMS, backend, authentication, or
  deployment adapter. Cloudflare Web Analytics is available as a
  production-only build-time integration when the Pages environment provides its
  public token.
- Documentation should stay useful for both humans and coding agents. If an
  agent workflow document such as `AGENTS.md` is added later, link it from this
  README.
- Do not include private client, employer-sensitive, or non-public project
  details in this repository documentation.
