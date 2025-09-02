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


### Functional Specs
- On load: initializes and expands the tree. If initial data is unavailable, shows a single root “Missed Deadline”.
- Rows display: expander toggler, checkbox, editable name, and Add Child button.
- Selection: checking a parent auto-selects its subtree; delete cascades accordingly.

### Technical Specs
- Angular 20 standalone app; PrimeNG 20 TreeTable, Button, InputText, Checkbox.
- Theme: Prime theme via `@primeuix/themes` Lara preset configured in app config.
- Key files:
  - Routes: `src/app/app.routes.ts`
  - Landing component: `src/app/landing/landing.component.ts|html|css`

### Data Model
- Tree data is an array of nodes. Each node:
  - `key`: string (unique id)
  - `data`: object with `name: string`, `level: number`
  - `children`: array of child nodes

```ts
interface TreeNode {
  key?: string;
  data?: { name?: string; level?: number };
  children?: TreeNode[];
}
```

Example (`public/data/ishikawa.json`):
```json
[
  {
    "key": "missed-deadline",
    "data": { "name": "Missed Deadline", "level": 1 },
    "children": [
      { "key": "method", "data": { "name": "Method", "level": 2 }, "children": [] }
    ]
  }
]
```

### Run locally
```bash
npm install
npm start   # http://localhost:4200
```

### Notes
- This demo focuses on the UI/UX for capturing contributing factors. Persistence is intentionally not specified.
