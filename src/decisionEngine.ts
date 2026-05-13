export type PlatformId = 'hyperV' | 'azureLocal' | 'azureCloud'

export type Platform = {
  id: PlatformId
  name: string
  tagline: string
  summary: string
  bestFit: string
  watchOut: string
}

export type AzureLocalDeploymentId =
  | 'connectedHCI'
  | 'disconnected'
  | 'disaggregatedSAN'
  | 'multiRack'

export type AzureLocalDeployment = {
  id: AzureLocalDeploymentId
  name: string
  summary: string
  whenToChoose: string
  considerations: string[]
}

export type OverlayId =
  | 'aiGpu'
  | 'aksOnAzureLocal'
  | 'avdOnAzureLocal'
  | 'sovereignDisconnected'
  | 'migrationDr'

export type Overlay = {
  id: OverlayId
  name: string
  summary: string
  considerations: string[]
}

export type DocLink = {
  id: string
  label: string
  url: string
  description: string
}

export type GuidanceBlock = {
  id: string
  title: string
  description: string
  links: DocLink[]
}

export type PlatformImpact = Partial<Record<PlatformId, number>>
export type AzureLocalImpact = Partial<Record<AzureLocalDeploymentId, number>>

export type Choice = {
  id: string
  label: string
  description: string
  impact?: PlatformImpact
  azureLocalImpact?: AzureLocalImpact
  overlays?: OverlayId[]
  rationale?: Partial<Record<PlatformId, string>>
  caution?: Partial<Record<PlatformId, string>>
  forcesOnPrem?: boolean
}

export type Question = {
  id: string
  category: string
  prompt: string
  helper?: string
  choices: Choice[]
}

export type Stage = {
  id: string
  title: string
  shortTitle: string
  description: string
  questions: Question[]
  conditional?: 'azureLocalLeader'
}

export type AnswerSet = Record<string, string>

export type WizardState = {
  answers: AnswerSet
}

export type PlatformScore = {
  platform: Platform
  total: number
  rationales: string[]
  cautions: string[]
}

export type AzureLocalScore = {
  deployment: AzureLocalDeployment
  total: number
}

export type EvaluationResult = {
  primary: Platform
  primaryScore: PlatformScore
  scores: PlatformScore[]
  confidence: 'High' | 'Medium' | 'Low'
  azureLocalRecommended?: AzureLocalDeployment
  azureLocalScores: AzureLocalScore[]
  overlays: Overlay[]
  documentationLinks: DocLink[]
  considerations: string[]
  nextSteps: string[]
  microsoftGuidance: GuidanceBlock[]
  answeredQuestions: Array<{ stage: string; question: string; choice: string }>
  answeredCount: number
  totalQuestionCount: number
  showAzureLocalDrillDown: boolean
}

export const platforms: Platform[] = [
  {
    id: 'hyperV',
    name: 'Windows Server / Hyper-V',
    tagline: 'Familiar Windows virtualization',
    summary:
      'Run virtual machines on Windows Server with Hyper-V, Failover Clustering, and existing Windows operations and tooling.',
    bestFit:
      'VM consolidation and migration when teams want low platform change and prefer existing Windows Server skills, licensing, and operating model.',
    watchOut:
      'Provides less Azure-native control plane integration than Azure Local and is not designed as a managed application platform.',
  },
  {
    id: 'azureLocal',
    name: 'Azure Local',
    tagline: 'Hybrid Azure infrastructure on-premises',
    summary:
      'Azure-aligned infrastructure that runs on validated hardware on-premises with Arc-enabled operations, hybrid services, and consistent Azure management.',
    bestFit:
      'Hybrid modernization for VMs, AKS, AVD, and AI workloads that need to remain on-premises while adopting Azure governance, Arc, and cloud-consistent services.',
    watchOut:
      'Requires validated hardware, Azure connectivity planning, identity, networking, and ongoing lifecycle management aligned to Microsoft guidance.',
  },
  {
    id: 'azureCloud',
    name: 'Azure-native (cloud-first)',
    tagline: 'Run in Azure regions',
    summary:
      'Place workloads in Azure regions using native services such as Azure VMs, AKS, App Service, AVD, or managed AI services.',
    bestFit:
      'Greenfield or container-first workloads that can run in Azure regions with no strict on-premises placement and benefit from elasticity and managed services.',
    watchOut:
      'Not appropriate when workloads must remain on-premises, in disconnected environments, or under sovereignty constraints.',
  },
]

export const azureLocalDeployments: AzureLocalDeployment[] = [
  {
    id: 'connectedHCI',
    name: 'Connected hyperconverged Azure Local',
    summary:
      'Validated hyperconverged Azure Local deployment with continuous Azure connectivity, Arc-enabled operations, and standard Azure services.',
    whenToChoose:
      'Recommended default for most modern deployments where the site has reliable connectivity and standard Azure governance applies.',
    considerations: [
      'Use validated hardware from the Azure Local catalog and follow the Azure Local baseline architecture.',
      'Plan identity, networking, monitoring, Arc registration, and update operations up front.',
      'Use Odin tooling for design, sizing, and reference architecture guidance.',
    ],
  },
  {
    id: 'disconnected',
    name: 'Disconnected operations for Azure Local',
    summary:
      'Azure Local sized for sites with limited, intermittent, or fully disconnected connectivity to Azure.',
    whenToChoose:
      'Recommended when sites have constrained, intermittent, or air-gapped connectivity and still need a hybrid Azure-aligned platform.',
    considerations: [
      'Validate which Azure Local capabilities, services, and Arc features are supported in disconnected operating modes.',
      'Plan local lifecycle, updates, monitoring, identity, and support workflows that do not assume continuous Azure connectivity.',
      'Document data movement, security, and audit requirements for disconnected sites.',
    ],
  },
  {
    id: 'disaggregatedSAN',
    name: 'Disaggregated SAN for Azure Local',
    summary:
      'Azure Local pattern that uses an external SAN instead of hyperconverged storage, suited for organizations with existing SAN investments.',
    whenToChoose:
      'Recommended when an existing SAN strategy must be preserved or scale, performance, and operational requirements favor disaggregated storage.',
    considerations: [
      'Validate supported storage vendors, fabrics, and configurations against current Azure Local guidance.',
      'Align storage operations, monitoring, and DR with both Azure Local and existing SAN practices.',
      'Use Odin reference architectures and sizing guidance to validate the disaggregated design.',
    ],
  },
  {
    id: 'multiRack',
    name: 'Multi-rack Azure Local',
    summary:
      'Azure Local design that spans multiple racks or sites for scale, fault domains, and broader workload placement.',
    whenToChoose:
      'Recommended when capacity, fault isolation, or site distribution requires more than a single rack of Azure Local infrastructure.',
    considerations: [
      'Plan rack-level fault domains, network fabric, and management boundaries early.',
      'Use Odin reference architectures and sizing tools to validate multi-rack scale and growth.',
      'Define DR, monitoring, and operational ownership across racks and sites.',
    ],
  },
]

