# Bolt's Journal

## 2025-05-15 - Cloudflare Analytics Preconnection
**Learning:** Cloudflare Web Analytics uses two domains: 'static.cloudflareinsights.com' for the beacon script and 'cloudflareinsights.com' for data collection. Providing preconnect hints for BOTH ensures the connection to the collection endpoint is established early, reducing the impact on the main thread during the reporting phase.
**Action:** Always include both preconnect hints when configuring the Cloudflare Web Analytics beacon.

## 2026-05-15 - Astro Prefetch and JavaScript Byte Limit
**Learning:** Adding 'data-astro-prefetch' to links in an Astro project with 'output: static' and no other JavaScript can trigger Astro to inject its prefetch client-side script. This violates a strict zero-JavaScript performance audit. While prefetching improves perceived performance, it has a measurable cost in JavaScript bytes.
**Action:** Avoid 'data-astro-prefetch' in environments with a zero-JavaScript budget unless the audit is adjusted to allow the minimal Astro prefetch script.
