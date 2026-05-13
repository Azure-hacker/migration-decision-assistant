import { versionData } from './data/versions'

export type PatternFamily = 'azureLocal' | 'hyperV'

export type PatternId =
  | 'hvFailover'
  | 'hvCampus'
  | 'hvSanAttached'
  | 'alConnectedHCI'
  | 'alRAC'
  | 'alMultiRack'
  | 'alDisaggregatedSAN'
  | 'aldo'

export type Pattern = {
  id: PatternId
  family: PatternFamily
  name: string
  shortName: string
  tagline: string
  summary: string
  bestFor: string[]
  watchOuts: string[]
  docs: DocLink[]
}

export type DocLink = {
  label: string
  url: string
}

export type OverlayId =
  | 'avd'
  | 'aks'
  | 'foundryLocal'
  | 'githubEnterpriseLocal'
  | 'm365Local'
  | 'sovereignDisconnected'
  | 'migrationDr'
  | 'crossSiteAvailability'

export type Overlay = {
  id: OverlayId
  name: string
  summary: string
  considerations: string[]
  docs: DocLink[]
}

export type PatternImpact = Partial<Record<PatternId, number>>

export type Choice = {
  id: string
  label: string
  description?: string
  impact?: PatternImpact
  overlays?: OverlayId[]
  flags?: Partial<Record<EnvFlag, boolean>>
}

export type EnvFlag =
  | 'hardwareRefresh'
  | 'hasExistingSan'
  | 'hasVsan'
  | 'multiSite'
  | 'campusSite'
  | 'singleSite'
  | 'disconnected'
  | 'sovereign'
  | 'crossSiteAvailability'
  | 'azureArcAdopted'
  | 'wacAdopted'
  | 'scvmmAdopted'
  | 'classicAdmin'
  | 'azureNativeOps'
  | 'targetHyperV'
  | 'targetAzureLocal'
  | 'targetUndecided'
  | 'targetAzureCloud'

export type QuestionType = 'single' | 'number' | 'text'

export type Question = {
  id: string
  category: string
  prompt: string
  helper?: string
  type: QuestionType
  required?: boolean
  optional?: boolean
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
  choices?: Choice[]
  numericImpact?: NumericImpactRule[]
  numericFlags?: NumericFlagRule[]
}

export type NumericImpactRule = {
  threshold: number
  comparator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
  impact: PatternImpact
}

export type NumericFlagRule = {
  threshold: number
  comparator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
  flags: Partial<Record<EnvFlag, boolean>>
  overlays?: OverlayId[]
}

export type Stage = {
  id: string
  title: string
  shortTitle: string
  description: string
  questions: Question[]
}

export type AnswerValue = string | number | undefined

export type AnswerSet = Record<string, AnswerValue>

export type WizardState = {
  answers: AnswerSet
}

export type PatternScore = {
  pattern: Pattern
  total: number
  rationales: string[]
}

export type Recommendation = {
  pattern: Pattern
  score: number
  role: 'primary' | 'secondary' | 'workload-specific'
  rationale: string[]
  workloadFocus?: string
}

export type DecisionDimensionId =
  | 'commercial'
  | 'hardware'
  | 'hybrid'
  | 'operations'
  | 'automation'
  | 'risk'
  | 'outcome'

export type DecisionDimensionRow = {
  id: DecisionDimensionId
  dimension: string
  question: string
  azureLocal: string
  hyperV: string
  leans: 'azureLocal' | 'hyperV' | 'either'
}

export type EvaluationResult = {
  ready: boolean
  readinessGap: string[]
  recommendations: Recommendation[]
  hybridRecommended: boolean
  hybridRationale?: string
  scores: PatternScore[]
  overlays: Overlay[]
  decisionMatrix: DecisionDimensionRow[]
  considerAzureNative: boolean
  azureNativeRationale: string[]
  flags: Set<EnvFlag>
  answeredCount: number
  totalQuestions: number
  environmentSummary: EnvironmentSummary
}

export type EnvironmentSummary = {
  sites?: number
  hosts?: number
  vms?: number
  cores?: number
  virtualDesktops?: number
  guestOs?: string
  vdiProducts?: string
  targetProduct?: string
}

const versionLabel = versionData.azureLocal.label
const wsLabel = versionData.windowsServer.label

