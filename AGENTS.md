# Repository Guidelines

## Project Structure & Module Organization

- `src/` – main code. Key folders: `components/` (app widgets), `components/ui/` (shadcn-ui primitives), `pages/` (route screens), `hooks/`, `lib/`.
- `public/` – static assets served as-is.
- `index.html` – Vite entry; `src/main.tsx` bootstraps React.
- Path alias: `@` resolves to `src` (see `vite.config.ts`). Example: `import { Toaster } from "@/components/ui/toaster"`.
- Routing: routes are defined in `src/App.tsx` via `react-router-dom`.

## Build, Test, and Development Commands

- `pnpm run dev` – start Vite dev server on `http://localhost:8080`.
- `pnpm run build` – production build to `dist/`.
- `pnpm run build:dev` – dev-mode build for faster iteration.
- `pnpm run preview` – preview the production build locally.
- `pnpm run lint` – run ESLint on the project.
Notes: Use your preferred PM (`pnpm`, `pnpm`, or `bun`), e.g., `pnpm dev` or `bun run dev`.

## Coding Style & Naming Conventions

- Language: TypeScript + React function components.
- Indentation: 2 spaces; semicolons optional per TS defaults.
- Linting: ESLint (`eslint.config.js`) with `typescript-eslint`, React Hooks, and Refresh. Fix issues before committing.
- File names: page and app components `PascalCase.tsx` (e.g., `DailySales.tsx`); UI primitives in `components/ui` use `kebab-case.tsx` (e.g., `alert-dialog.tsx`).
- Styling: Tailwind CSS with design tokens from `tailwind.config.ts`. Prefer composing shadcn-ui primitives under `components/ui` and app-specific wrappers in `components/`.

## Testing Guidelines

- No test harness is configured yet. Recommended: Vitest + React Testing Library.
- Suggested patterns: co-locate tests as `*.test.ts(x)` beside the source or under `src/__tests__/`.
- Aim for high coverage on `pages/`, shared `components/`, and `lib/` utilities.

## Commit & Pull Request Guidelines

- Commits: prefer Conventional Commits (e.g., `feat: add BottomNav`, `fix: correct date parsing`).
- PRs: include a clear description, linked issues, and screenshots/GIFs for UI changes. Note any routing or API impacts. Ensure `pnpm run lint` passes and builds succeed.

## Security & Configuration Tips

- Environment variables: use `VITE_*` prefixes; place local values in `.env.local` (never commit secrets).
- Server: dev server binds to port `8080` and alias `@` is set—update `vite.config.ts` if needed.