export const overlays: Overlay[] = [
  {
    id: 'aiGpu',
    name: 'AI / local inference / GPU workloads',
    summary:
      'Workloads that need GPU-backed local inference, AI services, or accelerated compute close to data and users.',
    considerations: [
      'Validate GPU SKUs, drivers, and supported workload patterns on the chosen platform.',
      'Plan capacity, cooling, power, and lifecycle for GPU-equipped nodes.',
      'Define data movement, model lifecycle, and security boundaries for AI workloads.',
    ],
  },
  {
    id: 'aksOnAzureLocal',
    name: 'AKS on Azure Local',
    summary:
      'Containerized workloads that need a managed Kubernetes platform deployed on Azure Local infrastructure.',
    considerations: [
      'Follow the AKS hybrid baseline architecture for cluster, networking, and identity design.',
      'Plan cluster lifecycle, registry, ingress, observability, and policy alongside Azure Local operations.',
      'Decide which workloads run on AKS on Azure Local versus AKS in Azure regions.',
    ],
  },
  {
    id: 'avdOnAzureLocal',
    name: 'Azure Virtual Desktop on Azure Local',
    summary:
      'Virtual desktop workloads that benefit from running close to data, applications, or users while using AVD management.',
    considerations: [
      'Use the AVD on Azure Local guidance for session hosts, networking, and identity design.',
      'Plan profile storage, image management, and update workflows for local session hosts.',
      'Validate licensing, entitlement, and supported scenarios for AVD on Azure Local.',
    ],
  },
  {
    id: 'sovereignDisconnected',
    name: 'Sovereign or disconnected scenarios',
    summary:
      'Environments with strict data residency, sovereignty, or disconnected operating requirements.',
    considerations: [
      'Map data residency, classification, and audit requirements to platform capabilities.',
      'Define operating models that do not depend on continuous Azure connectivity where required.',
      'Coordinate with security, compliance, and legal stakeholders before finalizing the architecture.',
    ],
  },
  {
    id: 'migrationDr',
    name: 'Migration and disaster recovery',
    summary:
      'Programs that prioritize migration from existing virtualization platforms or that require defined DR outcomes.',
    considerations: [
      'Inventory source workloads, dependencies, and migration tooling before defining waves.',
      'Define RPO and RTO targets per workload tier and validate the DR design against them.',
      'Use Microsoft and partner migration tooling and document fallback plans for each wave.',
    ],
  },
]

const docs = {
  azureLocalBaseline: {
    id: 'azureLocalBaseline',
    label: 'Azure Local baseline reference architecture',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline',
    description: 'Microsoft Learn baseline architecture for Azure Local deployments.',
  },
  azureLocalWAF: {
    id: 'azureLocalWAF',
    label: 'Well-Architected service guide for Azure Local',
    url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local',
    description: 'Well-Architected Framework guidance for Azure Local workloads.',
  },
  odinHome: {
    id: 'odinHome',
    label: 'Odin for Azure Local',
    url: 'https://azure.github.io/odinforazurelocal/',
    description: 'Public Microsoft tooling for designing and operating Azure Local.',
  },
  odinRefArch: {
    id: 'odinRefArch',
    label: 'Odin reference architectures',
    url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/',
    description: 'Reference architectures for common Azure Local deployment patterns.',
  },
  odinSizer: {
    id: 'odinSizer',
    label: 'Odin sizer for Azure Local',
    url: 'https://azure.github.io/odinforazurelocal/sizer/',
    description: 'Sizing tool for Azure Local node and cluster designs.',
  },
  hyperVOverview: {
    id: 'hyperVOverview',
    label: 'Hyper-V virtualization overview',
    url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/overview',
    description: 'Overview of Hyper-V virtualization in Windows Server.',
  },
  hyperVDocs: {
    id: 'hyperVDocs',
    label: 'Windows Server Hyper-V documentation',
    url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/',
    description: 'Hyper-V documentation hub on Microsoft Learn.',
  },
  aksHybridBaseline: {
    id: 'aksHybridBaseline',
    label: 'AKS hybrid baseline architecture',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-baseline',
    description: 'Baseline reference architecture for AKS in hybrid scenarios.',
  },
  aksOnAzureLocal: {
    id: 'aksOnAzureLocal',
    label: 'AKS on Azure Local architecture',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-hybrid-azure-local',
    description: 'Reference architecture for AKS deployed on Azure Local.',
  },
  avdAzureLocal: {
    id: 'avdAzureLocal',
    label: 'AVD on Azure Local workload architecture',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-workload-virtual-desktop',
    description: 'Workload architecture for Azure Virtual Desktop on Azure Local.',
  },
  avdAzureLocalOverview: {
    id: 'avdAzureLocalOverview',
    label: 'Azure Virtual Desktop on Azure Local overview',
    url: 'https://learn.microsoft.com/en-us/azure/virtual-desktop/azure-local-overview',
    description: 'Overview of running AVD session hosts on Azure Local.',
  },
  unified: {
    id: 'unified',
    label: 'Microsoft Unified',
    url: 'https://www.microsoft.com/en-us/microsoft-unified',
    description: 'Microsoft Unified support and services portfolio.',
  },
  servicesHub: {
    id: 'servicesHub',
    label: 'Microsoft Services Hub services catalog',
    url: 'https://learn.microsoft.com/en-us/services-hub/unified/services/',
    description: 'Catalog of Microsoft Unified services.',
  },
  workshopPlus: {
    id: 'workshopPlus',
    label: 'Microsoft WorkshopPLUS engagements',
    url: 'https://learn.microsoft.com/en-us/services-hub/unified/services/workshopplus',
    description: 'WorkshopPLUS engagements available through Microsoft Unified.',
  },
} as const