export const patterns: Pattern[] = [
  {
    id: 'hvFailover',
    family: 'hyperV',
    name: `${wsLabel} with Hyper-V Failover Clustering`,
    shortName: 'Hyper-V Failover Cluster',
    tagline: 'Classic Windows Server virtualization',
    summary: `Run virtual machines on ${wsLabel} with Hyper-V and Failover Clustering, using existing Windows operations and tooling.`,
    bestFor: [
      'Existing Windows Server estates with mature operations',
      'Workloads that fit a single primary site with classic VM administration',
      'Programs prioritizing minimal platform change for the first wave',
    ],
    watchOuts: [
      'Less Azure-native control plane integration than Azure Local',
      'Cross-site availability requires explicit campus/stretch design',
    ],
    docs: [
      { label: 'Hyper-V on Windows Server documentation', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
      { label: 'Hyper-V virtualization overview', url: versionData.windowsServer.overviewUrl },
    ],
  },
  {
    id: 'hvCampus',
    family: 'hyperV',
    name: `${wsLabel} Campus Cluster (cross-site Hyper-V)`,
    shortName: 'Hyper-V Campus Cluster',
    tagline: 'Stretched Windows Server cluster across sites',
    summary: 'Hyper-V Failover Cluster designed across two close sites or buildings for resilience using campus-grade fabric and storage.',
    bestFor: [
      'Two close sites (campus) needing automatic VM failover',
      'Existing storage replication that supports cross-site clustering',
      'Programs that want cross-site availability without adopting Azure Local',
    ],
    watchOuts: [
      'Requires low-latency, high-bandwidth connectivity between sites',
      'Campus design must align with supported Windows Server clustering patterns',
    ],
    docs: [
      { label: 'Failover Clustering documentation', url: 'https://learn.microsoft.com/en-us/windows-server/failover-clustering/' },
      { label: 'Hyper-V high availability and clustering', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
    ],
  },
  {
    id: 'hvSanAttached',
    family: 'hyperV',
    name: `${wsLabel} Hyper-V with SAN attach (FC, iSCSI, SMB)`,
    shortName: 'Hyper-V with SAN attach',
    tagline: 'Reuse existing SAN with Hyper-V hosts',
    summary: 'Run Hyper-V on existing servers attached to a Fibre Channel, iSCSI, or SMB-based SAN, preserving the current storage investment.',
    bestFor: [
      'Existing FC, iSCSI, or SMB SAN with remaining lifecycle',
      'Estates that want to refresh hosts but keep storage strategy',
      'Workloads tied to storage-vendor capabilities such as snapshots or replication',
    ],
    watchOuts: [
      'Storage and compute scale independently — plan for both lifecycles',
      'Validate SAN vendor support and supported configurations for Hyper-V',
    ],
    docs: [
      { label: 'Hyper-V storage options', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/' },
    ],
  },
  {
    id: 'alConnectedHCI',
    family: 'azureLocal',
    name: `${versionLabel} – Connected hyperconverged`,
    shortName: 'Azure Local Connected HCI',
    tagline: 'Default modern hybrid infrastructure',
    summary: 'Validated hyperconverged Azure Local deployment with continuous Azure connectivity, Arc-enabled operations, and standard Azure-aligned services.',
    bestFor: [
      'Most modern hybrid deployments with reliable Azure connectivity',
      'Estates adopting Arc, Azure Monitor, Azure Update Manager, and Azure governance',
      'Single primary site or modest multi-rack capacity at one site',
    ],
    watchOuts: [
      'Requires validated hardware from the Azure Local catalog',
      'Plan identity, networking, monitoring, Arc registration, and update operations up front',
    ],
    docs: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
      { label: 'Azure Local what\u2019s new', url: versionData.azureLocal.docsUrl },
      { label: 'Odin reference architectures', url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/' },
      { label: 'Odin sizer', url: 'https://azure.github.io/odinforazurelocal/sizer/' },
    ],
  },
  {
    id: 'alRAC',
    family: 'azureLocal',
    name: `${versionLabel} – RAC (cross-site / stretched cluster)`,
    shortName: 'Azure Local with RAC',
    tagline: 'Cross-site resilience for Azure Local',
    summary: 'Azure Local pattern designed for cross-site or campus availability where workloads must survive a site failure with automatic recovery.',
    bestFor: [
      'Two-site campus or near-metro pairs with strict availability targets',
      'Workloads that need automated failover across sites',
      'Programs replacing legacy stretched clusters with an Azure-aligned design',
    ],
    watchOuts: [
      'Requires supported low-latency network and validated RAC configuration',
      'Workload placement, quorum, and DR runbooks must be designed explicitly',
    ],
    docs: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
      { label: 'Odin reference architectures', url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/' },
    ],
  },
  {
    id: 'alMultiRack',
    family: 'azureLocal',
    name: `${versionLabel} – Multi-rack`,
    shortName: 'Azure Local Multi-rack',
    tagline: 'Scale Azure Local across multiple racks',
    summary: 'Azure Local design that spans multiple racks at one site for capacity, fault domains, and broader workload placement.',
    bestFor: [
      'Larger estates that exceed single-rack capacity',
      'Programs needing rack-level fault domains and growth headroom',
      'Multi-workload sites with VDI, AKS, and AI demand on the same platform',
    ],
    watchOuts: [
      'Plan rack-level fault domains, network fabric, and management boundaries up front',
      'Use Odin reference architectures and sizing tools to validate scale',
    ],
    docs: [
      { label: 'Odin reference architectures', url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/' },
      { label: 'Odin sizer', url: 'https://azure.github.io/odinforazurelocal/sizer/' },
    ],
  },
  {
    id: 'alDisaggregatedSAN',
    family: 'azureLocal',
    name: `${versionLabel} – Disaggregated SAN`,
    shortName: 'Azure Local Disaggregated SAN',
    tagline: 'Azure Local with external SAN',
    summary: 'Azure Local pattern that uses an external SAN instead of hyperconverged storage, suited for organizations with existing SAN investments to preserve.',
    bestFor: [
      'Existing SAN estate with remaining lifecycle to preserve',
      'Workloads needing storage features delivered by the SAN platform',
      'Programs that want Azure Local benefits without converting all storage to HCI',
    ],
    watchOuts: [
      'Validate supported storage vendors, fabrics, and configurations for Azure Local',
      'Operate compute and storage lifecycles together',
    ],
    docs: [
      { label: 'Odin reference architectures', url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/' },
    ],
  },
  {
    id: 'aldo',
    family: 'azureLocal',
    name: `${versionLabel} – ALDO (disconnected operations)`,
    shortName: 'Azure Local Disconnected (ALDO)',
    tagline: 'Azure Local for disconnected or sovereign sites',
    summary: 'Azure Local sized for sites with limited, intermittent, or fully disconnected connectivity to Azure, with local lifecycle and operations.',
    bestFor: [
      'Sovereign, classified, or air-gapped sites',
      'Edge sites with intermittent or constrained connectivity',
      'Programs that need a hybrid Azure-aligned platform without continuous Azure dependency',
    ],
    watchOuts: [
      'Confirm which Azure Local services and Arc features are supported in disconnected modes',
      'Design local update, monitoring, identity, and support workflows that do not assume Azure connectivity',
    ],
    docs: [
      { label: 'Azure Local what\u2019s new', url: versionData.azureLocal.docsUrl },
      { label: 'Odin reference architectures', url: 'https://azure.github.io/odinforazurelocal/docs/reference-architectures/' },
    ],
  },
]

export const overlays: Overlay[] = [
  {
    id: 'avd',
    name: 'Azure Virtual Desktop on Azure Local',
    summary: 'VDI workloads delivered with AVD session hosts running on Azure Local close to users, applications, or data.',
    considerations: [
      'Use the AVD on Azure Local guidance for session hosts, networking, and identity design',
      'Plan profile storage, image management, and update workflows for local session hosts',
      'Validate licensing, entitlement, and supported scenarios',
    ],
    docs: [
      { label: 'AVD on Azure Local workload architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-workload-virtual-desktop' },
      { label: 'AVD on Azure Local overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-desktop/azure-local-overview' },
    ],
  },
  {
    id: 'aks',
    name: 'AKS on Azure Local',
    summary: 'Containerized workloads that need a managed Kubernetes platform deployed on Azure Local infrastructure.',
    considerations: [
      'Follow the AKS hybrid baseline architecture for cluster, networking, and identity design',
      'Plan cluster lifecycle, registry, ingress, observability, and policy alongside Azure Local operations',
      'Decide which workloads belong on AKS on Azure Local versus AKS in Azure regions',
    ],
    docs: [
      { label: 'AKS on Azure Local architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-hybrid-azure-local' },
      { label: 'AKS hybrid baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/example-scenario/hybrid/aks-baseline' },
    ],
  },
  {
    id: 'foundryLocal',
    name: 'Foundry Local (AI and edge inference)',
    summary: 'Local AI inference and Foundry Local capabilities for workloads that need to run AI close to data or users.',
    considerations: [
      'Validate GPU SKUs, drivers, capacity, and lifecycle for AI workloads',
      'Plan model lifecycle, data residency, and security boundaries for AI inference',
      'Confirm supported Foundry Local capabilities for the chosen Azure Local version',
    ],
    docs: [
      { label: 'Azure Local Well-Architected service guide', url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local' },
    ],
  },
  {
    id: 'githubEnterpriseLocal',
    name: 'GitHub Enterprise local on Azure Local',
    summary: 'Hosting GitHub Enterprise components on Azure Local for sovereignty, performance, or operational reasons.',
    considerations: [
      'Validate supported GitHub Enterprise topology and integration patterns on Azure Local',
      'Plan identity, networking, secrets, and runner placement',
      'Define backup, DR, and lifecycle for the GitHub Enterprise components',
    ],
    docs: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
    ],
  },
  {
    id: 'm365Local',
    name: 'M365 Local-aligned workloads',
    summary: 'Workloads that complement M365 or run alongside Microsoft 365 services with local placement requirements.',
    considerations: [
      'Confirm which M365-aligned scenarios are supported on Azure Local',
      'Plan identity, networking, and data integration with M365 services',
      'Coordinate with the M365 product roadmap before committing to local placement',
    ],
    docs: [
      { label: 'Azure Local overview', url: versionData.azureLocal.overviewUrl },
    ],
  },
  {
    id: 'sovereignDisconnected',
    name: 'Sovereign or disconnected scenarios',
    summary: 'Environments with strict data residency, sovereignty, or disconnected operating requirements.',
    considerations: [
      'Map data residency, classification, and audit requirements to platform capabilities',
      'Define operating models that do not depend on continuous Azure connectivity where required',
      'Coordinate with security, compliance, and legal stakeholders before finalizing the architecture',
    ],
    docs: [
      { label: 'Azure Local Well-Architected service guide', url: 'https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-local' },
    ],
  },
  {
    id: 'migrationDr',
    name: 'Migration and disaster recovery',
    summary: 'Programs that prioritize migration from existing virtualization platforms or that require defined DR outcomes.',
    considerations: [
      'Inventory source workloads, dependencies, and migration tooling before defining waves',
      'Define RPO and RTO targets per workload tier and validate the design against them',
      'Use Microsoft and partner migration tooling and document fallback plans for each wave',
    ],
    docs: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
    ],
  },
  {
    id: 'crossSiteAvailability',
    name: 'Cross-site or stretched availability',
    summary: 'Workloads that must survive a site failure with automated recovery across sites.',
    considerations: [
      'Choose between Azure Local with RAC or a Hyper-V campus cluster based on operating model and Azure adoption',
      'Validate latency, bandwidth, and quorum design between sites',
      'Define DR runbooks and tested failover procedures',
    ],
    docs: [
      { label: 'Azure Local baseline architecture', url: 'https://learn.microsoft.com/en-us/azure/architecture/hybrid/azure-local-baseline' },
      { label: 'Failover Clustering documentation', url: 'https://learn.microsoft.com/en-us/windows-server/failover-clustering/' },
    ],
  },
]

export const stages: Stage[] = [
  {
    id: 'environment',
    title: 'Environment snapshot',
    shortTitle: 'Environment',
    description:
      'Capture the size and shape of the current estate. These numbers anchor the deterministic recommendation.',
    questions: [
      {
        id: 'sites',
        category: 'Footprint',
        prompt: 'Number of sites or datacenters',
        helper: 'Count distinct physical sites where workloads run today.',
        type: 'number',
        min: 0,
        step: 1,
        unit: 'sites',
        placeholder: 'e.g. 3',
        numericFlags: [
          { threshold: 1, comparator: 'eq', flags: { singleSite: true } },
          { threshold: 2, comparator: 'eq', flags: { campusSite: true } },
          { threshold: 3, comparator: 'gte', flags: { multiSite: true } },
        ],
        numericImpact: [
          { threshold: 1, comparator: 'eq', impact: { hvFailover: 3, alConnectedHCI: 3 } },
          { threshold: 2, comparator: 'eq', impact: { hvCampus: 4, alRAC: 5 } },
          { threshold: 3, comparator: 'gte', impact: { alRAC: 4, alMultiRack: 3, aldo: 2 } },
        ],
      },
      {
        id: 'hosts',
        category: 'Capacity',
        prompt: 'Number of hosts',
        helper: 'Total hypervisor hosts across all sites.',
        type: 'number',
        min: 0,
        step: 1,
        unit: 'hosts',
        placeholder: 'e.g. 24',
        numericImpact: [
          { threshold: 4, comparator: 'lt', impact: { hvFailover: 4 } },
          { threshold: 4, comparator: 'gte', impact: { alConnectedHCI: 3 } },
          { threshold: 16, comparator: 'gte', impact: { alMultiRack: 4, alConnectedHCI: 2 } },
          { threshold: 32, comparator: 'gte', impact: { alMultiRack: 5, alDisaggregatedSAN: 3 } },
        ],
      },
      {
        id: 'vms',
        category: 'Capacity',
        prompt: 'Number of VMs',
        type: 'number',
        min: 0,
        step: 1,
        unit: 'VMs',
        placeholder: 'e.g. 350',
        numericImpact: [
          { threshold: 50, comparator: 'lt', impact: { hvFailover: 3 } },
          { threshold: 200, comparator: 'gte', impact: { alConnectedHCI: 2 } },
          { threshold: 1000, comparator: 'gte', impact: { alMultiRack: 3, alDisaggregatedSAN: 2 } },
        ],
      },
      {
        id: 'cores',
        category: 'Capacity',
        prompt: 'Total physical cores',
        helper: 'Aggregate physical cores across all hosts.',
        type: 'number',
        min: 0,
        step: 1,
        unit: 'cores',
        placeholder: 'e.g. 1024',
        numericImpact: [
          { threshold: 256, comparator: 'lt', impact: { hvFailover: 2 } },
          { threshold: 256, comparator: 'gte', impact: { alConnectedHCI: 2 } },
          { threshold: 1024, comparator: 'gte', impact: { alMultiRack: 3 } },
        ],
      },
      {
        id: 'guestOs',
        category: 'Workload',
        prompt: 'Guest operating system mix',
        type: 'single',
        choices: [
          {
            id: 'windows',
            label: 'Windows-heavy',
            description: 'Most VMs run Windows Server.',
            impact: { hvFailover: 3, alConnectedHCI: 3 },
          },
          {
            id: 'linux',
            label: 'Linux-heavy',
            description: 'Most VMs run Linux distributions.',
            impact: { hvFailover: 1, alConnectedHCI: 2 },
          },
          {
            id: 'mixed',
            label: 'Balanced Windows and Linux mix',
            description: 'Meaningful share of both Windows and Linux workloads.',
            impact: { hvFailover: 2, alConnectedHCI: 3 },
          },
        ],
      },
    ],
  },
  {
    id: 'storage-hardware',
    title: 'Storage and hardware',
    shortTitle: 'Storage & hardware',
    description:
      'Capture the current storage strategy and hardware lifecycle. Hardware refresh signals do not automatically dictate the recommendation — they are inputs.',
    questions: [
      {
        id: 'storage',
        category: 'Storage strategy',
        prompt: 'What is the dominant storage architecture today?',
        type: 'single',
        choices: [
          {
            id: 'hci',
            label: 'Hyperconverged (HCI / vSAN)',
            description: 'Storage is pooled from local disks across hosts.',
            impact: { alConnectedHCI: 5, alMultiRack: 2 },
            flags: { hasVsan: true },
          },
          {
            id: 'fc',
            label: 'Fibre Channel SAN',
            description: 'Workloads are attached to a Fibre Channel SAN.',
            impact: { hvSanAttached: 5, alDisaggregatedSAN: 5 },
            flags: { hasExistingSan: true },
          },
          {
            id: 'iscsi',
            label: 'iSCSI SAN',
            description: 'Workloads are attached to an iSCSI SAN.',
            impact: { hvSanAttached: 5, alDisaggregatedSAN: 4 },
            flags: { hasExistingSan: true },
          },
          {
            id: 'smb',
            label: 'SMB / NAS',
            description: 'Workloads use SMB shares or NAS storage.',
            impact: { hvSanAttached: 3, alConnectedHCI: 2 },
            flags: { hasExistingSan: true },
          },
          {
            id: 'mixed-storage',
            label: 'Mixed storage approaches',
            description: 'A mix of HCI and SAN/NAS across the estate.',
            impact: { alConnectedHCI: 2, alDisaggregatedSAN: 3, hvSanAttached: 2 },
          },
        ],
      },
      {
        id: 'hardwareRefresh',
        category: 'Hardware lifecycle',
        prompt: 'Is a hardware refresh in scope?',
        helper: 'Used as an input. A refresh on its own does not pre-determine Azure Local.',
        type: 'single',
        choices: [
          {
            id: 'yes-12',
            label: 'Yes, within 12 months',
            description: 'A refresh is planned in the next 12 months.',
            impact: { alConnectedHCI: 3, alMultiRack: 2 },
            flags: { hardwareRefresh: true },
          },
          {
            id: 'yes-24',
            label: 'Yes, within 12–24 months',
            description: 'A refresh is planned within the next two years.',
            impact: { alConnectedHCI: 2 },
            flags: { hardwareRefresh: true },
          },
          {
            id: 'no',
            label: 'No, hardware will be reused',
            description: 'Existing hosts will be reused for the next platform.',
            impact: { hvSanAttached: 4, hvFailover: 2 },
          },
        ],
      },
      {
        id: 'siteShape',
        category: 'Site shape',
        prompt: 'Which best describes site distribution?',
        type: 'single',
        choices: [
          {
            id: 'single',
            label: 'Single primary site',
            description: 'All workloads run from one primary site.',
            impact: { hvFailover: 3, alConnectedHCI: 4 },
            flags: { singleSite: true },
          },
          {
            id: 'campus',
            label: 'Two-site campus or near-metro pair',
            description: 'Two close sites with low-latency connectivity.',
            impact: { hvCampus: 5, alRAC: 6 },
            flags: { campusSite: true, crossSiteAvailability: true },
            overlays: ['crossSiteAvailability'],
          },
          {
            id: 'multi',
            label: 'Multiple distributed sites',
            description: 'Several sites or edge locations spread across regions.',
            impact: { alMultiRack: 3, aldo: 3, hvFailover: 1 },
            flags: { multiSite: true },
          },
        ],
      },
      {
        id: 'crossSite',
        category: 'Availability',
        prompt: 'Do you need cross-site or stretched availability?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — automated cross-site failover',
            description: 'Workloads must survive a site failure with automated recovery.',
            impact: { alRAC: 6, hvCampus: 4 },
            flags: { crossSiteAvailability: true },
            overlays: ['crossSiteAvailability'],
          },
          {
            id: 'manual',
            label: 'Manual or scripted DR is enough',
            description: 'Cross-site recovery can be runbook-driven, not automatic.',
            impact: { hvFailover: 2, alConnectedHCI: 2 },
          },
          {
            id: 'no',
            label: 'No cross-site requirement',
            description: 'Single-site availability is sufficient.',
            impact: { hvFailover: 3, alConnectedHCI: 3 },
          },
        ],
      },
    ],
  },
  {
    id: 'workloads',
    title: 'Workloads and use cases',
    shortTitle: 'Workloads',
    description:
      'Capture VDI, AKS, AVD, AI, and other strategic workloads. These activate workload overlays in the result.',
    questions: [
      {
        id: 'vdi',
        category: 'VDI',
        prompt: 'Is virtual desktop infrastructure in use today?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes, VDI is in scope',
            description: 'There is an existing or planned VDI footprint.',
            impact: { alConnectedHCI: 3, alMultiRack: 2 },
            overlays: ['avd'],
          },
          {
            id: 'no',
            label: 'No VDI in scope',
            impact: { hvFailover: 1 },
          },
        ],
      },
      {
        id: 'virtualDesktops',
        category: 'VDI',
        prompt: 'Number of virtual desktops (if VDI applies)',
        type: 'number',
        optional: true,
        min: 0,
        step: 1,
        unit: 'desktops',
        placeholder: 'e.g. 500',
        numericImpact: [
          { threshold: 250, comparator: 'gte', impact: { alConnectedHCI: 2, alMultiRack: 2 } },
          { threshold: 1000, comparator: 'gte', impact: { alMultiRack: 3 } },
        ],
        numericFlags: [
          { threshold: 1, comparator: 'gte', overlays: ['avd'], flags: {} },
        ],
      },
      {
        id: 'vdiProducts',
        category: 'VDI',
        prompt: 'Existing VDI products (e.g. Citrix, Horizon, native AVD)',
        type: 'text',
        optional: true,
        placeholder: 'e.g. Citrix CVAD, Horizon, AVD',
      },
      {
        id: 'avdScope',
        category: 'AVD',
        prompt: 'Is Azure Virtual Desktop in scope?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — strategic',
            description: 'AVD is a strategic platform for VDI delivery.',
            impact: { alConnectedHCI: 3, alMultiRack: 2 },
            overlays: ['avd'],
          },
          {
            id: 'future',
            label: 'Future / evaluating',
            impact: { alConnectedHCI: 2 },
            overlays: ['avd'],
          },
          {
            id: 'no',
            label: 'Not in scope',
            impact: { hvFailover: 1 },
          },
        ],
      },
      {
        id: 'aksScope',
        category: 'Containers',
        prompt: 'Is AKS in scope (now or future)?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — strategic local Kubernetes',
            description: 'A managed Kubernetes platform on Azure Local is in scope.',
            impact: { alConnectedHCI: 3, alMultiRack: 2 },
            overlays: ['aks'],
          },
          {
            id: 'future',
            label: 'Future / evaluating',
            impact: { alConnectedHCI: 2 },
            overlays: ['aks'],
          },
          {
            id: 'no',
            label: 'Not in scope',
            impact: { hvFailover: 1 },
          },
        ],
      },
      {
        id: 'foundryLocal',
        category: 'AI and edge',
        prompt: 'Is Foundry Local or local AI inference in scope?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — strategic',
            description: 'Local AI inference and Foundry Local are in scope.',
            impact: { alConnectedHCI: 3, alMultiRack: 2 },
            overlays: ['foundryLocal'],
          },
          {
            id: 'future',
            label: 'Future / evaluating',
            impact: { alConnectedHCI: 2 },
            overlays: ['foundryLocal'],
          },
          {
            id: 'no',
            label: 'Not in scope',
          },
        ],
      },
      {
        id: 'githubLocal',
        category: 'Developer platform',
        prompt: 'Is GitHub Enterprise local in scope?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes',
            impact: { alConnectedHCI: 2 },
            overlays: ['githubEnterpriseLocal'],
          },
          {
            id: 'future',
            label: 'Future / evaluating',
            impact: { alConnectedHCI: 1 },
            overlays: ['githubEnterpriseLocal'],
          },
          {
            id: 'no',
            label: 'Not in scope',
          },
        ],
      },
      {
        id: 'm365Local',
        category: 'Productivity',
        prompt: 'Is M365 Local-aligned workload placement in scope?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes',
            impact: { alConnectedHCI: 2 },
            overlays: ['m365Local'],
          },
          {
            id: 'future',
            label: 'Future / evaluating',
            impact: { alConnectedHCI: 1 },
            overlays: ['m365Local'],
          },
          {
            id: 'no',
            label: 'Not in scope',
          },
        ],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations and integrations',
    shortTitle: 'Operations',
    description:
      'Capture today\u2019s operations stack and target operating model. These are the strongest signals for Azure Local versus Hyper-V.',
    questions: [
      {
        id: 'scvmm',
        category: 'Management stack',
        prompt: 'Is SCVMM in use today?',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — primary management stack',
            description: 'SCVMM is the central VM management tool.',
            impact: { hvFailover: 4, hvSanAttached: 2 },
            flags: { scvmmAdopted: true, classicAdmin: true },
          },
          {
            id: 'partial',
            label: 'Partially — for some workloads',
            impact: { hvFailover: 2 },
            flags: { scvmmAdopted: true },
          },
          {
            id: 'no',
            label: 'No',
          },
        ],
      },
      {
        id: 'arc',
        category: 'Azure operations',
        prompt: 'Azure Arc usage (now or planned)',
        type: 'single',
        choices: [
          {
            id: 'now',
            label: 'In use today',
            impact: { alConnectedHCI: 5, alMultiRack: 2, alRAC: 2 },
            flags: { azureArcAdopted: true, azureNativeOps: true },
          },
          {
            id: 'planned',
            label: 'Planned',
            impact: { alConnectedHCI: 4, alMultiRack: 2 },
            flags: { azureArcAdopted: true, azureNativeOps: true },
          },
          {
            id: 'no',
            label: 'Not planned',
            impact: { hvFailover: 2 },
            flags: { classicAdmin: true },
          },
        ],
      },
      {
        id: 'wac',
        category: 'Management stack',
        prompt: 'Windows Admin Center usage (now or planned)',
        type: 'single',
        choices: [
          {
            id: 'now',
            label: 'In use today',
            impact: { hvFailover: 2, alConnectedHCI: 2 },
            flags: { wacAdopted: true },
          },
          {
            id: 'planned',
            label: 'Planned',
            impact: { hvFailover: 1, alConnectedHCI: 1 },
            flags: { wacAdopted: true },
          },
          {
            id: 'no',
            label: 'Not planned',
          },
        ],
      },
      {
        id: 'targetProduct',
        category: 'Target preference',
        prompt: 'Which Microsoft target product do stakeholders currently favor?',
        helper: 'Used as a directional input. The recommendation still follows the data.',
        type: 'single',
        choices: [
          {
            id: 'hyperv',
            label: 'Windows Server / Hyper-V',
            impact: { hvFailover: 4, hvSanAttached: 2 },
            flags: { targetHyperV: true, classicAdmin: true },
          },
          {
            id: 'azurelocal',
            label: 'Azure Local',
            impact: { alConnectedHCI: 4 },
            flags: { targetAzureLocal: true, azureNativeOps: true },
          },
          {
            id: 'avs-azurevm',
            label: 'AVS or Azure VM',
            impact: { alConnectedHCI: 1 },
            flags: { targetAzureCloud: true },
          },
          {
            id: 'undecided',
            label: 'Undecided',
            flags: { targetUndecided: true },
          },
        ],
      },
      {
        id: 'connectivity',
        category: 'Connectivity',
        prompt: 'Realistic connectivity to Azure',
        type: 'single',
        choices: [
          {
            id: 'always',
            label: 'Always connected',
            impact: { alConnectedHCI: 5, alRAC: 2, alMultiRack: 2 },
          },
          {
            id: 'periodic',
            label: 'Intermittent or constrained',
            impact: { aldo: 4, alConnectedHCI: 1 },
          },
          {
            id: 'disconnected',
            label: 'Fully disconnected or air-gapped',
            impact: { aldo: 7 },
            flags: { disconnected: true },
            overlays: ['sovereignDisconnected'],
          },
        ],
      },
      {
        id: 'sovereignty',
        category: 'Sovereignty',
        prompt: 'Sovereignty or regulatory constraints',
        type: 'single',
        choices: [
          {
            id: 'none',
            label: 'No specific constraints',
          },
          {
            id: 'residency',
            label: 'Data residency required',
            impact: { alConnectedHCI: 2, hvFailover: 1 },
          },
          {
            id: 'sovereign',
            label: 'Sovereign, classified, or air-gapped',
            impact: { aldo: 6 },
            flags: { sovereign: true, disconnected: true },
            overlays: ['sovereignDisconnected'],
          },
        ],
      },
      {
        id: 'migrationDr',
        category: 'Migration and DR',
        prompt: 'Are migration and DR primary outcomes for this engagement?',
        type: 'single',
        choices: [
          {
            id: 'migration',
            label: 'Yes — migration is the priority',
            impact: { alConnectedHCI: 2, hvFailover: 2 },
            overlays: ['migrationDr'],
          },
          {
            id: 'dr',
            label: 'Yes — DR is the priority',
            impact: { alRAC: 3, hvCampus: 2, alConnectedHCI: 2 },
            overlays: ['migrationDr'],
          },
          {
            id: 'both',
            label: 'Both migration and DR are in scope',
            impact: { alConnectedHCI: 3, alRAC: 2 },
            overlays: ['migrationDr'],
          },
          {
            id: 'neither',
            label: 'Neither is the primary driver',
          },
        ],
      },
    ],
  },
]

