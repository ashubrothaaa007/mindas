# MINDA project instructions

React + Vite + Tailwind CSS project.

## Development server

The development server uses `$PORT` when provided and otherwise defaults to port 8443. Run `pnpm dev` to start it when it is not already running.

## Project structure

- `src/main.tsx` mounts `src/App.tsx` and imports `src/index.css`.
- `src/App.tsx` composes the application screens and shared overlays.
- `src/index.css` is the global style entrypoint and Tailwind CSS v4 import.
- `index.html` contains the document shell and loads `src/main.tsx`.
- `package.json` contains package metadata and scripts; `pnpm-lock.yaml` is the lockfile.
- `vite.config.ts` configures React, Tailwind CSS v4, and the `@` alias for `src`.

## Dependencies and styling

The project uses React 19, TypeScript, Vite, and Tailwind CSS v4 through `@tailwindcss/vite`. Use Tailwind utilities in JSX and put global CSS or theme customization in `src/index.css`. Keep CSS `@import` statements before font and style declarations. Put global defaults inside `@layer base` so utility classes can override them.
