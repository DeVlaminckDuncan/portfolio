# Bolt's Journal

## 2026-05-13 - Initial Performance Review
**Learning:** Found that even with zero client-side JavaScript, the homepage has a Total Blocking Time (TBT) of 290ms. This is likely due to CSS-heavy layout or specific CSS properties like `text-rendering: optimizeLegibility` affecting the main thread during initial render.
**Action:** Remove `text-rendering: optimizeLegibility` as it's a known performance bottleneck for minimal gains in modern browsers.

## 2026-05-13 - Astro Navigation
**Learning:** The portfolio uses standard `<a>` tags for navigation. In Astro, we can use `data-astro-prefetch` to significantly improve perceived performance by pre-loading pages when a user hovers over or focuses on a link.
**Action:** Implement prefetching on core navigation links.

## 2026-05-14 - Cloudflare Analytics Preconnection
**Learning:** Cloudflare Web Analytics uses two domains: 'static.cloudflareinsights.com' for the beacon script and 'cloudflareinsights.com' for data collection. Providing preconnect hints for BOTH ensures the connection to the collection endpoint is established early, reducing the impact on the main thread during the reporting phase.
**Action:** Always include both preconnect hints when configuring the Cloudflare Web Analytics beacon.
