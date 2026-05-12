## 2026-05-12 - Security Headers Implementation
**Vulnerability:** Missing HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.).
**Learning:** For static Astro sites on Cloudflare Pages, security headers are best managed via a `public/_headers` file. The CSP must explicitly whitelist `static.cloudflareinsights.com` and `cloudflareinsights.com` to support the production analytics integration without compromising the restrictive `default-src 'none'` policy.
**Prevention:** Always verify that third-party integrations (like analytics or fonts) are accounted for in the CSP to prevent breakage during production deployment.
