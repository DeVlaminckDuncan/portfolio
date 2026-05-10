# Performance

This portfolio is intentionally static-first. Local and preview builds have no
client-side JavaScript, no raster images, and only a small shared stylesheet in
the generated build. Production builds may include the approved Cloudflare Web
Analytics beacon when `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is configured in
Cloudflare Pages.

## Baseline

The issue #19 baseline was measured with Lighthouse 13.3.0 against Astro
preview output from `bun run build`.

| Route | Performance | FCP | LCP | TBT | CLS | Transfer size |
| :--- | ---: | :--- | :--- | :--- | :--- | :--- |
| `/` | 100 | 0.8 s | 0.8 s | 0 ms | 0 | 4 KiB |
| `/projects/` | 100 | 0.8 s | 0.9 s | 0 ms | 0 | 4 KiB |
| `/about/` | 100 | 0.8 s | 0.9 s | 0 ms | 0 | 6 KiB |

## Audit Command

Run the repeatable performance audit from the repository root:

```sh
bun run audit:performance
```

The command builds the site, starts `astro preview`, audits every generated
`dist/**/index.html` route with Lighthouse, and writes JSON reports to
`.lighthouse/`.

The default audit runs without the production analytics token. It fails when:

- any route has a Lighthouse performance score below 90;
- any route transfers client-side JavaScript bytes.

Lighthouse requires a local Chrome or Chromium browser. If the command cannot
find a browser, install Chrome/Chromium locally and rerun the audit.

## Asset And JavaScript Policy

Keep Astro's low-JavaScript advantage. Do not add client-side JavaScript,
animation libraries, analytics scripts, or interactive islands unless the value
is explicit and the audit still passes.

Cloudflare Web Analytics is the approved production-only exception. The shared
Astro layout renders the official Cloudflare beacon only when
`PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is present. Leave that variable unset
for local development, preview deployments, and static audit runs so the
zero-JavaScript guardrail remains effective by default.

There are currently no raster images in the site. Future local raster images
should use Astro image tooling where appropriate:

- store source images in `src/` when Astro should transform them;
- render them with `astro:assets` `<Image />` or `<Picture />`;
- prefer responsive sizes and modern formats for large visual assets;
- keep public assets for files that should be copied as-is.

Reference: [Astro image documentation](https://docs.astro.build/en/guides/images/).
