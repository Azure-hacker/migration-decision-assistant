# Public reference summary

These notes summarize public documentation themes used to shape the V1 scoring model. They are intentionally generalized for a public repository.

## Azure Local

Public Microsoft documentation emphasizes Azure Local as a hybrid platform for running workloads on-premises while using Azure management capabilities. Relevant public themes include:

- Azure Arc integration for governance, inventory, monitoring, extensions, and hybrid services.
- Azure Local VM management through Azure tooling, with Windows Admin Center and PowerShell available for scenarios that require local management workflows.
- Hybrid value for organizations that need workloads close to users, facilities, data, or edge locations while still adopting Azure operations.

Useful source areas:

- Azure Local hybrid capabilities with Azure services
- Azure Arc VM management on Azure Local
- Windows Admin Center management for Azure Local

## Azure Red Hat OpenShift

Public documentation and reference architectures position Azure Red Hat OpenShift as a managed OpenShift application platform on Azure. Relevant public themes include:

- Containerized application delivery, Kubernetes/OpenShift operations, and platform engineering.
- Private networking, identity integration, RBAC, policy, observability, and security controls for regulated workloads.
- Fit for organizations standardizing on OpenShift or seeking a managed Azure-hosted application platform.

Useful source areas:

- Azure Red Hat OpenShift overview and reference architectures
- Azure Red Hat OpenShift security and identity guidance
- Azure architecture guidance for regulated OpenShift workloads

## Windows Server / Hyper-V

Public Microsoft documentation describes Hyper-V as Windows Server virtualization for running isolated virtual machines with enterprise features. Relevant public themes include:

- VM consolidation and low-change migration for Windows and Linux workloads.
- Familiar Windows Server administration, PowerShell, Windows Admin Center, Failover Clustering, and System Center integration.
- Cost continuity where existing Windows Server skills, tooling, and licensing are important.

Useful source areas:

- Hyper-V virtualization overview
- Hyper-V architecture and technical capabilities
- Windows Server high availability and virtualization management documentation

## Derived V1 decision dimensions

The app converts these public themes into deterministic scoring dimensions:

- Workload fit: VM estate, containers, mixed workloads, Windows dependencies.
- Operating model: Azure-native governance, local Windows administration, OpenShift/Kubernetes skills.
- Cloud integration: on-premises placement, Azure regional placement, hybrid flexibility, connectivity readiness.
- Modernization: container platform requirements, DevOps maturity, OpenShift standardization.
- Cost continuity: preserving existing investments versus adopting hybrid or managed platform value.
- Risk readiness: acceptable change level, resiliency model, and delivery style.
