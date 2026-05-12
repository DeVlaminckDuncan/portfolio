## 2025-05-15 - Accessible Smooth Scrolling
**Learning:** Adding `scroll-behavior: smooth` globally without a `prefers-reduced-motion` media query can cause discomfort for users with vestibular disorders or motion sensitivity.
**Action:** Always wrap `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)` to respect user system settings.

## 2025-05-15 - Stretched Link Pattern for Interactive Cards
**Learning:** Making entire cards clickable using the 'stretched link' pattern improves the touch/click target area, which is a significant benefit for users with motor impairments.
**Action:** Use a pseudo-element (`::after`) on the primary link within a `position: relative` card container. Ensure any other potentially interactive elements (like tags) have a higher `z-index` to remain accessible.
