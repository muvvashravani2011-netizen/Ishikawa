## Ishikawa (Fishbone) Demo – Contributing Factors for Missed Deadline

### Problem Statement
Provide an editable tree to capture and manage contributing factors for the root problem “Missed Deadline”.

### Background
The Ishikawa (fishbone) method organizes causes across categories like Method, People, Machine, Materials, Environment, and Measurement. This app presents it as an editable TreeTable for quick brainstorming and refinement.

### Scope
- Landing page with a PrimeNG TreeTable and a single column: “Contributing Factors for Missed Deadline”.
- Inline editing at all levels (root to level 4).
- Per-row Add Child action; max depth = 4.
- Checkbox selection for rows; Delete Selected removes selected nodes and their descendants.
- All nodes are expanded by default; indentation increases by level.
- Asset-only data source: `public/data/ishikawa.json` (no server/localStorage persistence).

### Functional Specs
- On load: fetch `/data/ishikawa.json`; if missing, show a single root “Missed Deadline”.
- Rows display: expander toggler, checkbox, editable name, and Add Child button.
- Selection: checking a parent auto-selects its subtree; delete cascades accordingly.

### Technical Specs
- Angular 20 standalone app; PrimeNG 20 TreeTable, Button, InputText, Checkbox.
- Theme: Prime theme via `@primeuix/themes` Lara preset configured in app config.
- Key files:
  - Data: `public/data/ishikawa.json`
  - Routes: `src/app/app.routes.ts`
  - Landing component: `src/app/landing/landing.component.ts|html|css`

### Run locally
```bash
npm install
npm start   # http://localhost:4200
```

### Notes
- Changes made in the UI are not persisted; to change initial data, edit `public/data/ishikawa.json`.
