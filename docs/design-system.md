# Design System

This portfolio uses an Editorial Systems direction: quiet, structured, and
documentation-grade. The visual foundation should support technical credibility
without feeling like a generic developer template. It is intentionally small so
future portfolio pages can reuse the same decisions without introducing a UI
framework or premature component variants.

## Color

The public color interface lives in `src/styles/global.css` as CSS custom
properties.

| Token | Value | Role |
| :--- | :--- | :--- |
| `--color-page` | `#f7f8fa` | Default page background |
| `--color-surface` | `#ffffff` | Cards, panels, and raised surfaces |
| `--color-text` | `#17202a` | Primary foreground text |
| `--color-text-muted` | `#53606c` | Supporting copy and secondary labels |
| `--color-border` | `#d8e0e7` | Subtle separators and outlines |
| `--color-accent` | `#1f4f5f` | Links, primary actions, and active states |
| `--color-accent-foreground` | `#ffffff` | Text on accent backgrounds |
| `--color-focus` | `#2f7d8f` | Keyboard focus outlines |

Use `--color-text` on `--color-page` or `--color-surface` for primary reading
surfaces. Use `--color-text-muted` only for supporting text where lower emphasis
is intentional. Use `--color-accent-foreground` on `--color-accent` for primary
actions.

## Typography

The site uses the system sans-serif stack defined by `--font-family-sans`. No
external font is loaded in this phase, keeping the static site fast and simple.

| Token | Value | Intended use |
| :--- | :--- | :--- |
| `--font-size-xs` | `0.75rem` | Small metadata |
| `--font-size-sm` | `0.875rem` | Labels and compact navigation |
| `--font-size-base` | `1rem` | Body copy |
| `--font-size-lg` | `1.125rem` | Lead copy and emphasized text |
| `--font-size-xl` | `1.25rem` | Small section headings |
| `--font-size-2xl` | `1.5rem` | Medium section headings |
| `--font-size-3xl` | `2rem` | Page headings |
| `--font-size-4xl` | `2.5rem` | Hero heading on wide viewports |

Type should use fixed rem values, not viewport-based scaling. The base line
height is `--line-height-normal`; headings use `--line-height-tight`.

## Spacing And Layout

Spacing is based on the `--space-*` token scale in `global.css`. New sections
should use `--section-spacing` for vertical rhythm instead of ad hoc padding.

Use `--container-page` for full page content and `--container-readable` for
long-form text. Shared page width is applied through `src/components/Container.astro`;
the base layout owns the document-level `main` element and applies section
padding. Use `--radius-sm`, `--radius-md`, and `--radius-lg` for component
corners; avoid larger radii unless a later issue adds a specific component need.

## Theme Policy

Dark mode is explicitly deferred for this phase. The site declares
`color-scheme: light`, and all current tokens are light-theme tokens. If dark
mode is added later, introduce semantic dark values behind the same token names
instead of creating parallel component styles.
