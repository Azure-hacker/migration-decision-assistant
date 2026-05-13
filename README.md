# Migration Decision Assistant

> Open source reference guide for scoping conversations between **Azure Local** and **Windows Server / Hyper-V** deployment patterns.

🌐 **Live site:** https://azure-hacker.github.io/migration-decision-assistant/

---

## What it is

The Migration Decision Assistant is a deterministic, rule-based wizard. It asks structured questions about a customer environment (sites, hosts, VMs, cores, storage strategy, sovereignty, AVD, AKS, Foundry Local, and other strategic workloads) and returns:

- One or more **recommended deployment patterns** with rationale, "best for", and "watch-outs"
- A **side-by-side decision matrix** for Azure Local vs. Hyper-V
- **Workload overlays** (AVD, AKS, Foundry Local, GitHub Enterprise local, M365 Local, sovereign / disconnected, migration / DR, cross-site availability)
- A **hybrid recommendation** when both platforms score meaningfully and the workloads naturally split
- A pointer to **Azure-native (cloud-first)** alternatives and the Azure pricing calculator
- Links to **Microsoft Unified** offerings for delivery, activation, and Day 2 operations

Patterns surfaced today:

- Hyper-V Failover Cluster
- Hyper-V Campus / stretched cluster
- Hyper-V with iSCSI / SMB / FC SAN-attach
- Azure Local connected hyperconverged
- Azure Local with Resilient Cross-Site (RAC)
- Azure Local multi-rack
- Azure Local with disaggregated SAN
- Azure Local Disconnected Operations (ALDO)

## Who it is for

- **Microsoft POD leads** scoping VMware-exit engagements
- **Customers and partners** who want a structured, documented frame for the Azure Local vs. Hyper-V decision

This tool is **not a replacement** for sizing, licensing review, validated hardware confirmation, identity / security / networking design, supportability review, or formal architecture review.

## Open source disclaimer

This is an **open source community tool**. It is not an official Microsoft product, support channel, or commitment. Recommendations are informational and reference the public Microsoft Learn documentation in effect at the time of evaluation.

## Auto-updated reference versions

Public Microsoft documentation is the single source of truth. A scheduled GitHub Actions workflow runs every 14 days, fetches the latest Azure Local and Windows Server release names from Microsoft Learn, and updates [`src/data/versions.json`](src/data/versions.json). Any change is committed automatically, which redeploys GitHub Pages.

You can also trigger the refresh manually from the **Actions → auto-update-versions → Run workflow** menu.

## Tech stack

- React 19 + TypeScript
- Vite
- GitHub Pages for hosting
- GitHub Actions for build, deploy, and version refresh

## Develop locally

```bash
npm install
npm run dev      # local dev server
npm run lint     # ESLint
npm run build    # type-check + production build
npm run preview  # preview the built site
```

## Deploy

The `deploy-pages.yml` workflow builds and publishes on every push to `main`.

## Contribute and report issues

- Open an issue: https://github.com/Azure-hacker/migration-decision-assistant/issues/new
- Add a deployment pattern, refine the scoring, or improve the rationale text by editing [`src/decisionEngine.ts`](src/decisionEngine.ts)
- Improve the questionnaire by editing the `stages` array in the same file

PRs welcome.
