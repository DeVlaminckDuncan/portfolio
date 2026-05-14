## 2025-05-15 - Accessible Smooth Scrolling
**Learning:** Adding `scroll-behavior: smooth` globally without a `prefers-reduced-motion` media query can cause discomfort for users with vestibular disorders or motion sensitivity.
**Action:** Always wrap `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)` to respect user system settings.

## 2025-05-15 - Stretched Link Pattern for Interactive Cards
**Learning:** Making entire cards clickable using the 'stretched link' pattern improves the touch/click target area, which is a significant benefit for users with motor impairments.
**Action:** Use a pseudo-element (`::after`) on the primary link within a `position: relative` card container. Ensure any other potentially interactive elements (like tags) have a higher `z-index` to remain accessible.

## 2026-05-14 - Stretched Links with Internal Interactive Elements
**Learning:** When using the 'stretched link' pattern on cards that contain other interactive elements (like email links within a contact card), it is crucial to use `isolation: isolate` on the container and `position: relative; z-index: [value > 1]` on the internal links. This ensures the internal links remain clickable and don't get "buried" under the pseudo-element of the primary stretched link.
**Action:** Always verify inner link accessibility when applying stretched links to containers with multiple actions.