const allQuestions = stages.flatMap((stage) => stage.questions)

const requiredQuestionIds = allQuestions
  .filter((question) => !question.optional && question.id !== 'vdiProducts' && question.id !== 'virtualDesktops')
  .map((question) => question.id)

const isAnswered = (question: Question, answer: AnswerValue) => {
  if (question.type === 'number') {
    return typeof answer === 'number' && Number.isFinite(answer)
  }
  if (question.type === 'text') {
    return typeof answer === 'string' && answer.trim().length > 0
  }
  return typeof answer === 'string' && answer.length > 0
}

const compareNumber = (value: number, rule: { threshold: number; comparator: NumericImpactRule['comparator'] }) => {
  switch (rule.comparator) {
    case 'gte':
      return value >= rule.threshold
    case 'gt':
      return value > rule.threshold
    case 'lte':
      return value <= rule.threshold
    case 'lt':
      return value < rule.threshold
    case 'eq':
      return value === rule.threshold
    default:
      return false
  }
}

const initialScores = (): Record<PatternId, number> => ({
  hvFailover: 0,
  hvCampus: 0,
  hvSanAttached: 0,
  alConnectedHCI: 0,
  alRAC: 0,
  alMultiRack: 0,
  alDisaggregatedSAN: 0,
  aldo: 0,
})

