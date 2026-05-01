# Portfolio

Personal software engineering portfolio built with Astro and TypeScript.

This repository starts with a minimal static-first foundation. Future issues can add portfolio sections, project detail pages, SEO, accessibility refinements, analytics, and Cloudflare Pages deployment.

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

Astro exposes routes from `src/pages/`. Shared page shells belong in `src/layouts/`, reusable UI belongs in `src/components/`, global styles belong in `src/styles/`, and future structured content can live in `src/content/`.

## Commands

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
- No blog, CMS, backend, authentication, analytics, or deployment adapter is included yet.
