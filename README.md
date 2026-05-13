# Migration Decision Assistant

A public V1 web application that helps users choose between:

1. Azure Local
2. Azure Red Hat OpenShift
3. Windows Server / Hyper-V

The app is a deterministic wizard, not a chatbot. It uses explicit scoring rules, shows why the highest-scoring option won, compares alternatives side by side, and exports results as Markdown or JSON.

## Tech stack

- React
- TypeScript
- Vite

## Deterministic decision model

The decision engine lives in `src/decisionEngine.ts`.

Each questionnaire answer applies fixed point impacts to all three options across these criteria:

- Workload fit
- Operating model
- Cloud integration
- Modernization
- Cost continuity
- Risk readiness

The highest total score is recommended. If two options tie, a fixed product order is used so the result remains reproducible:

1. Azure Local
2. Azure Red Hat OpenShift
3. Windows Server / Hyper-V

The output includes:

- Recommended option
- Score and confidence
- Rationale signals
- Cautions to validate
- Side-by-side comparison
- Rule inventory
- Exportable Markdown and JSON results

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Public content note

This repository is intended for public GitHub Pages hosting. Do not add confidential or internal-only text to the app, docs, or rule descriptions. Local internal references, if available, should only be used to derive generalized scoping fields, dimensions, and report ideas.