const decisionMatrixTemplate: DecisionDimensionRow[] = [
  {
    id: 'commercial',
    dimension: 'Commercial fit',
    question: 'Does the licensing and consumption model match the budget posture?',
    azureLocal: 'Azure Local consumption model with Arc-managed billing and validated hardware.',
    hyperV: 'Existing Windows Server licensing and traditional capex on existing hardware.',
    leans: 'either',
  },
  {
    id: 'hardware',
    dimension: 'Hardware fit',
    question: 'Can existing hosts and storage be reused, or is a refresh in scope?',
    azureLocal: 'Validated Azure Local hardware required; HCI or disaggregated SAN options.',
    hyperV: 'Reuses existing hosts and existing FC, iSCSI, or SMB SAN where supported.',
    leans: 'either',
  },
  {
    id: 'hybrid',
    dimension: 'Hybrid fit',
    question: 'Is Azure-centric operations the default control plane?',
    azureLocal: 'Azure portal, Arc, Monitor, Update Manager, and Policy as the default control plane.',
    hyperV: 'Azure services can be added selectively without becoming the platform default.',
    leans: 'either',
  },
  {
    id: 'operations',
    dimension: 'Operations fit',
    question: 'Do today\u2019s admins have the right skills and tools for the platform?',
    azureLocal: 'Azure-native operations, Arc, and Windows Admin Center in Azure.',
    hyperV: 'Existing Windows Server administration, SCVMM, Failover Cluster Manager, and PowerShell.',
    leans: 'either',
  },
  {
    id: 'automation',
    dimension: 'Automation fit',
    question: 'Can workloads be automated cleanly with current tooling?',
    azureLocal: 'ARM, Bicep, Azure Policy, Arc, and Azure Update Manager pipelines.',
    hyperV: 'PowerShell, SCVMM, DSC, and existing CI/CD against Windows Server endpoints.',
    leans: 'either',
  },
  {
    id: 'risk',
    dimension: 'Risk fit',
    question: 'Does this option reduce platform risk or shift one dependency for another?',
    azureLocal: 'Adopts an Azure-aligned platform with documented baseline architecture.',
    hyperV: 'Stays on a familiar platform but does not add Azure-native control plane.',
    leans: 'either',
  },
  {
    id: 'outcome',
    dimension: 'Outcome fit',
    question: 'Which option best preserves existing investment while meeting requirements?',
    azureLocal: 'Strong fit for hybrid modernization, AVD, AKS, AI, and cross-site availability.',
    hyperV: 'Strong fit for VM-led estates that prefer minimal platform change.',
    leans: 'either',
  },
]

