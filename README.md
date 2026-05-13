# Migration Decision Assistant

A customer-ready, deterministic web application that helps you choose between three migration paths:

1. Windows Server / Hyper-V
2. Azure Local
3. Azure-native (cloud-first), recommended only when the score clearly leans there

The assistant uses a multi-stage branching questionnaire, deterministic scoring rules, and dynamic documentation links. It does not rely on freeform AI reasoning.

## Tech stack

- React
- TypeScript
- Vite

## How the recommendation works

The questionnaire is grouped into stages:

1. **Workload profile** — primary workload, OS mix, and footprint scale.
2. **Placement and sovereignty** — placement requirements, connectivity, and sovereignty constraints.
3. **Modernization signals** — AKS, Azure Virtual Desktop, and AI / GPU demand.
4. **Migration and operations** — current platform, migration and DR posture, and operating model.
5. **Azure Local deployment design** — drill-down shown when Azure Local is the leading recommendation.

Each answer applies fixed point impacts to the three platforms across deterministic dimensions. Workload signals also activate **workload overlays**:

- AI / local inference / GPU
- AKS on Azure Local
- Azure Virtual Desktop on Azure Local
- Sovereign or disconnected scenarios
- Migration and disaster recovery

The Azure-native cloud path is only recommended when its score clearly leads the on-premises platforms by a fixed margin and no answer requires on-premises placement.

If Azure Local wins, the drill-down stage refines the recommendation into one of:

- Connected hyperconverged Azure Local
- Disconnected operations for Azure Local
- Disaggregated SAN for Azure Local
- Multi-rack Azure Local

## Result experience

The result page provides:

- Recommended platform and confidence
- Why the recommendation won
- Recommended Azure Local deployment type, when applicable
- Active workload overlays
- Architecture considerations
- Recommended next steps
- Documentation links rendered dynamically from the result
- Microsoft guidance, including Odin for Azure Local, Hyper-V documentation, Microsoft Unified, and Services Hub references
- Side-by-side comparison of all three platforms
- Markdown and JSON export
- Reference guidance disclaimer

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

## Public references used

- https://azure.github.io/odinforazurelocal/
- https://azure.github.io/odinforazurelocal/docs/reference-architectures/
- https://azure.github.io/odinforazurelocal/sizer/
- https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline
- https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local
- https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-baseline
- https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-hybrid-azure-local
- https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-workload-virtual-desktop
- https://learn.microsoft.com/en-us/azure/virtual-desktop/azure-local-overview
- https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/
- https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/overview
- https://learn.microsoft.com/en-us/services-hub/unified/services/
- https://learn.microsoft.com/en-us/services-hub/unified/services/workshopplus
- https://www.microsoft.com/en-us/microsoft-unified

## Disclaimer

This Migration Decision Assistant provides reference guidance based on the answers you supply. It does not replace formal architecture review. Customers still need workload sizing, licensing validation, validated hardware confirmation, identity and security design, networking design, supportability review, and a formal architecture review before any deployment.
