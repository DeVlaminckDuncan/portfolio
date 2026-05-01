# Portfolio

Personal software engineering portfolio built with Astro and TypeScript.

This repository contains the static-first foundation for Duncan De Vlaminck's
software engineering portfolio. It is intentionally small at this stage: the
site has a base layout, global styles, a starter landing page, and validation
tooling that future portfolio sections can build on.

Future issues can add portfolio sections, project detail pages, SEO,
accessibility refinements, analytics, and deployment setup.

## Tech Stack

- **Astro 6** provides the static site framework and file-based routing from
  `src/pages/`.
- **TypeScript** uses Astro's strict configuration so components and content can
  grow with type checking from the start.
- **Bun 1.3.9** is the package manager and script runner for local development
  and CI installs.
- **Biome** handles formatting and linting with a single project configuration.
- **GitHub Actions** validates pull requests and pushes to `main` by installing
  dependencies, running CI checks, and building the site.
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
in `src/styles/`, and future structured content can live in `src/content/`.

## Development Commands

Run commands from the repository root:

| Command                | Action                                      |
| :--------------------- | :------------------------------------------ |
| `bun install`          | Install dependencies                        |
| `bun run dev`          | Start the local Astro development server    |
| `bun run check`        | Type-check Astro and TypeScript files       |
| `bun run lint`         | Lint the project with Biome                 |
| `bun run format`       | Format the project with Biome               |
| `bun run format:check` | Check Biome formatting without writing      |
| `bun run check:ci`     | Run Biome CI checks and Astro type checks   |
| `bun run build`        | Type-check and build the static site        |
| `bun run preview`      | Preview the built site locally              |

## Architecture Notes

- Static output is configured explicitly in `astro.config.mjs`.
- TypeScript uses Astro's strict configuration.
- The repository currently has no blog, CMS, backend, authentication, analytics,
  or deployment adapter.
- Documentation should stay useful for both humans and coding agents. If an
  agent workflow document such as `AGENTS.md` is added later, link it from this
  README.
- Do not include private client, employer-sensitive, or non-public project
  details in this repository documentation.
