# Public reference summary

These notes summarize public documentation themes used to shape the deterministic scoring model in the Migration Decision Assistant. They are intentionally generalized for a public repository.

## Azure Local

Public Microsoft documentation emphasizes Azure Local as a hybrid platform for running workloads on-premises while using Azure management capabilities. Relevant public themes include:

- Azure Arc integration for governance, inventory, monitoring, extensions, and hybrid services.
- Azure Local VM management through Azure tooling, with Windows Admin Center and PowerShell available for scenarios that require local management workflows.
- Hybrid value for organizations that need workloads close to users, facilities, data, or edge locations while still adopting Azure operations.

Useful source areas:

- Azure Local hybrid capabilities with Azure services
- Azure Arc VM management on Azure Local
- Windows Admin Center management for Azure Local

## Azure-native (cloud-first)

Public Microsoft documentation positions Azure regions as the default target for greenfield workloads that have no on-premises placement requirements. Relevant public themes include:

- Cloud Adoption Framework landing zones, identity, networking, and policy baselines.
- Azure-native services such as Azure VMs, AKS, App Service, AVD, and managed AI services.
- Suitability for greenfield or container-first workloads that benefit from elasticity and managed services.

Useful source areas:

- Azure architecture center
- Cloud Adoption Framework
- Azure Well-Architected Framework

## Windows Server / Hyper-V

Public Microsoft documentation describes Hyper-V as Windows Server virtualization for running isolated virtual machines with enterprise features. Relevant public themes include:

- VM consolidation and low-change migration for Windows and Linux workloads.
- Familiar Windows Server administration, PowerShell, Windows Admin Center, Failover Clustering, and System Center integration.
- Cost continuity where existing Windows Server skills, tooling, and licensing are important.

Useful source areas:

- Hyper-V virtualization overview
- Hyper-V architecture and technical capabilities
- Windows Server high availability and virtualization management documentation

## Derived decision dimensions

The app converts these public themes into deterministic scoring dimensions:

- Workload fit: VM estate, containers, mixed workloads, Windows dependencies.
- Operating model: Azure-native governance, local Windows administration, OpenShift/Kubernetes skills.
- Cloud integration: on-premises placement, Azure regional placement, hybrid flexibility, connectivity readiness.
- Modernization: container platform requirements, DevOps maturity, OpenShift standardization.
- Cost continuity: preserving existing investments versus adopting hybrid or managed platform value.
- Risk readiness: acceptable change level, resiliency model, and delivery style.