const computeMatrixLeans = (
  totals: Record<PatternId, number>,
): DecisionDimensionRow[] => {
  const azureLocalTotal =
    totals.alConnectedHCI + totals.alRAC + totals.alMultiRack + totals.alDisaggregatedSAN + totals.aldo
  const hyperVTotal = totals.hvFailover + totals.hvCampus + totals.hvSanAttached
  const leans: DecisionDimensionRow['leans'] =
    azureLocalTotal === hyperVTotal
      ? 'either'
      : azureLocalTotal > hyperVTotal
        ? 'azureLocal'
        : 'hyperV'
  return decisionMatrixTemplate.map((row) =>
    row.id === 'outcome' ? { ...row, leans } : { ...row, leans: 'either' },
  )
}

const buildEnvironmentSummary = (state: WizardState): EnvironmentSummary => {
  const summary: EnvironmentSummary = {}
  const sites = state.answers['sites']
  const hosts = state.answers['hosts']
  const vms = state.answers['vms']
  const cores = state.answers['cores']
  const guestOs = state.answers['guestOs']
  const virtualDesktops = state.answers['virtualDesktops']
  const vdiProducts = state.answers['vdiProducts']
  const targetProduct = state.answers['targetProduct']

  if (typeof sites === 'number') summary.sites = sites
  if (typeof hosts === 'number') summary.hosts = hosts
  if (typeof vms === 'number') summary.vms = vms
  if (typeof cores === 'number') summary.cores = cores
  if (typeof virtualDesktops === 'number') summary.virtualDesktops = virtualDesktops
  if (typeof guestOs === 'string' && guestOs) {
    const choice = allQuestions.find((q) => q.id === 'guestOs')?.choices?.find((c) => c.id === guestOs)
    summary.guestOs = choice?.label
  }
  if (typeof vdiProducts === 'string' && vdiProducts.trim().length > 0) {
    summary.vdiProducts = vdiProducts.trim()
  }
  if (typeof targetProduct === 'string' && targetProduct) {
    const choice = allQuestions.find((q) => q.id === 'targetProduct')?.choices?.find((c) => c.id === targetProduct)
    summary.targetProduct = choice?.label
  }
  return summary
}

