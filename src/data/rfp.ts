export type RfpEntry = {
  id: string
  category:
    | 'platform'
    | 'security'
    | 'networking'
    | 'storage'
    | 'operations'
    | 'migration'
    | 'workloads'
    | 'commercial'
    | 'support'
  question: string
  answer: string
  references: { label: string; url: string }[]
}

export const rfpCategories: { id: RfpEntry['category']; label: string }[] = [
  { id: 'platform', label: 'Platform' },
  { id: 'security', label: 'Security' },
  { id: 'networking', label: 'Networking' },
  { id: 'storage', label: 'Storage' },
  { id: 'operations', label: 'Operations' },
  { id: 'migration', label: 'Migration' },
  { id: 'workloads', label: 'Workloads' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'support', label: 'Support' },
]

export const rfpEntries: RfpEntry[] = [
  {
    id: 'azure-local-overview',
    category: 'platform',
    question: 'What is Azure Local and how is it different from Hyper-V on Windows Server?',
    answer:
      'Azure Local is a hybrid infrastructure platform delivered on validated hardware with continuous lifecycle, Azure-native operations through Arc, and integrated services for AKS, AVD, and AI. Hyper-V on Windows Server is the traditional virtualization role you install on supported servers using the operating system you already own.',
    references: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
      { label: 'Hyper-V on Windows Server', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
    ],
  },
  {
    id: 'cross-site',
    category: 'platform',
    question: 'How does Azure Local handle cross-site availability versus a Hyper-V campus cluster?',
    answer:
      'Azure Local supports a Resilient Cross-site (RAC) / stretched pattern designed for two-site campus availability with automated failover. A Hyper-V campus cluster achieves cross-site availability with classic Failover Clustering across two close sites and supported storage replication.',
    references: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
      { label: 'Failover Clustering documentation', url: 'https://learn.microsoft.com/en-us/windows-server/failover-clustering/' },
    ],
  },
  {
    id: 'disconnected',
    category: 'platform',
    question: 'Does Azure Local support disconnected or sovereign deployments?',
    answer:
      'Yes — Azure Local Disconnected Operations (ALDO) is designed for sites with intermittent or no Azure connectivity. Validate which Arc and Azure-native features remain available in the disconnected scenarios before committing.',
    references: [
      { label: 'Azure Local what is new', url: 'https://learn.microsoft.com/en-us/azure/azure-local/whats-new' },
    ],
  },
  {
    id: 'shielded-vms',
    category: 'security',
    question: 'How do Shielded VMs and Trusted Launch / vTPM compare across the platforms?',
    answer:
      'Hyper-V on Windows Server provides Shielded VMs through Host Guardian Service with vTPM and BitLocker for high-assurance workloads. Azure Local provides Trusted Launch and Confidential Computing patterns aligned to Azure capabilities. Pick the platform that matches the assurance model you need.',
    references: [
      { label: 'Hyper-V on Windows Server', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
      { label: 'Azure Local Well-Architected service guide', url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local' },
    ],
  },
  {
    id: 'sdn',
    category: 'networking',
    question: 'How is software-defined networking handled?',
    answer:
      'Azure Local includes Network ATC and SDN as a core part of the platform with Azure-aligned virtual networks, micro-segmentation, and managed gateways. Windows Server SDN exists for Hyper-V but typically sits outside daily operations unless a deliberate investment was made.',
    references: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
    ],
  },
  {
    id: 'storage',
    category: 'storage',
    question: 'Can existing FC, iSCSI, and SMB SAN storage be reused?',
    answer:
      'Hyper-V on Windows Server supports FC, iSCSI, and SMB SAN attach with the existing storage vendor support matrix. Azure Local supports Disaggregated SAN as a pattern alongside hyperconverged. Validate the SAN vendor and configuration against the supported matrix for the target platform before committing.',
    references: [
      { label: 'Odin reference architectures', url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/' },
      { label: 'Hyper-V on Windows Server', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
    ],
  },
  {
    id: 'snapshots',
    category: 'operations',
    question: 'Are VM checkpoints / snapshots supported across both platforms?',
    answer:
      'Yes. Both platforms support production checkpoints. Azure Local complements checkpoints with Azure Backup and Azure Site Recovery integration. Avoid using checkpoints as long-term backups in either platform.',
    references: [
      { label: 'Hyper-V on Windows Server', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
    ],
  },
  {
    id: 'control-plane',
    category: 'operations',
    question: 'Where is the source of truth for policy, monitoring, and updates?',
    answer:
      'On Azure Local the Azure control plane (Arc, Azure Policy, Azure Monitor, Azure Update Manager) is the default. On Hyper-V you can keep local tooling (Windows Admin Center, SCVMM, PowerShell) and selectively add Azure services through Arc.',
    references: [
      { label: 'Azure Local Well-Architected service guide', url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local' },
    ],
  },
  {
    id: 'migration-tools',
    category: 'migration',
    question: 'What tooling is available to migrate workloads onto the new platform?',
    answer:
      'Microsoft provides Azure Migrate (assessment plus replication), Windows Admin Center vMode (wave-based VM migration with IP preservation and Gen2 conversion), and SCVMM-led approaches for Hyper-V landings. Choose tooling that matches the target pattern, the wave size, and the operational team\'s skills.',
    references: [
      { label: 'Azure Migrate documentation', url: 'https://learn.microsoft.com/en-us/azure/migrate/' },
      { label: 'Windows Admin Center', url: 'https://learn.microsoft.com/en-us/windows-server/manage/windows-admin-center/overview' },
    ],
  },
  {
    id: 'static-ip',
    category: 'migration',
    question: 'Can static IP addresses be preserved during migration?',
    answer:
      'Windows Admin Center vMode is designed to preserve guest static IP addresses during migration waves. Azure Migrate typically requires planned IP remap, route changes, or DNS strategy adjustments. Document the network plan per wave before executing.',
    references: [
      { label: 'Windows Admin Center', url: 'https://learn.microsoft.com/en-us/windows-server/manage/windows-admin-center/overview' },
    ],
  },
  {
    id: 'gen1-gen2',
    category: 'migration',
    question: 'Are Generation 1 and Generation 2 VMs supported during migration?',
    answer:
      'Hyper-V supports both. WAC vMode can convert eligible Gen1 BIOS guests to Gen2 UEFI during migration when the guest OS supports it. For unsupported guests, plan Gen1 landings or in-place upgrades after migration.',
    references: [
      { label: 'Hyper-V Generation 2 virtual machine overview', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v' },
    ],
  },
  {
    id: 'avd',
    category: 'workloads',
    question: 'Can Azure Virtual Desktop run on Azure Local?',
    answer:
      'Yes. AVD on Azure Local is a documented workload pattern for VDI session hosts that need to run close to users, applications, or data.',
    references: [
      { label: 'AVD on Azure Local workload', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-workload-virtual-desktop' },
      { label: 'AVD on Azure Local overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-desktop/azure-local-overview' },
    ],
  },
  {
    id: 'aks',
    category: 'workloads',
    question: 'Can AKS run on Azure Local?',
    answer:
      'Yes. AKS on Azure Local is the documented hybrid Kubernetes platform. Use the AKS hybrid baseline architecture for cluster, networking, identity, observability, and policy decisions.',
    references: [
      { label: 'AKS on Azure Local architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-hybrid-azure-local' },
      { label: 'AKS hybrid baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-baseline' },
    ],
  },
  {
    id: 'aks-vs-aro',
    category: 'workloads',
    question: 'When should we recommend AKS on Azure Local versus Azure Red Hat OpenShift?',
    answer:
      'Choose AKS on Azure Local when the platform target is Azure-aligned Kubernetes hosted on Azure Local hardware. Choose ARO when the customer has an existing Red Hat OpenShift footprint, OperatorHub dependencies, or wants jointly-engineered Red Hat plus Microsoft support in Azure regions.',
    references: [
      { label: 'AKS hybrid baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-baseline' },
    ],
  },
  {
    id: 'foundry-local',
    category: 'workloads',
    question: 'Does Azure Local support local AI inference and Foundry Local?',
    answer:
      'Yes. Azure Local supports GPU-enabled SKUs and Foundry Local capabilities for AI inference at the edge. Validate GPU SKUs, drivers, and supported model lifecycles for the target Azure Local version.',
    references: [
      { label: 'Azure Local Well-Architected service guide', url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local' },
    ],
  },
  {
    id: 'commercial',
    category: 'commercial',
    question: 'How is Azure Local commercially different from Hyper-V on Windows Server?',
    answer:
      'Azure Local is a consumption-based subscription billed through Azure, on top of validated hardware. Hyper-V on Windows Server uses traditional Windows Server licensing on supported hardware. Model both options in the Azure pricing calculator and against existing Software Assurance.',
    references: [
      { label: 'Azure pricing calculator', url: 'https://azure.microsoft.com/pricing/calculator/' },
    ],
  },
  {
    id: 'support',
    category: 'support',
    question: 'What support model is available for Azure Local engagements?',
    answer:
      'Microsoft Unified delivers proactive services, workshops, activation, migration, and Day-2 operations. Engage your Microsoft account team to bring in a CSA or Global Delivery program lead for scoping and statement of work.',
    references: [
      { label: 'Microsoft Unified', url: 'https://www.microsoft.com/en-us/microsoft-unified' },
      { label: 'Services Hub', url: 'https://learn.microsoft.com/en-us/services-hub/unified/services/' },
      { label: 'WorkshopPLUS', url: 'https://learn.microsoft.com/en-us/services-hub/unified/services/workshopplus' },
    ],
  },
  {
    id: 'sovereign',
    category: 'security',
    question: 'How is sovereignty handled when continuous Azure connectivity is not allowed?',
    answer:
      'Use Azure Local Disconnected Operations (ALDO) for sovereign or air-gapped sites. Confirm which Arc, identity, monitoring, and update flows are supported in the disconnected mode and design a local operating model that does not assume Azure connectivity.',
    references: [
      { label: 'Azure Local Well-Architected service guide', url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local' },
    ],
  },
  {
    id: 'wac',
    category: 'operations',
    question: 'Is Windows Admin Center still relevant for Azure Local?',
    answer:
      'Yes. Windows Admin Center remains a useful local management surface for Hyper-V and Azure Local hosts, including migration via vMode. On Azure Local, Azure-hosted WAC and Arc-based experiences are the default.',
    references: [
      { label: 'Windows Admin Center', url: 'https://learn.microsoft.com/en-us/windows-server/manage/windows-admin-center/overview' },
    ],
  },
]
