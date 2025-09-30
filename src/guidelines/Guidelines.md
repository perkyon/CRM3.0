# General guidelines (EN)

## App & Platforms
- Product: **Web CRM for a furniture workshop** (client management + production tracking).
- Breakpoints:
  - **Mobile**: 360–599
  - **Tablet**: 600–1023
  - **Desktop**: 1024–1439
  - **Large**: ≥1440
- Ship **mobile screens** for all core flows: Dashboard (light), Clients (list + profile), Projects (list + detail), Production (Kanban), Project → BOM/Materials, Finance (estimates/invoices).

## Layout & Grids
- Desktop: **12-column** grid, 24 px gutter, container 1200–1280.
- Tablet: **8-column**, 20 px gutter.
- Mobile: **4-column**, 16 px gutter, 16 px page padding.
- Vertical rhythm: **4 px**. Control heights 40–44 px (mobile 40 px). Table rows 44–48 px.

## Auto Layout & Responsiveness
- Use **Auto Layout everywhere**.
  - Pages: vertical flow; toolbars/rows: horizontal.
  - Spacing scale: 8 / 12 / 16 / 24 / 32 / 48.
- Constraints:
  - Header: Left/Right + Top (stretches).
  - Sidebar: Left + Top/Bottom (fixed width).
  - Content: Fill/Scale horizontally.
- Absolute positioning only for small badges/decor.

## Navigation
- Desktop: **Topbar + Sidebar** (sidebar collapsible).
- Tablet: collapsible sidebar → Drawer when needed.
- Mobile: **Top App Bar** (burger, title, search/actions). Forms may use a sticky **bottom action bar** (Save / Cancel).

## Data Presentation
- Tables: resizable columns, pin left/right, sort (▲▼), filter panel (right Drawer on desktop; full-screen Sheet on mobile).
- Financial tables must include a **total row**.
- Provide **Saved views** (named filter presets) and batch actions (checkbox + bottom tray).

## Forms & Validation
- 2–3 columns on desktop; single column on mobile; grouped by cards/sections.
- Masks: phone, currency, date. Inline validation (red border + message). Global error banner on submit.
- Primary CTA: **Save**; Secondary: **Cancel**. Secondary actions live in the right toolbar area.

## Kanban (Production)
- Columns: Brief → Design → Procurement → Cutting → Drilling → Sanding → Painting → Assembly → QA → Logistics/Install → Done.
- Card: project title + ID, owner, due, status chip, sub-step checklist, risk badge, mini progress.
- Drag & drop changes status → show toast + append to audit history.

## Search, Filters, Sorting
- Global search in header: clients, projects, phone, address, article/SKU, IDs.
- Quick filters as chips above content; advanced filters in a right panel (Drawer/Sheet).
- Keep preset filters per page (Saved views).

## Accessibility & States
- Contrast ≥ **WCAG AA**. Interactive hit areas ≥ **40 px**.
- Visible focus ring (primary blue).
- Always provide states: **default / hover / focus / active / disabled / loading / error / success / empty**.
- Never rely on color alone; pair with icon or label.

## Copy & Locale
- Language: **ru-RU**; concise, action verbs for CTAs.
- Dates: **DD.MM.YYYY**, 24-hour time. Currency: `1 234 567,89 ₽`.
- No ALL CAPS except for abbreviations.

## Icons & Media
- Icons: **SVG**, 16/20/24 px grid; monochrome by default.
- Empty states ≤ **200 KB**, SVG/WebP preferred.

## Performance & Export
- Reuse tokens for colors/typography/effects (no raw HEX in components).
- Images: WebP/AVIF; logos as SVG.
- Auto Layout nesting ≤ **3** levels when possible.

## Documentation & Handoff
- Screen header contains **design version** (e.g., `v1.2`), date, and author.
- Components document **props/variants**, usage, and examples in Figma notes.
- Provide spacing/size specs (Figma Inspect) and links to related components.

## Mock Data (for AI)
- Realistic Russian names/companies, `+7` phones, furniture materials (Laminated chipboard 16/18, MDF 16/19, hardware Blum/Hettich).
- Statuses as **chips** from the design system.
- Don’t invent obscure hardware brands.

## Do / Don’t
- **Do:** Auto Layout, tokens, totals in tables, explicit states, saved views, audit trail.
- **Don’t:** absolute layout for content, raw colors/fonts, heavy shadows, FAB/bottom tabs (except mobile forms bar), raster icons, overly long placeholders.