const evaluateScores = (state: WizardState) => {
  const totals = initialScores()
  const flags = new Set<EnvFlag>()
  const overlayIds = new Set<OverlayId>()
  const rationales: Record<PatternId, string[]> = {
    hvFailover: [],
    hvCampus: [],
    hvSanAttached: [],
    alConnectedHCI: [],
    alRAC: [],
    alMultiRack: [],
    alDisaggregatedSAN: [],
    aldo: [],
  }

  for (const stage of stages) {
    for (const question of stage.questions) {
      const answer = state.answers[question.id]
      if (!isAnswered(question, answer)) continue

      if (question.type === 'single' && typeof answer === 'string') {
        const choice = question.choices?.find((c) => c.id === answer)
        if (!choice) continue
        if (choice.impact) {
          for (const [patternId, value] of Object.entries(choice.impact) as Array<[PatternId, number]>) {
            totals[patternId] += value
            if (value > 0) {
              rationales[patternId].push(`${question.prompt} → ${choice.label}`)
            }
          }
        }
        if (choice.flags) {
          for (const [flag, on] of Object.entries(choice.flags) as Array<[EnvFlag, boolean]>) {
            if (on) flags.add(flag)
          }
        }
        choice.overlays?.forEach((id) => overlayIds.add(id))
      }

      if (question.type === 'number' && typeof answer === 'number') {
        question.numericImpact?.forEach((rule) => {
          if (compareNumber(answer, rule)) {
            for (const [patternId, value] of Object.entries(rule.impact) as Array<[PatternId, number]>) {
              totals[patternId] += value
              if (value > 0) {
                rationales[patternId].push(
                  `${question.prompt} = ${answer}${question.unit ? ' ' + question.unit : ''}`,
                )
              }
            }
          }
        })
        question.numericFlags?.forEach((rule) => {
          if (compareNumber(answer, rule)) {
            for (const [flag, on] of Object.entries(rule.flags) as Array<[EnvFlag, boolean]>) {
              if (on) flags.add(flag)
            }
            rule.overlays?.forEach((id) => overlayIds.add(id))
          }
        })
      }
    }
  }

  return { totals, flags, overlayIds, rationales }
}

