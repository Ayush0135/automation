---
name: frontend-design
description: Design and refine professional SaaS dashboard interfaces for product video discovery with clean editorial layouts, robust data visualization, and complete state management.
---

# Frontend Design: Product Video Discovery Dashboard

Apply this skill when designing, building, or refining the Product Video Discovery Dashboard UI. The dashboard serves professional product research, discovering product videos across Instagram Reels and Meta Ad Library, scoring AI matches, and surfacing evidence.

## 1. Visual Direction & Aesthetic Philosophy

- **Serious Product-Research SaaS**: Treat this as an analytical workspace for e-commerce operators, marketers, and researchers.
- **Editorial & Data-Focused**: Emphasize clean typographic rhythm, deliberate whitespace, restrained palettes, and information density over decorative noise.
- **Anti-Patterns to Avoid**:
  - Do NOT use generic AI template styling (heavy neon glow, purple-to-cyan gradients everywhere).
  - Do NOT use exaggerated pill shapes, overly rounded cards (`rounded-3xl` everywhere), or excessive backdrop blurs that harm legibility.
  - Avoid pointless decorative icons and visually repetitive, card-stack layouts.

## 2. Pre-Design Audit Workflow

- **Inspect First**: Before writing or modifying UI code, examine the current interface and identify its primary usability gaps, visual clutter, and layout bottlenecks.
- **Preserve Functionality**: Maintain existing functional integrations, callbacks, query params, and event handlers while refactoring visual presentation.
- **Component Reuse**: Audit and reuse existing design system primitives, tokens, and components before introducing new dependencies.

## 3. Coherent Design System & Tokens

Establish and enforce consistent primitives:
- **Color Palette**: Neutral dark or neutral light slate backgrounds, crisp foreground text, subdued borders, and purposeful semantic tokens (e.g., Instagram purple/pink accent, Meta blue, high/medium/low confidence score indicators).
- **Typography**: Clear hierarchy with distinct tabular figures (`tabular-nums`) for timestamps, counts, and match percentages.
- **Component Primitives**: Standardize styles for inputs, source toggle tabs, filter chips, buttons, badges, tables, and modal drawers.

### 3.1 Design Intelligence Integration (`ui-ux-pro-max`)
Leverage the installed `ui-ux-pro-max` toolchain to query verified styles, color palettes, font pairings, and UX guidelines:
- **Styles**: `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard" --domain style`
- **Colors**: `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "saas" --domain color`
- **Typography**: `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "technical" --domain typography`
- **UX Guidelines**: `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "table" --domain ux`

## 4. Real Workflow Design

Design screens around actual operator task flows:
1. **Product Specification Input**: Clean input for product URLs, brand names, keywords, or SKU tags with clear submission feedback.
2. **Dual-Source Progress Tracking**: Clear side-by-side or partitioned status monitoring for Instagram Reels and Meta Ad Library scraping/API retrieval.
3. **Match Review & Evidence Inspection**: Result cards and detail panes displaying:
   - Video thumbnail with aspect ratio preservation and playable/preview indicator.
   - Distinct source badge (Instagram Reel vs. Meta Ad Library).
   - Match score / AI confidence badge with uncertainty made visible (e.g., exact visual match vs. keyword match).
   - Duplicate indicators and grouping.
   - Quick access to original source URLs and verification metadata.
4. **Interactive Filtering & History**: Easy filtering by date discovered, match score, source platform, and saved query history.

## 5. Comprehensive State Handling

Every view must explicitly handle six lifecycle states:
- **Empty State**: Actionable guidance for initial search or zero matches found with suggestions to broaden criteria.
- **Loading State**: Progressive skeletons matching the target layout (not a generic spinner), reflecting per-source progress.
- **Partial Results**: Immediate display of early results from one source while the other source completes discovery.
- **Success State**: Rich, scannable data presentation with sorting and export options.
- **Error State**: Informative error cards with retry controls and clear error causes.
- **Blocked / Access Restricted**: Clear messaging when platform credentials, rate limits, or verification challenges occur, with remediation links.

## 6. Functional Integrity & Realism

- **Actionable Controls**: Every button, chip, toggle, and dropdown must perform its advertised action. No dummy non-functional buttons.
- **Realistic Sample Data**: Use diverse, domain-authentic product names, realistic reel captions, valid metrics, and varied video durations rather than `Lorem Ipsum` or repetitive placeholder values.

## 7. Accessibility, Responsiveness & Motion

- **Responsive Breakdown**: Seamless layout across mobile (compact summary view), tablet, and desktop (full multi-column discovery table/grid).
- **Accessibility (a11y)**: Semantic HTML tags, visible `:focus-visible` rings, ARIA labels on icon-only actions, and WCAG AA contrast compliance.
- **Subtle Feedback**: Limit transitions to micro-interactions (hover states, drawer slides, accordion toggles) that provide clear tactile feedback.

## 8. Verification Protocol

- If browser preview, screenshot, or layout tools are available, inspect the actual rendered output and resolve layout shifts or visual flaws before completion.
- Never claim visual verification unless the UI was actively rendered and reviewed.
