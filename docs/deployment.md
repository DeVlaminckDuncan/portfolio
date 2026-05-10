# Deployment

This portfolio deploys to Cloudflare Pages from the GitHub repository
`DeVlaminckDuncan/portfolio`.

## Cloudflare Pages Project

| Setting | Value |
| :-- | :-- |
| Project name | `portfolio` |
| Git provider | GitHub |
| Repository | `DeVlaminckDuncan/portfolio` |
| Production branch | `main` |
| Build command | `bun install --frozen-lockfile && bun run build` |
| Build output directory | `dist` |
| Root directory | repository root |
| Build caching | enabled |
| Production deployments | enabled |
| Preview deployments | all non-production branches |
| Production URL | `https://duncandevlaminck.be` |
| Additional custom domain | `https://www.duncandevlaminck.be` |
| Pages hostname | `https://portfolio-a8o.pages.dev` |

The project uses Astro static output. `astro.config.mjs` sets `output: "static"`,
and `bun run build` writes the deployable site to `dist`. The Cloudflare Pages
build command installs dependencies explicitly before running the repository
build script because Pages does not expose a separate install-command field in
the project API.

## Build Environment

Configure these variables in both the production and preview Pages
environments:

| Variable | Value | Purpose |
| :-- | :-- | :-- |
| `BUN_VERSION` | `1.3.9` | Matches the repository `packageManager` setting. |
| `NODE_VERSION` | `22.16.0` | Pins the Cloudflare Pages build image to the Node 22 runtime line. |

Configure this variable only in the production Pages environment:

| Variable | Value | Purpose |
| :-- | :-- | :-- |
| `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | Cloudflare Web Analytics site token | Enables the Cloudflare Web Analytics beacon in production builds. |

Do not configure `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` in local development or
preview deployments unless tracking scope changes in a future issue. The shared
Astro layout only renders the analytics script when this token is present, which
keeps local builds, preview deployments, and the default performance audit free
of client-side analytics JavaScript.

Keep Cloudflare Pages Web Analytics auto-injection disabled for this project.
Analytics is integrated through repository markup so the tracking behavior stays
explicit and duplicate beacons are avoided.

## Custom Domain

Cloudflare DNS is authoritative for `duncandevlaminck.be`. The Pages project has
these custom domains attached and active:

| Domain | DNS record | Target | Proxy |
| :-- | :-- | :-- | :-- |
| `duncandevlaminck.be` | `CNAME` | `portfolio-a8o.pages.dev` | enabled |
| `www.duncandevlaminck.be` | `CNAME` | `portfolio-a8o.pages.dev` | enabled |

The apex `TXT` record with `v=spf1 -all` is unrelated to Pages and should stay
in place unless email policy changes.

## Verification

Before pushing deployment changes, run:

```sh
bun run check:ci
bun run build
```

For analytics changes, also verify both build modes from the repository root:

```sh
bun run build
rg "static.cloudflareinsights.com" dist
```

The `rg` command must return no matches when
`PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is unset.

```sh
PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<production token> bun run build
rg "static.cloudflareinsights.com" dist
```

The `rg` command must return matches in generated HTML when the production token
is set.

After pushing to `main`, verify the latest Cloudflare Pages production
deployment succeeds and that the production URL and custom domains return HTTP
200. Then confirm `https://duncandevlaminck.be` HTML includes
`https://static.cloudflareinsights.com/beacon.min.js`, visit the production site
once, and confirm recent traffic appears in Cloudflare Web Analytics after the
data has had a few minutes to ingest.

## Troubleshooting

- If Cloudflare cannot connect to the repository, reinstall or update the
  Cloudflare Workers & Pages GitHub App and grant access to
  `DeVlaminckDuncan/portfolio`.
- If dependency installation uses an unexpected package manager or version,
  confirm `BUN_VERSION` is set in both production and preview environments and
  that the build command still starts with `bun install --frozen-lockfile`.
- If the build succeeds locally but fails on Pages, compare the Pages build log
  against `bun run build` output and confirm the build output directory remains
  `dist`.

## References

- [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Cloudflare Pages GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