const dedupe = (items: string[]) => Array.from(new Set(items))

export const evaluate = (state: WizardState): EvaluationResult => {
  const totalQuestions = requiredQuestionIds.length
  const answeredCount = requiredQuestionIds.filter((id) =>
    isAnswered(allQuestions.find((q) => q.id === id)!, state.answers[id]),
  ).length

  const { totals, flags, overlayIds, rationales } = evaluateScores(state)

  const ready = answeredCount >= Math.ceil(totalQuestions * 0.6)

  const readinessGap = ready
    ? []
    : requiredQuestionIds
        .filter((id) => !isAnswered(allQuestions.find((q) => q.id === id)!, state.answers[id]))
        .slice(0, 6)
        .map((id) => allQuestions.find((q) => q.id === id)!.prompt)

  const allScores: PatternScore[] = patterns.map((pattern) => ({
    pattern,
    total: totals[pattern.id],
    rationales: dedupe(rationales[pattern.id]).slice(0, 5),
  }))

  const azureLocalScores = allScores.filter((s) => s.pattern.family === 'azureLocal')
  const hyperVScores = allScores.filter((s) => s.pattern.family === 'hyperV')

  const sortDesc = (a: PatternScore, b: PatternScore) => b.total - a.total
  azureLocalScores.sort(sortDesc)
  hyperVScores.sort(sortDesc)

  const topAzureLocal = azureLocalScores[0]
  const topHyperV = hyperVScores[0]

  const recommendations: Recommendation[] = []
  let hybridRecommended = false
  let hybridRationale: string | undefined

  if (ready) {
    const azureLocalLeads = topAzureLocal.total > topHyperV.total
    const hyperVLeads = topHyperV.total > topAzureLocal.total
    const tied = topAzureLocal.total === topHyperV.total

    const margin = Math.abs(topAzureLocal.total - topHyperV.total)
    const bothMeaningful = topAzureLocal.total >= 6 && topHyperV.total >= 6

    if (azureLocalLeads || tied) {
      recommendations.push({
        pattern: topAzureLocal.pattern,
        score: topAzureLocal.total,
        role: 'primary',
        rationale: topAzureLocal.rationales,
      })
      if (azureLocalScores[1] && azureLocalScores[1].total >= topAzureLocal.total - 4 && azureLocalScores[1].total >= 4) {
        recommendations.push({
          pattern: azureLocalScores[1].pattern,
          score: azureLocalScores[1].total,
          role: 'secondary',
          rationale: azureLocalScores[1].rationales,
        })
      }
    }

    if (hyperVLeads || tied) {
      const role = recommendations.length === 0 ? 'primary' : 'secondary'
      recommendations.push({
        pattern: topHyperV.pattern,
        score: topHyperV.total,
        role,
        rationale: topHyperV.rationales,
      })
    }

    if (bothMeaningful && margin <= 6 && !tied) {
      hybridRecommended = true
      const localTarget = topAzureLocal.pattern.shortName
      const hvTarget = topHyperV.pattern.shortName
      const modernWorkloads: string[] = []
      if (overlayIds.has('avd')) modernWorkloads.push('AVD / VDI')
      if (overlayIds.has('aks')) modernWorkloads.push('AKS')
      if (overlayIds.has('foundryLocal')) modernWorkloads.push('Foundry Local / AI inference')
      if (overlayIds.has('githubEnterpriseLocal')) modernWorkloads.push('GitHub Enterprise local')
      if (overlayIds.has('m365Local')) modernWorkloads.push('M365 Local-aligned workloads')
      const modernText = modernWorkloads.length > 0 ? modernWorkloads.join(', ') : 'modernization workloads'
      hybridRationale = `Use ${localTarget} for ${modernText} that benefit from Azure-native operations, and ${hvTarget} for legacy or low-change VM workloads where existing Windows Server skills, hardware, or storage strategy can be preserved.`
      if (recommendations.find((r) => r.pattern.id === topHyperV.pattern.id) === undefined) {
        recommendations.push({
          pattern: topHyperV.pattern,
          score: topHyperV.total,
          role: 'workload-specific',
          rationale: topHyperV.rationales,
          workloadFocus: 'Legacy VM workloads or workloads tied to existing hardware and storage.',
        })
      } else {
        recommendations
          .filter((r) => r.pattern.id === topHyperV.pattern.id)
          .forEach((r) => {
            r.role = 'workload-specific'
            r.workloadFocus = 'Legacy VM workloads or workloads tied to existing hardware and storage.'
          })
      }
    }
  }

  const overlayList = overlays.filter((overlay) => overlayIds.has(overlay.id))

  const considerAzureNative =
    ready && !flags.has('disconnected') && !flags.has('sovereign')
  const azureNativeRationale: string[] = []
  if (considerAzureNative) {
    azureNativeRationale.push(
      'For greenfield workloads or those that can run in Azure regions, evaluate Azure VMs, AVS, AKS, App Service, AVD, and managed AI services as alternatives or complements to the on-premises path.',
    )
    if (overlayIds.has('aks')) {
      azureNativeRationale.push(
        'AKS in Azure regions can complement AKS on Azure Local for workloads that do not need local placement.',
      )
    }
    if (overlayIds.has('avd')) {
      azureNativeRationale.push(
        'Azure Virtual Desktop in Azure regions remains the default for users who do not require local session hosts.',
      )
    }
    azureNativeRationale.push(
      'Use the Azure pricing calculator to compare consumption costs against the on-premises platform.',
    )
  }

  const decisionMatrix = computeMatrixLeans(totals)

  return {
    ready,
    readinessGap,
    recommendations,
    hybridRecommended,
    hybridRationale,
    scores: [...azureLocalScores, ...hyperVScores].sort(sortDesc),
    overlays: overlayList,
    decisionMatrix,
    considerAzureNative,
    azureNativeRationale,
    flags,
    answeredCount,
    totalQuestions,
    environmentSummary: buildEnvironmentSummary(state),
  }
}

export const isStageComplete = (stage: Stage, state: WizardState) =>
  stage.questions
    .filter((question) => !question.optional)
    .every((question) => isAnswered(question, state.answers[question.id]))

export const stageAnsweredCount = (stage: Stage, state: WizardState) =>
  stage.questions.filter((question) => isAnswered(question, state.answers[question.id])).length

export const totalRequiredQuestions = requiredQuestionIds.length
