# Epitech International Mobility

A responsive TypeScript and React catalogue for exploring Epitech partner universities. The interface follows the visual language of the MYA student dashboard and is built with React, Mantine, React Router, and Vite.

The app is a static frontend: school profiles are loaded from a bundled JSON file, and saved schools are kept in the browser. It does not require an API server or a database.

## Repository scope

This `web-app/` directory is the Git repository and the only directory pushed. The checked-in runtime dataset at `public/data/mya-epitech-universities.json` is included, so a clone of this repository can run by itself.

## Quick start

Install [Bun](https://bun.sh/) if it is not already available, then run these commands from this directory:

```sh
bun install
bun run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`). The `/` route redirects to `/schools`.

## Commands

| Command | Purpose |
| --- | --- |
| `bun install` | Install the dependencies recorded in `bun.lock`. |
| `bun run dev` | Start the Vite development server. |
| `bun audit` | Check installed dependencies for known vulnerabilities. |
| `bun run typecheck` | Check all TypeScript files without emitting output. |
| `bun run build` | Type-check the project, then create the production site in `dist/`. |
| `bun run preview` | Serve the production build locally for review. |

## Catalogue features

- Browse partner school cards with a cover image, country, study areas, available places, minimum GPA, language, and extra cost.
- Search schools, countries, and study areas. Open global search with **Ctrl+K** or **⌘K**; press **Escape** to close it.
- Filter by one or more schools, countries, study areas, and study durations. Options inside each menu can be searched and selected together. Multiple choices within a filter are combined as alternatives; separate filters are combined together.
- Enable **Require all** in the Study areas menu to show only schools that offer every selected study area. The filter button shows an **ALL** marker when this mode is active.
- Sort by name, available places, or extra cost.
- Browse results 12 schools at a time with numbered pagination. Changing a filter or search starts at the first page.
- Save or unsave schools with the heart button. Saved schools are stored in `localStorage` under `mya-saved-schools` and remain in that browser after reloads.
- Explore the directory by country or study area. Selecting one opens the school directory with that filter applied.
- Open a school profile for its image gallery, quick facts, study areas, and available overview, application, accommodation, course, and cost information.
- Use the responsive navigation and layouts on narrower screens.

## Routes

| Route | Page |
| --- | --- |
| `/` | Redirects to `/schools`. |
| `/schools` | Partner school directory. Supports repeated `country` and `specialization` query parameters, for example `/schools?country=Canada&country=Australia&specialization=Security`. |
| `/schools/:id` | Detailed profile for a school record ID. |
| `/schools?view=saved` | Saved schools. |
| `/countries` | Country directory with partner counts. |
| `/specializations` | Study area directory with partner counts. |
| `/planning` | Planning placeholder in the student navigation. |
| `/academic/*` | Academic details placeholder in the student navigation. |

The selected schools, durations, sort order, and strict study area mode are local to the directory view. Country and study area selections are reflected in the URL.

## School data

The runtime dataset committed with this repository is `public/data/mya-epitech-universities.json`; the app fetches that file when it starts. The current snapshot contains **137 school records**, **44 countries**, and **37 study areas** (retrieved on 2026-10-07).

Each record can include:

- Identity and mobility details: `id`, `name`, `country`, `gpa`, `spots`, `diploma`, `language`, `extracharge`, `erasmus`, `semester`, `display`, and `updatedAt`.
- Study areas in `specializations`.
- Images in `images`, with legacy `image1`, `image2`, and `image3` fields also retained in the source data.
- Rich school information in `overview`, `administrative`, `accomodation`, `courses`, and `cost`. The source spells the accommodation key `accomodation`; keep that exact spelling when editing records.

To update the catalogue, replace `public/data/mya-epitech-universities.json` with the refreshed dataset:

```sh
cp /path/to/mya-epitech-universities.json public/data/mya-epitech-universities.json
```

The app fetches the JSON without using a browser cache. Profile HTML is sanitized before display: only an allowlist of text and layout elements, HTTP(S) or mail links, HTTP(S) images, and inline PNG, JPEG, GIF, or WebP images are retained. School gallery images are loaded from the URLs stored in the dataset.

## Production build

Create and inspect a production build with:

```sh
bun run build
bun run preview
```

The GitHub Actions workflows audit dependencies, run the typecheck, and create a production build for every pull request targeting `main` and every push to `main`. A push to `main` also deploys the production build to GitHub Pages after the same dependency audit. The deploy workflow copies `index.html` to `404.html` so direct links to school profiles and other app routes continue to work after refresh.

To enable deployment for a repository, open **Settings → Pages** on GitHub and set the build and deployment source to **GitHub Actions**. GitHub Pages serves this project under `/mya-improved/`; Vite and React Router use that base path automatically in Actions builds. Local development and builds continue to use `/`.

School images are remote URLs from the dataset, so they are not copied into `dist/`.

## Project layout

```text
web-app/                                      # Git repository root
├── public/data/mya-epitech-universities.json  # Runtime catalogue data
├── src/
│   ├── app/App.tsx                            # App shell, data loading, and route table
│   ├── components/schools/                    # Shared school UI components
│   │   ├── MultiFilter.tsx
│   │   ├── SchoolCard.tsx
│   │   └── StudentSummary.tsx
│   ├── features/
│   │   ├── schools/
│   │   │   ├── data/                          # Fetch/normalize data and persist saved IDs
│   │   │   ├── pages/                         # Directory, profile, country, and study-area pages
│   │   │   ├── utils/sanitizeHtml.ts           # Sanitize rich profile content
│   │   │   └── types.ts                        # School record types
│   │   └── student-space/InfoPage.tsx          # Planning and academic placeholder
│   ├── legacy/AcademicDashboardPrototype.tsx  # Archived, inactive academic dashboard
│   ├── main.tsx                               # React, router, and Mantine setup
│   └── styles/                                # Shared dashboard and catalogue styles
│       ├── global.css
│       └── schools.css
├── index.html                                 # Vite HTML entry point
├── package.json                               # Scripts and dependencies
├── tsconfig.json                              # TypeScript compiler configuration
└── bun.lock                                   # Bun lockfile
```

The active entry point is `src/main.tsx`. It renders `src/app/App.tsx`, which owns the shared layout and routes. School-specific data, pages, and utilities live under `src/features/schools/`; reusable UI is under `src/components/`. The archived prototype in `src/legacy/` is not part of the active route tree.

## Tech stack

- React 19
- TypeScript
- Vite 7
- Mantine 8 and Mantine Hooks
- React Router 7
- Tabler Icons
- Bun for package installation and scripts
