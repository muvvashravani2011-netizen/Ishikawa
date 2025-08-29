## Problem Statement

The goal is to provide a simple, editable landing page for visualizing and managing a hierarchical Ishikawa (fishbone) analysis for the root problem “Missed Deadline.” Users must be able to:

- View a 4-level tree of causes.
- Inline-edit labels at all levels.
- Add a child node to any row.
- Select multiple nodes via checkboxes and delete them (including their descendants).
- See the full tree expanded by default.

## BackGround

The Ishikawa diagram helps teams identify and organize root causes of a problem across categories (e.g., Method, People, Machine). This application uses Angular and PrimeNG’s TreeTable to present the diagram as an editable tree:

- Angular provides a robust SPA foundation.
- PrimeNG TreeTable gives hierarchical rows with built-in expand/collapse, selection, and templating.
- Data loads from a static asset for quick onboarding and portability.

## Scope

- In scope:
  - Landing page with PrimeNG TreeTable and a single “Name” column.
  - Inline editing for node names at every level.
  - Per-row “Add Child” button (always enabled; no-ops at level 4).
  - Checkbox selection per row with “Delete Selected” to remove nodes and their children.
  - Load initial data from `public/data/ishikawa.json`.
  - Tree fully expanded on load; indentation by level.
  - PrimeNG theme and icons configured.
- Out of scope:
  - Backend persistence (data isn’t saved server-side).
  - Authentication/authorization.
  - Multi-user collaboration, conflict resolution, or audit logs.
  - Undo/redo, advanced validation, or custom sorting/filtering.

## Functional Specifications

- Landing page
  - On app load, fetch `/data/ishikawa.json` and display the tree fully expanded.
  - If the asset load fails, show a fallback with a single root “Missed Deadline”.
- TreeTable behavior
  - Column header: “Name”.
  - Rows show:
    - Expander toggler.
    - Checkbox for selection (no parent/child auto-propagation).
    - Editable input bound to the node’s `name`.
    - Per-row “Add Child” action on the right.
  - Selection
    - Checking any row enables the toolbar “Delete Selected”.
    - Deleting removes selected nodes and all descendants from the tree.
  - Add Child
    - Always enabled; adds a child to that row.
    - No effect at level 4 to enforce max depth.
  - Display
    - Tree fully expanded by default.
    - Indentation increases by level.
- Data model
  - Each node has a unique `key`, `data: { name: string; level: number }`, and `children: TreeNode[]`.

## Technical Specifications

- Framework and libraries
  - Angular 20 (standalone components, zoneless change detection).
  - PrimeNG 20 TreeTable, Button, InputText, and PrimeIcons.
  - Prime theme via `providePrimeNG` with Lara preset from `@primeuix/themes`.
- Key files
  - Data asset: `public/data/ishikawa.json` (served from `/data/ishikawa.json`).
  - Routes: `src/app/app.routes.ts` (root path loads the landing page).
  - App config: `src/app/app.config.ts`
    - `provideRouter(routes)`, `provideHttpClient()`
    - PrimeNG theme: `providePrimeNG({ theme: { preset: Lara, options: { prefix: 'p', darkModeSelector: 'system', cssLayer: false }}})`
  - Landing component: `src/app/landing/landing.component.ts|html|css`
    - Loads JSON with `HttpClient` in `ngOnInit`.
    - Ensures `level` on all nodes, expands all nodes on load.
    - Maintains `expandedKeys` and sets `node.expanded = true`.
    - Checkbox selection with `selectionMode="checkbox"` and `[(selectionKeys)]="selectedKeys"`, with propagation disabled.
    - Inline editing via `[(ngModel)]="rowData.name"`.
    - Per-row Add Child calls `addChild(rowNode.node)`.
    - Delete Selected removes all selected keys recursively.
- Commands

```bash
npm install
npm start   # then open http://localhost:4200
npm run build
```

## Use cases

- Add a cause under “Method”
  - Click the Add Child button on the “Method” row to create a new factor; rename inline as needed.
- Remove irrelevant causes
  - Check any number of rows (e.g., obsolete “Materials” items) and click “Delete Selected” to remove them and their subtrees.
- Refine the hierarchy
  - Add deeper nested causes (up to level 4) and edit their names inline for clarity.
- Start from provided categories
  - On first load, the app shows the provided Ishikawa categories and subcauses from `ishikawa.json`, fully expanded and ready for edits.

# IshikawaApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