type DocId = keyof typeof docs

export const stages: Stage[] = [
  {
    id: 'workload-profile',
    title: 'Workload profile',
    shortTitle: 'Workload profile',
    description:
      'Tell us what you primarily need to run. These answers anchor the deterministic recommendation.',
    questions: [
      {
        id: 'primary-workload',
        category: 'Workload shape',
        prompt: 'What is the dominant workload you need to place first?',
        helper:
          'Choose the workload pattern that best represents the first wave you want this platform to serve.',
        choices: [
          {
            id: 'vms',
            label: 'Virtual machines (Windows and Linux)',
            description:
              'A VM-led estate where the priority is consolidating, migrating, or replacing existing virtualization.',
            impact: { hyperV: 5, azureLocal: 3, azureCloud: -1 },
            rationale: {
              hyperV:
                'A VM-led estate is a strong fit for Windows Server / Hyper-V virtualization.',
              azureLocal:
                'Azure Local also supports VM workloads with hybrid Azure operations.',
            },
          },
          {
            id: 'containers',
            label: 'Containers and Kubernetes',
            description:
              'Containerized applications that need a Kubernetes platform with consistent deployment patterns.',
            impact: { hyperV: -2, azureLocal: 3, azureCloud: 5 },
            overlays: ['aksOnAzureLocal'],
            rationale: {
              azureCloud:
                'Container-first workloads fit Azure-native services in Azure regions.',
              azureLocal:
                'AKS on Azure Local provides a hybrid Kubernetes platform when workloads must stay local.',
            },
          },
          {
            id: 'vdi',
            label: 'Virtual desktops or session hosts',
            description:
              'Virtual desktop or session host workloads that need to run close to users, applications, or data.',
            impact: { hyperV: 1, azureLocal: 5, azureCloud: 2 },
            overlays: ['avdOnAzureLocal'],
            rationale: {
              azureLocal:
                'Azure Virtual Desktop on Azure Local fits VDI workloads that benefit from local placement.',
            },
          },
          {
            id: 'ai',
            label: 'AI, local inference, or GPU workloads',
            description:
              'Workloads that need GPU acceleration, local inference, or AI services close to data.',
            impact: { hyperV: 1, azureLocal: 5, azureCloud: 3 },
            overlays: ['aiGpu'],
            rationale: {
              azureLocal:
                'Azure Local supports GPU and local inference patterns for AI workloads on-premises.',
            },
          },
          {
            id: 'mixed',
            label: 'Mixed VMs and modern apps',
            description:
              'A mixed estate of VMs and modern applications that need a single hybrid platform.',
            impact: { hyperV: 2, azureLocal: 5, azureCloud: 1 },
            rationale: {
              azureLocal:
                'A mixed VM and modernization estate fits Azure Local as a hybrid platform.',
            },
          },
        ],
      },
      {
        id: 'os-profile',
        category: 'Operating system mix',
        prompt: 'What is the operating system mix?',
        choices: [
          {
            id: 'windows-heavy',
            label: 'Windows-heavy',
            description: 'Most workloads depend on Windows Server, Active Directory, or Windows tooling.',
            impact: { hyperV: 3, azureLocal: 3, azureCloud: 0 },
            rationale: {
              hyperV: 'A Windows-heavy estate aligns with Windows Server / Hyper-V.',
              azureLocal: 'Windows-heavy workloads also fit Azure Local with hybrid Azure operations.',
            },
          },
          {
            id: 'linux-heavy',
            label: 'Linux-heavy',
            description: 'Most workloads run Linux and modern open source stacks.',
            impact: { hyperV: 0, azureLocal: 1, azureCloud: 3 },
          },
          {
            id: 'balanced',
            label: 'Balanced mix',
            description: 'A meaningful mix of Windows and Linux workloads.',
            impact: { hyperV: 1, azureLocal: 3, azureCloud: 1 },
          },
        ],
      },
      {
        id: 'footprint',
        category: 'Footprint',
        prompt: 'What is the expected footprint?',
        choices: [
          {
            id: 'branch',
            label: 'Small site or branch',
            description: 'Single small footprint for a branch, store, or edge location.',
            impact: { hyperV: 3, azureLocal: 2, azureCloud: 1 },
          },
          {
            id: 'single-rack',
            label: 'Single primary rack',
            description: 'A single primary rack at one site.',
            impact: { hyperV: 2, azureLocal: 4, azureCloud: 0 },
            azureLocalImpact: { connectedHCI: 3 },
          },
          {
            id: 'multi-rack',
            label: 'Multi-rack at one site',
            description: 'Multiple racks within a single site for scale or fault isolation.',
            impact: { hyperV: 1, azureLocal: 5, azureCloud: 0 },
            azureLocalImpact: { multiRack: 6 },
          },
          {
            id: 'multi-site',
            label: 'Many sites or edge locations',
            description: 'A distributed footprint across many sites or edge locations.',
            impact: { hyperV: 1, azureLocal: 5, azureCloud: 0 },
            azureLocalImpact: { multiRack: 4 },
          },
        ],
      },
    ],
  },
  {
    id: 'placement-sovereignty',
    title: 'Placement and sovereignty',
    shortTitle: 'Placement',
    description:
      'Capture where workloads must run and any sovereignty or connectivity constraints.',
    questions: [
      {
        id: 'placement',
        category: 'Placement',
        prompt: 'Where do workloads need to run?',
        choices: [
          {
            id: 'on-prem',
            label: 'Must remain on-premises or at the edge',
            description:
              'Latency, residency, sovereignty, or facility constraints require local placement.',
            impact: { hyperV: 5, azureLocal: 6, azureCloud: -8 },
            forcesOnPrem: true,
            rationale: {
              azureLocal: 'On-premises placement with Azure operations is a core Azure Local scenario.',
              hyperV: 'On-premises placement also fits Windows Server / Hyper-V virtualization.',
            },
            caution: {
              azureCloud:
                'Azure-native cloud placement is not appropriate when workloads must stay on-premises.',
            },
          },
          {
            id: 'azure-ok',
            label: 'Azure region placement is acceptable',
            description: 'Workloads can run in Azure regions with appropriate networking and controls.',
            impact: { hyperV: -3, azureLocal: 1, azureCloud: 6 },
            rationale: {
              azureCloud: 'Acceptable Azure placement supports Azure-native designs.',
            },
          },
          {
            id: 'hybrid',
            label: 'Hybrid placement is flexible',
            description: 'Some workloads stay local while others can move to Azure over time.',
            impact: { hyperV: 1, azureLocal: 5, azureCloud: 2 },
            rationale: {
              azureLocal: 'Hybrid placement strongly favors Azure Local as a consistent hybrid platform.',
            },
          },
        ],
      },
      {
        id: 'connectivity',
        category: 'Connectivity',
        prompt: 'What is the realistic connectivity to Azure?',
        choices: [
          {
            id: 'always-connected',
            label: 'Always connected',
            description: 'Stable outbound connectivity to Azure is available across sites.',
            impact: { hyperV: 1, azureLocal: 5, azureCloud: 3 },
            azureLocalImpact: { connectedHCI: 5 },
            rationale: {
              azureLocal:
                'Reliable connectivity supports Azure Local Arc operations, monitoring, and lifecycle.',
            },
          },
          {
            id: 'intermittent',
            label: 'Intermittent or constrained',
            description: 'Sites may have limited bandwidth or periodic connectivity.',
            impact: { hyperV: 3, azureLocal: 3, azureCloud: -2 },
            azureLocalImpact: { disconnected: 4 },
          },
          {
            id: 'disconnected',
            label: 'Fully disconnected or air-gapped',
            description: 'Workloads must run without continuous Azure connectivity.',
            impact: { hyperV: 4, azureLocal: 2, azureCloud: -8 },
            azureLocalImpact: { disconnected: 7 },
            overlays: ['sovereignDisconnected'],
            forcesOnPrem: true,
            caution: {
              azureCloud: 'Azure-native cloud placement is not viable for fully disconnected sites.',
            },
          },
        ],
      },
      {
        id: 'sovereignty',
        category: 'Sovereignty',
        prompt: 'Are there sovereignty or regulatory constraints?',
        choices: [
          {
            id: 'none',
            label: 'No specific sovereignty constraints',
            description: 'Standard data protection requirements apply.',
            impact: { hyperV: 1, azureLocal: 1, azureCloud: 2 },
          },
          {
            id: 'residency',
            label: 'Data residency required',
            description: 'Data must remain in a specific country, region, or facility.',
            impact: { hyperV: 2, azureLocal: 4, azureCloud: 0 },
            rationale: {
              azureLocal:
                'Local placement of Azure-aligned infrastructure helps satisfy residency requirements.',
            },
          },
          {
            id: 'sovereign',
            label: 'Sovereign, classified, or air-gapped',
            description:
              'Strict sovereignty or classification requirements drive on-premises or disconnected operations.',
            impact: { hyperV: 3, azureLocal: 5, azureCloud: -6 },
            overlays: ['sovereignDisconnected'],
            forcesOnPrem: true,
          },
        ],
      },
    ],
  },
  {
    id: 'modernization',
    title: 'Modernization signals',
    shortTitle: 'Modernization',
    description:
      'Capture demand for AKS, AVD, and AI workloads. These trigger workload overlays in the result.',
    questions: [
      {
        id: 'aks',
        category: 'Kubernetes',
        prompt: 'Do you need AKS or Kubernetes locally?',
        choices: [
          {
            id: 'strategic',
            label: 'Strategic, broad container platform',
            description:
              'Kubernetes is a strategic platform for many application teams across the organization.',
            impact: { hyperV: -2, azureLocal: 5, azureCloud: 3 },
            overlays: ['aksOnAzureLocal'],
            rationale: {
              azureLocal:
                'Strategic AKS demand strongly favors Azure Local with the AKS on Azure Local pattern.',
            },
          },
          {
            id: 'selected',
            label: 'Selected workloads',
            description: 'A subset of workloads will use Kubernetes, but it is not a universal platform.',
            impact: { hyperV: 0, azureLocal: 3, azureCloud: 2 },
            overlays: ['aksOnAzureLocal'],
          },
          {
            id: 'no',
            label: 'No Kubernetes requirement',
            description: 'There is no near-term need for Kubernetes locally.',
            impact: { hyperV: 2, azureLocal: 1, azureCloud: 0 },
          },
        ],
      },
      {
        id: 'avd',
        category: 'Virtual desktops',
        prompt: 'Do you need Azure Virtual Desktop locally?',
        choices: [
          {
            id: 'strategic',
            label: 'Strategic local AVD',
            description:
              'Azure Virtual Desktop must run on-premises for latency, data, or sovereignty reasons.',
            impact: { hyperV: 0, azureLocal: 5, azureCloud: 1 },
            overlays: ['avdOnAzureLocal'],
            rationale: {
              azureLocal:
                'Strategic local AVD strongly favors Azure Virtual Desktop on Azure Local.',
            },
          },
          {
            id: 'evaluating',
            label: 'Evaluating local AVD',
            description: 'AVD on Azure Local is being evaluated for some scenarios.',
            impact: { hyperV: 0, azureLocal: 3, azureCloud: 1 },
            overlays: ['avdOnAzureLocal'],
          },
          {
            id: 'no',
            label: 'No AVD requirement',
            description: 'There is no near-term need for AVD locally.',
            impact: { hyperV: 1, azureLocal: 1, azureCloud: 0 },
          },
        ],
      },
      {
        id: 'ai-gpu',
        category: 'AI and GPU',
        prompt: 'Do you need AI, local inference, or GPU workloads?',
        choices: [
          {
            id: 'heavy',
            label: 'Heavy local AI or GPU',
            description: 'Multiple GPU-backed workloads or local inference are strategic priorities.',
            impact: { hyperV: 0, azureLocal: 6, azureCloud: 2 },
            overlays: ['aiGpu'],
            rationale: {
              azureLocal:
                'Strategic local AI and GPU workloads strongly favor Azure Local as the hybrid platform.',
            },
          },
          {
            id: 'some',
            label: 'Some local inference',
            description: 'Selected workloads need GPU or inference capacity locally.',
            impact: { hyperV: 1, azureLocal: 4, azureCloud: 1 },
            overlays: ['aiGpu'],
          },
          {
            id: 'no',
            label: 'No local AI or GPU requirement',
            description: 'There is no near-term need for local AI or GPU workloads.',
            impact: { hyperV: 1, azureLocal: 0, azureCloud: 0 },
          },
        ],
      },
    ],
  },
  {
    id: 'migration-operations',
    title: 'Migration and operations',
    shortTitle: 'Migration & ops',
    description:
      'Tell us about the current platform, migration and DR posture, and preferred operating model.',
    questions: [
      {
        id: 'current-platform',
        category: 'Current platform',
        prompt: 'What is the current virtualization platform?',
        choices: [
          {
            id: 'vmware',
            label: 'VMware (planning to migrate)',
            description: 'VMware is the current platform and migration is in scope.',
            impact: { hyperV: 3, azureLocal: 5, azureCloud: 1 },
            overlays: ['migrationDr'],
            rationale: {
              azureLocal:
                'Migrating from VMware aligns well with Azure Local for hybrid Azure-aligned operations.',
              hyperV:
                'Migrating from VMware also aligns with Windows Server / Hyper-V for traditional VM operations.',
            },
          },
          {
            id: 'hyperv',
            label: 'Windows Server / Hyper-V today',
            description: 'Hyper-V is already the current platform.',
            impact: { hyperV: 5, azureLocal: 3, azureCloud: 0 },
            rationale: {
              hyperV:
                'Existing Hyper-V experience is a strong signal for staying with Windows Server / Hyper-V.',
            },
          },
          {
            id: 'mixed',
            label: 'Mixed current platforms',
            description: 'A mix of platforms is in use today.',
            impact: { hyperV: 2, azureLocal: 3, azureCloud: 1 },
          },
          {
            id: 'greenfield',
            label: 'Greenfield or no current platform',
            description: 'There is no significant existing virtualization platform to migrate.',
            impact: { hyperV: 0, azureLocal: 2, azureCloud: 4 },
          },
        ],
      },
      {
        id: 'migration-dr',
        category: 'Migration and DR',
        prompt: 'How important are migration and disaster recovery in this engagement?',
        choices: [
          {
            id: 'dr-first',
            label: 'DR is the primary driver',
            description: 'Defined RPO and RTO targets are the main reason to choose a platform.',
            impact: { hyperV: 2, azureLocal: 5, azureCloud: 2 },
            overlays: ['migrationDr'],
          },
          {
            id: 'migration-first',
            label: 'Migration is the primary driver',
            description: 'Migrating an existing estate is the main reason to choose a platform.',
            impact: { hyperV: 3, azureLocal: 5, azureCloud: 1 },
            overlays: ['migrationDr'],
          },
          {
            id: 'both',
            label: 'Migration and DR are both important',
            description: 'Both migration and DR outcomes must be addressed in this program.',
            impact: { hyperV: 2, azureLocal: 5, azureCloud: 1 },
            overlays: ['migrationDr'],
          },
          {
            id: 'neither',
            label: 'Neither is a primary driver',
            description: 'Migration and DR are not the primary reasons for this decision.',
            impact: { hyperV: 1, azureLocal: 1, azureCloud: 1 },
          },
        ],
      },
      {
        id: 'operating-model',
        category: 'Operating model',
        prompt: 'Which operating model do you prefer?',
        choices: [
          {
            id: 'azure-native',
            label: 'Azure-native with Arc',
            description:
              'Azure portal, Arc, policy, monitoring, and infrastructure as code are the strategic model.',
            impact: { hyperV: -1, azureLocal: 6, azureCloud: 4 },
            rationale: {
              azureLocal:
                'An Azure-native, Arc-led operating model strongly favors Azure Local on-premises.',
              azureCloud:
                'An Azure-native operating model also aligns with Azure-native cloud designs.',
            },
          },
          {
            id: 'classic-windows',
            label: 'Classic Windows administration',
            description:
              'Existing Windows Server, Hyper-V, and PowerShell-led tooling remain the primary operating model.',
            impact: { hyperV: 5, azureLocal: 2, azureCloud: -2 },
            rationale: {
              hyperV:
                'Classic Windows administration favors Windows Server / Hyper-V as the primary platform.',
            },
          },
          {
            id: 'mixed',
            label: 'Mixed operating model',
            description:
              'A mix of Azure-native and classic Windows operations is acceptable across teams.',
            impact: { hyperV: 2, azureLocal: 4, azureCloud: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'azure-local-design',
    title: 'Azure Local deployment design',
    shortTitle: 'Azure Local design',
    description:
      'Refine the Azure Local recommendation with storage, connectivity, and scale signals. Shown when Azure Local is the leading recommendation.',
    conditional: 'azureLocalLeader',
    questions: [
      {
        id: 'al-storage',
        category: 'Storage architecture',
        prompt: 'What storage architecture fits your operations?',
        choices: [
          {
            id: 'hci-allflash',
            label: 'Hyperconverged all-flash',
            description: 'Modern all-flash hyperconverged design with software-defined storage.',
            azureLocalImpact: { connectedHCI: 6 },
          },
          {
            id: 'hci-hybrid',
            label: 'Hyperconverged hybrid',
            description: 'Hyperconverged design with mixed flash and capacity tiers.',
            azureLocalImpact: { connectedHCI: 5 },
          },
          {
            id: 'external-san',
            label: 'External SAN preferred',
            description: 'An existing SAN strategy or storage standard must be preserved.',
            azureLocalImpact: { disaggregatedSAN: 7 },
          },
          {
            id: 'unsure',
            label: 'Unsure',
            description: 'Storage architecture has not been decided yet.',
            azureLocalImpact: { connectedHCI: 3 },
          },
        ],
      },
      {
        id: 'al-connectivity',
        category: 'Site connectivity',
        prompt: 'How will the site connect to Azure?',
        choices: [
          {
            id: 'always',
            label: 'Always connected',
            description: 'Continuous connectivity to Azure for management and operations.',
            azureLocalImpact: { connectedHCI: 5 },
          },
          {
            id: 'periodic',
            label: 'Periodic or constrained',
            description: 'Connectivity is available but limited or scheduled.',
            azureLocalImpact: { disconnected: 4 },
          },
          {
            id: 'disconnected',
            label: 'Fully disconnected',
            description: 'The site cannot maintain continuous Azure connectivity.',
            azureLocalImpact: { disconnected: 7 },
            overlays: ['sovereignDisconnected'],
          },
        ],
      },
      {
        id: 'al-scale',
        category: 'Scale',
        prompt: 'What is the scale ambition?',
        choices: [
          {
            id: 'single-rack',
            label: 'Single rack',
            description: 'Single rack at one site for the foreseeable horizon.',
            azureLocalImpact: { connectedHCI: 4 },
          },
          {
            id: 'multi-rack-site',
            label: 'Multi-rack at one site',
            description: 'Multiple racks at one site for scale or fault isolation.',
            azureLocalImpact: { multiRack: 6 },
          },
          {
            id: 'multi-site',
            label: 'Multi-site or many racks',
            description: 'Multiple racks across multiple sites or edge locations.',
            azureLocalImpact: { multiRack: 7 },
          },
        ],
      },
    ],
  },
]

export const totalQuestionCount = stages
  .filter((stage) => !stage.conditional)
  .reduce((count, stage) => count + stage.questions.length, 0)

const getStageQuestionsFlat = (state: WizardState) => {
  const includeAzureLocal = isAzureLocalLeader(state)
  return stages
    .filter((stage) => !stage.conditional || (stage.conditional === 'azureLocalLeader' && includeAzureLocal))
    .flatMap((stage) =>
      stage.questions.map((question) => ({ stage: stage.title, question })),
    )
}

const getChoice = (question: Question, answer?: string) =>
  question.choices.find((choice) => choice.id === answer)

const computePlatformScores = (state: WizardState) => {
  const totals: Record<PlatformId, number> = { hyperV: 0, azureLocal: 0, azureCloud: 0 }
  const rationales: Record<PlatformId, string[]> = { hyperV: [], azureLocal: [], azureCloud: [] }
  const cautions: Record<PlatformId, string[]> = { hyperV: [], azureLocal: [], azureCloud: [] }
  let onPremForced = false

  for (const stage of stages) {
    if (stage.conditional === 'azureLocalLeader') {
      continue
    }
    for (const question of stage.questions) {
      const choice = getChoice(question, state.answers[question.id])
      if (!choice) continue
      if (choice.forcesOnPrem) {
        onPremForced = true
      }
      for (const platform of platforms) {
        const impact = choice.impact?.[platform.id] ?? 0
        totals[platform.id] += impact
        const rationale = choice.rationale?.[platform.id]
        const caution = choice.caution?.[platform.id]
        if (impact > 0 && rationale) {
          rationales[platform.id].push(rationale)
        }
        if (impact < 0 && caution) {
          cautions[platform.id].push(caution)
        }
      }
    }
  }

  return { totals, rationales, cautions, onPremForced }
}

const isAzureLocalLeader = (state: WizardState) => {
  const { totals } = computePlatformScores(state)
  const sorted = (Object.entries(totals) as Array<[PlatformId, number]>).sort(
    (left, right) => right[1] - left[1],
  )
  if (sorted[0][1] === 0) return false
  return sorted[0][0] === 'azureLocal'
}

const computeAzureLocalScores = (state: WizardState): AzureLocalScore[] => {
  const totals: Record<AzureLocalDeploymentId, number> = {
    connectedHCI: 0,
    disconnected: 0,
    disaggregatedSAN: 0,
    multiRack: 0,
  }
  for (const stage of stages) {
    for (const question of stage.questions) {
      const choice = getChoice(question, state.answers[question.id])
      if (!choice?.azureLocalImpact) continue
      for (const deployment of azureLocalDeployments) {
        totals[deployment.id] += choice.azureLocalImpact[deployment.id] ?? 0
      }
    }
  }
  return azureLocalDeployments
    .map((deployment) => ({ deployment, total: totals[deployment.id] }))
    .sort((left, right) => right.total - left.total)
}

const detectOverlays = (state: WizardState): Overlay[] => {
  const ids = new Set<OverlayId>()
  for (const stage of stages) {
    for (const question of stage.questions) {
      const choice = getChoice(question, state.answers[question.id])
      choice?.overlays?.forEach((overlayId) => ids.add(overlayId))
    }
  }
  return overlays.filter((overlay) => ids.has(overlay.id))
}

const buildDocumentationLinks = (
  primary: PlatformId,
  activeOverlays: Overlay[],
  azureLocalDeployment?: AzureLocalDeployment,
): DocLink[] => {
  const linkIds = new Set<DocId>()

  if (primary === 'azureLocal') {
    linkIds.add('azureLocalBaseline')
    linkIds.add('azureLocalWAF')
    linkIds.add('odinHome')
    linkIds.add('odinRefArch')
    linkIds.add('odinSizer')
  }

  if (primary === 'hyperV') {
    linkIds.add('hyperVOverview')
    linkIds.add('hyperVDocs')
  }

  if (primary === 'azureCloud') {
    linkIds.add('azureLocalBaseline')
  }

  for (const overlay of activeOverlays) {
    if (overlay.id === 'aksOnAzureLocal') {
      linkIds.add('aksOnAzureLocal')
      linkIds.add('aksHybridBaseline')
    }
    if (overlay.id === 'avdOnAzureLocal') {
      linkIds.add('avdAzureLocal')
      linkIds.add('avdAzureLocalOverview')
    }
  }

  if (azureLocalDeployment) {
    linkIds.add('odinRefArch')
    linkIds.add('odinSizer')
  }

  return [...linkIds].map((id) => docs[id])
}

const buildArchitectureConsiderations = (
  primary: Platform,
  azureLocalDeployment?: AzureLocalDeployment,
  activeOverlays: Overlay[] = [],
): string[] => {
  const considerations: string[] = []

  if (primary.id === 'azureLocal') {
    considerations.push(
      'Use validated Azure Local hardware from the Microsoft catalog and follow the Azure Local baseline architecture.',
      'Plan identity, networking, monitoring, Arc registration, and update operations as part of the design.',
      'Use Odin tooling for design, sizing, and reference architecture validation.',
    )
  }
  if (primary.id === 'hyperV') {
    considerations.push(
      'Design Failover Clustering, storage, and networking using Microsoft Hyper-V documentation.',
      'Plan Windows Server lifecycle, patching, identity, and backup tooling.',
      'Define DR patterns such as Hyper-V Replica or partner replication where appropriate.',
    )
  }
  if (primary.id === 'azureCloud') {
    considerations.push(
      'Apply landing zone, networking, identity, and security baselines from the Cloud Adoption Framework.',
      'Choose between Azure VMs, AKS, App Service, AVD, and managed AI services per workload.',
      'Plan migration waves, dependencies, and operational ownership before workload moves.',
    )
  }

  if (azureLocalDeployment) {
    considerations.push(...azureLocalDeployment.considerations)
  }

  for (const overlay of activeOverlays) {
    considerations.push(...overlay.considerations)
  }

  return considerations
}

const buildNextSteps = (
  primary: Platform,
  azureLocalDeployment?: AzureLocalDeployment,
  activeOverlays: Overlay[] = [],
): string[] => {
  const steps: string[] = []

  if (primary.id === 'azureLocal') {
    steps.push(
      'Use Odin for Azure Local to validate the design and sizing for the recommended deployment type.',
      'Confirm Azure Local validated hardware availability with your preferred OEM.',
      'Plan Azure subscription, identity, networking, monitoring, and Arc onboarding for the target sites.',
    )
  }
  if (primary.id === 'hyperV') {
    steps.push(
      'Validate Windows Server licensing, hardware, and Failover Clustering design for the target workloads.',
      'Define Hyper-V operating procedures, backup, and DR plans aligned with Microsoft Hyper-V documentation.',
      'Plan a migration assessment for workloads moving to Hyper-V from other platforms.',
    )
  }
  if (primary.id === 'azureCloud') {
    steps.push(
      'Define Azure landing zones, identity, networking, and policy baselines before workload migration.',
      'Choose target Azure services per workload and validate licensing, performance, and security needs.',
      'Plan a migration assessment to define waves, dependencies, and DR posture in Azure.',
    )
  }

  if (azureLocalDeployment) {
    steps.push(
      `Use Odin reference architectures and the Odin sizer to validate the ${azureLocalDeployment.name.toLowerCase()} design.`,
    )
  }

  if (activeOverlays.some((overlay) => overlay.id === 'aksOnAzureLocal')) {
    steps.push('Plan the AKS on Azure Local design using the AKS hybrid baseline architecture.')
  }
  if (activeOverlays.some((overlay) => overlay.id === 'avdOnAzureLocal')) {
    steps.push('Plan the AVD on Azure Local workload architecture and validate licensing for session hosts.')
  }
  if (activeOverlays.some((overlay) => overlay.id === 'aiGpu')) {
    steps.push('Validate GPU SKUs, drivers, capacity, and operational lifecycle for AI and inference workloads.')
  }
  if (activeOverlays.some((overlay) => overlay.id === 'sovereignDisconnected')) {
    steps.push('Engage security, compliance, and legal stakeholders to validate sovereign or disconnected requirements.')
  }
  if (activeOverlays.some((overlay) => overlay.id === 'migrationDr')) {
    steps.push('Run a migration and DR assessment to define waves, RPO and RTO targets, and tooling.')
  }

  steps.push('Review the recommendation with Microsoft and your delivery partners as part of formal architecture review.')

  return steps
}

const buildMicrosoftGuidance = (
  primary: Platform,
  azureLocalDeployment?: AzureLocalDeployment,
): GuidanceBlock[] => {
  const blocks: GuidanceBlock[] = []

  if (primary.id === 'azureLocal') {
    blocks.push({
      id: 'azureLocal',
      title: 'Azure Local design and operations guidance',
      description:
        'Use Odin tooling alongside Microsoft Learn to design, size, and operate the Azure Local deployment.',
      links: [docs.odinHome, docs.odinRefArch, docs.odinSizer, docs.azureLocalBaseline, docs.azureLocalWAF],
    })
  }

  if (primary.id === 'hyperV') {
    blocks.push({
      id: 'hyperV',
      title: 'Windows Server / Hyper-V guidance',
      description: 'Plan Hyper-V design, operations, and DR using Microsoft Learn documentation.',
      links: [docs.hyperVDocs, docs.hyperVOverview],
    })
  }

  if (primary.id === 'azureCloud') {
    blocks.push({
      id: 'azureCloud',
      title: 'Azure-native design guidance',
      description:
        'Apply Cloud Adoption Framework and Well-Architected guidance for Azure-native designs.',
      links: [docs.azureLocalBaseline, docs.azureLocalWAF],
    })
  }

  if (azureLocalDeployment) {
    blocks.push({
      id: 'azureLocalDesign',
      title: `${azureLocalDeployment.name} design references`,
      description: 'Use Odin reference architectures and the sizer to validate the deployment design.',
      links: [docs.odinRefArch, docs.odinSizer],
    })
  }

  blocks.push({
    id: 'unifiedSupport',
    title: 'Microsoft Unified support and delivery services',
    description:
      'Engage Microsoft Unified for solution assessments, WorkshopPLUS engagements, and delivery services.',
    links: [docs.unified, docs.servicesHub, docs.workshopPlus],
  })

  return blocks
}

export const evaluate = (state: WizardState): EvaluationResult => {
  const { totals, rationales, cautions, onPremForced } = computePlatformScores(state)

  const platformScores: PlatformScore[] = platforms.map((platform) => ({
    platform,
    total: totals[platform.id],
    rationales: rationales[platform.id].slice(0, 5),
    cautions: cautions[platform.id].slice(0, 5),
  }))

  const sortedScores = [...platformScores].sort((left, right) => {
    if (right.total !== left.total) return right.total - left.total
    const order: PlatformId[] = ['azureLocal', 'hyperV', 'azureCloud']
    return order.indexOf(left.platform.id) - order.indexOf(right.platform.id)
  })

  const cloud = platformScores.find((score) => score.platform.id === 'azureCloud')!
  const azureLocal = platformScores.find((score) => score.platform.id === 'azureLocal')!
  const hyperV = platformScores.find((score) => score.platform.id === 'hyperV')!

  let primaryScore: PlatformScore
  const cloudAdvantage = cloud.total - Math.max(azureLocal.total, hyperV.total)
  if (!onPremForced && cloud.total > 0 && cloudAdvantage >= 5) {
    primaryScore = cloud
  } else if (azureLocal.total >= hyperV.total) {
    primaryScore = azureLocal
  } else {
    primaryScore = hyperV
  }

  const margin = primaryScore.total - sortedScores.filter((score) => score !== primaryScore)[0].total
  const confidence: EvaluationResult['confidence'] = margin >= 8 ? 'High' : margin >= 4 ? 'Medium' : 'Low'

  const azureLocalScores = computeAzureLocalScores(state)
  const showAzureLocalDrillDown = primaryScore.platform.id === 'azureLocal'
  const azureLocalRecommended = showAzureLocalDrillDown
    ? azureLocalScores.find((score) => score.total > 0)?.deployment ?? azureLocalDeployments[0]
    : undefined

  const activeOverlays = detectOverlays(state)
  const documentationLinks = buildDocumentationLinks(
    primaryScore.platform.id,
    activeOverlays,
    azureLocalRecommended,
  )

  const considerations = buildArchitectureConsiderations(
    primaryScore.platform,
    azureLocalRecommended,
    activeOverlays,
  )

  const nextSteps = buildNextSteps(primaryScore.platform, azureLocalRecommended, activeOverlays)
  const microsoftGuidance = buildMicrosoftGuidance(primaryScore.platform, azureLocalRecommended)

  const answeredFlat = getStageQuestionsFlat(state)
  const answeredQuestions = answeredFlat
    .map(({ stage, question }) => {
      const choice = getChoice(question, state.answers[question.id])
      return choice ? { stage, question: question.prompt, choice: choice.label } : null
    })
    .filter((entry): entry is { stage: string; question: string; choice: string } => Boolean(entry))

  return {
    primary: primaryScore.platform,
    primaryScore,
    scores: sortedScores,
    confidence,
    azureLocalRecommended,
    azureLocalScores,
    overlays: activeOverlays,
    documentationLinks,
    considerations,
    nextSteps,
    microsoftGuidance,
    answeredQuestions,
    answeredCount: answeredQuestions.length,
    totalQuestionCount: answeredFlat.length,
    showAzureLocalDrillDown,
  }
}

export const visibleStages = (state: WizardState) => {
  const includeAzureLocal = isAzureLocalLeader(state)
  return stages.filter(
    (stage) =>
      !stage.conditional || (stage.conditional === 'azureLocalLeader' && includeAzureLocal),
  )
}

export const isStageComplete = (stage: Stage, state: WizardState) =>
  stage.questions.every((question) => Boolean(state.answers[question.id]))
