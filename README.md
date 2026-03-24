# Frontend Finance Tracker

React + TypeScript frontend for the Personal Finance Tracker application.

## Stack

- React 18
- TypeScript
- Vite
- React Query
- Zustand
- Recharts

## Main files

- [package.json](d:/pft/frontend-finance-tracker/package.json)
- [api.ts](d:/pft/frontend-finance-tracker/src/services/api.ts)
- [global.css](d:/pft/frontend-finance-tracker/src/styles/global.css)
- [Containerfile](d:/pft/frontend-finance-tracker/Containerfile)
- [nginx.conf](d:/pft/frontend-finance-tracker/nginx.conf)

## Local run

```powershell
cd frontend-finance-tracker
npm install
npm run dev
```

Vite dev server:

- `http://localhost:5173`

## Environment variables

Local example file:

- [`.env.example`](d:/pft/frontend-finance-tracker/.env.example)
- [`.env.development`](d:/pft/frontend-finance-tracker/.env.development)

Production example file:

- [`.env.production.example`](d:/pft/frontend-finance-tracker/.env.production.example)
- [`.env.production`](d:/pft/frontend-finance-tracker/.env.production)

Main variable:

- `VITE_API_URL=https://YOUR_BACKEND_HOST/api`

The project now keeps its API base URL in the frontend env files:

- development: `http://localhost:5000/api`
- production: deployed Azure backend URL in [`.env.production`](d:/pft/frontend-finance-tracker/.env.production)

The frontend still falls back to localhost in [api.ts](d:/pft/frontend-finance-tracker/src/services/api.ts) if `VITE_API_URL` is not provided.

## Build

```powershell
cd frontend-finance-tracker
npm run build
```

## Tests

```powershell
cd frontend-finance-tracker
npm run test:run
```

## Podman container

Build locally with Podman:

```powershell
cd frontend-finance-tracker
podman build -t frontend-finance-tracker:local -f Containerfile --build-arg VITE_API_URL=http://localhost:5000/api .
```

Run locally:

```powershell
podman run --rm -p 8080:8080 frontend-finance-tracker:local
```

The frontend container serves the built SPA through Nginx on port `8080` and uses [nginx.conf](d:/pft/frontend-finance-tracker/nginx.conf) for SPA routing.

## Azure deployment notes

For Azure Web App for Containers:

- build the image with the correct `VITE_API_URL`
- set `WEBSITES_PORT=8080` on the frontend app service

The Azure pipeline now builds from the checked-in frontend env files instead of injecting the API URL directly in the workflow:

- [azure-pipelines.yml](d:/pft/frontend-finance-tracker/azure-pipelines.yml)

## Project notes

- The app is responsive across desktop, tablet, and mobile.
- The UI includes transaction/category CRUD, dashboards, goals, budgets, recurring items, accounts, reports, and settings.
- The login/sign-up experience uses modal popups on the landing page.

