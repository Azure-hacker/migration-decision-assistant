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

export type QuestionType = 'single' | 'number' | 'text' | 'percent'

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
  defaultValue?: number
  showWhen?: (answers: AnswerSet) => boolean
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
  | 'snapshots'
  | 'storageMigration'
  | 'shieldedVm'
  | 'trustedLaunch'
  | 'sdn'
  | 'controlPlane'
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
  leanScore: number
  azureLocalTotal: number
  hyperVTotal: number
  azureNativeAffinity: number
  prosCons: ProsConsBlock[]
  migrationEffort: MigrationEffort | null
  containerPlatform?: ContainerPlatformVerdict
  consideration: ConsiderationVerdict
}

export type ConsiderationVerdict = {
  whenAzureLocal: string[]
  whenHyperV: string[]
  whenAzureNative: string[]
  risks: { option: 'azureLocal' | 'hyperV' | 'azureNative'; risk: string }[]
}

export type ProsConsBlock = {
  option: 'azureLocal' | 'hyperV' | 'azureNative'
  title: string
  pros: string[]
  cons: string[]
}

export type ContainerPlatformVerdict = {
  recommendation: 'aksOnLocal' | 'aro' | 'evaluateBoth'
  rationale: string[]
}

export type MigrationEffort = {
  approach: 'azureMigrate' | 'wacVmode' | 'scvmm' | 'mixed'
  approachLabel: string
  totalVmsMigrated: number
  parallelPerWave: number
  waves: number
  estimatedHours: number
  estimatedWeeks: number
  complexity: 'low' | 'moderate' | 'elevated' | 'high'
  notes: string[]
}

export type EnvironmentSummary = {
  sites?: number
  hosts?: number
  vms?: number
  cores?: number
  virtualDesktops?: number
  linuxPercent?: number
  windowsPercent?: number
  vdiProducts?: string
  targetProduct?: string
  containerPlatform?: string
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
        id: 'linuxPercent',
        category: 'Workload',
        prompt: 'Approximate percentage of Linux guest VMs',
        helper: 'Slide to indicate the share of Linux VMs vs. Windows. The remainder is treated as Windows.',
        type: 'percent',
        min: 0,
        max: 100,
        step: 5,
        unit: '% Linux',
        defaultValue: 20,
        numericImpact: [
          { threshold: 60, comparator: 'gte', impact: { alConnectedHCI: 2 } },
          { threshold: 80, comparator: 'gte', impact: { alConnectedHCI: 3 } },
          { threshold: 30, comparator: 'lt', impact: { hvFailover: 2, alConnectedHCI: 1 } },
        ],
      },
      {
        id: 'containerPlatform',
        category: 'Containers',
        prompt: 'If Linux is significant, what container platform is preferred?',
        helper: 'Asked when Linux share is at least 40%. Used to suggest AKS on Azure Local or Azure Red Hat OpenShift.',
        type: 'single',
        optional: true,
        showWhen: (answers) => {
          const value = answers['linuxPercent']
          return typeof value === 'number' && value >= 40
        },
        choices: [
          {
            id: 'kubernetes',
            label: 'Kubernetes (AKS / vanilla K8s)',
            description: 'Standard Kubernetes platforms align with AKS on Azure Local.',
            impact: { alConnectedHCI: 3, alMultiRack: 1 },
            overlays: ['aks'],
          },
          {
            id: 'openshift',
            label: 'Red Hat OpenShift',
            description: 'Existing OpenShift estate suggests Azure Red Hat OpenShift (ARO) as a complement.',
            impact: { alConnectedHCI: 1 },
            overlays: ['aks'],
          },
          {
            id: 'docker-swarm-other',
            label: 'Docker Swarm or other',
            description: 'Other container orchestrators may need rationalization to AKS or OpenShift.',
            impact: { alConnectedHCI: 1 },
          },
          {
            id: 'none-yet',
            label: 'No container platform yet',
            description: 'Greenfield containers — both AKS on Azure Local and ARO are options.',
            impact: { alConnectedHCI: 1 },
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
      {
        id: 'migrationTool',
        category: 'Migration and DR',
        prompt: 'Preferred migration tooling',
        helper: 'Used to estimate migration effort and parallelism on the result page.',
        type: 'single',
        choices: [
          {
            id: 'wac-vmode',
            label: 'Windows Admin Center vMode',
            description: 'Wave-based VM migration with IP preservation and Gen2 conversion where supported.',
            impact: { hvFailover: 2, alConnectedHCI: 2 },
            flags: { wacAdopted: true },
          },
          {
            id: 'azure-migrate',
            label: 'Azure Migrate',
            description: 'Microsoft assessment + replication for VMware to Azure / Azure Local at scale.',
            impact: { alConnectedHCI: 3 },
            flags: { azureNativeOps: true },
          },
          {
            id: 'scvmm',
            label: 'SCVMM-led migration to Hyper-V',
            description: 'Use SCVMM and existing tooling to land workloads on Hyper-V Failover.',
            impact: { hvFailover: 4 },
            flags: { scvmmAdopted: true, classicAdmin: true },
          },
          {
            id: 'mixed',
            label: 'Mixed / partner tooling',
            description: 'Combination of Microsoft and partner tools across waves.',
            impact: { alConnectedHCI: 1, hvFailover: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'features',
    title: 'IT operations features',
    shortTitle: 'IT ops features',
    description:
      'How IT ops admins want to operate the platform: snapshots, storage migration, secured / shielded VMs, SDN, and how much you want the Azure control plane to drive everything.',
    questions: [
      {
        id: 'snapshots',
        category: 'VM lifecycle',
        prompt: 'How important are VM checkpoints / snapshots for daily ops?',
        type: 'single',
        choices: [
          {
            id: 'critical',
            label: 'Critical — used heavily today',
            description: 'Snapshots / checkpoints are part of standard ops.',
            impact: { hvFailover: 3, alConnectedHCI: 2 },
          },
          {
            id: 'occasional',
            label: 'Occasional',
            impact: { hvFailover: 1, alConnectedHCI: 1 },
          },
          {
            id: 'avoided',
            label: 'Avoided / replaced by backup',
            impact: { alConnectedHCI: 1 },
          },
        ],
      },
      {
        id: 'storageMigration',
        category: 'Storage operations',
        prompt: 'How important is live storage migration / Storage vMotion-equivalent?',
        type: 'single',
        choices: [
          {
            id: 'critical',
            label: 'Critical — moved between SAN tiers regularly',
            impact: { hvSanAttached: 4, alDisaggregatedSAN: 3 },
          },
          {
            id: 'periodic',
            label: 'Periodic — for refresh / consolidation',
            impact: { hvSanAttached: 2, alConnectedHCI: 2, alDisaggregatedSAN: 2 },
          },
          {
            id: 'rare',
            label: 'Rare — handled by replatforming',
            impact: { alConnectedHCI: 2 },
          },
        ],
      },
      {
        id: 'shieldedVms',
        category: 'Security',
        prompt: 'Are Shielded VMs in scope for sensitive workloads?',
        helper: 'Shielded VMs use vTPM, BitLocker, and host attestation in Hyper-V on Windows Server.',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — required for some workloads',
            impact: { hvFailover: 4 },
          },
          {
            id: 'evaluating',
            label: 'Evaluating',
            impact: { hvFailover: 2 },
          },
          {
            id: 'no',
            label: 'No requirement',
          },
        ],
      },
      {
        id: 'trustedLaunch',
        category: 'Security',
        prompt: 'Is Trusted Launch / vTPM-based VM security needed?',
        helper: 'Trusted Launch is broadly available on Azure-aligned platforms with vTPM and Secure Boot.',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — required',
            impact: { alConnectedHCI: 3, hvFailover: 2 },
          },
          {
            id: 'evaluating',
            label: 'Evaluating',
            impact: { alConnectedHCI: 1 },
          },
          {
            id: 'no',
            label: 'No requirement',
          },
        ],
      },
      {
        id: 'sdn',
        category: 'Networking',
        prompt: 'Is software-defined networking (SDN) used or planned?',
        helper: 'SDN includes virtual networks, micro-segmentation, software load balancers, and gateways.',
        type: 'single',
        choices: [
          {
            id: 'yes',
            label: 'Yes — central to the design',
            impact: { alConnectedHCI: 3, alMultiRack: 2 },
          },
          {
            id: 'partial',
            label: 'Partial — for selected segments',
            impact: { alConnectedHCI: 2 },
          },
          {
            id: 'no',
            label: 'No SDN today or planned',
            impact: { hvFailover: 2 },
          },
        ],
      },
      {
        id: 'controlPlane',
        category: 'Operating model',
        prompt: 'How much should Azure act as the platform control plane?',
        helper: 'Azure-native control plane means Arc, Azure Policy, Update Manager, and Azure Monitor are the source of truth.',
        type: 'single',
        choices: [
          {
            id: 'azure-first',
            label: 'Azure-first (Arc, Policy, Monitor as default)',
            impact: { alConnectedHCI: 5, alMultiRack: 2 },
            flags: { azureNativeOps: true },
          },
          {
            id: 'balanced',
            label: 'Balanced — Azure for some, local for the rest',
            impact: { alConnectedHCI: 2, hvFailover: 2 },
          },
          {
            id: 'local-first',
            label: 'Local-first (WAC, SCVMM, PowerShell)',
            impact: { hvFailover: 4 },
            flags: { classicAdmin: true },
          },
        ],
      },
    ],
  },
]

const allQuestions = stages.flatMap((stage) => stage.questions)

const isVisible = (question: Question, answers: AnswerSet) =>
  question.showWhen ? question.showWhen(answers) : true

export const visibleQuestions = (state: WizardState) =>
  allQuestions.filter((q) => isVisible(q, state.answers))

export const visibleQuestionsForStage = (stage: Stage, state: WizardState) =>
  stage.questions.filter((q) => isVisible(q, state.answers))

const requiredQuestionIds = allQuestions
  .filter((question) => !question.optional && question.id !== 'vdiProducts' && question.id !== 'virtualDesktops')
  .map((question) => question.id)

const isAnswered = (question: Question, answer: AnswerValue) => {
  if (question.type === 'number' || question.type === 'percent') {
    return typeof answer === 'number' && Number.isFinite(answer)
  }
  if (question.type === 'text') {
    return typeof answer === 'string' && answer.trim().length > 0
  }
  return typeof answer === 'string' && answer.length > 0
}

export const isQuestionRequired = (question: Question) =>
  !question.optional && question.id !== 'vdiProducts' && question.id !== 'virtualDesktops'

export const isQuestionAnswered = (question: Question, answer: AnswerValue) =>
  isAnswered(question, answer)

export const visibleRequiredQuestionsForStage = (stage: Stage, state: WizardState) =>
  visibleQuestionsForStage(stage, state).filter(isQuestionRequired)

export const stageMissingRequired = (stage: Stage, state: WizardState) =>
  visibleRequiredQuestionsForStage(stage, state).filter(
    (q) => !isQuestionAnswered(q, state.answers[q.id]),
  )

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
    id: 'snapshots',
    dimension: 'Snapshots / checkpoints',
    question: 'How are VM snapshots and checkpoints used day to day?',
    azureLocal: 'Hyper-V production checkpoints supported, complemented by Azure Backup integration.',
    hyperV: 'Native Hyper-V checkpoints with full Failover Cluster Manager and SCVMM support.',
    leans: 'either',
  },
  {
    id: 'storageMigration',
    dimension: 'Storage migration',
    question: 'How are VMs moved between storage tiers or arrays?',
    azureLocal: 'Live storage migration within HCI volumes; disaggregated SAN inherits SAN-vendor moves.',
    hyperV: 'Storage migration delivered by SAN vendor and Hyper-V Storage Live Migration.',
    leans: 'either',
  },
  {
    id: 'shieldedVm',
    dimension: 'Shielded VMs',
    question: 'Do you need Shielded VMs with vTPM, BitLocker, and Host Guardian?',
    azureLocal: 'Use Trusted Launch and Azure Confidential Computing patterns where supported.',
    hyperV: 'Native Shielded VMs with Host Guardian Service in Windows Server / Hyper-V.',
    leans: 'either',
  },
  {
    id: 'trustedLaunch',
    dimension: 'Trusted Launch / vTPM',
    question: 'Are Secure Boot + vTPM-based VMs required?',
    azureLocal: 'Trusted Launch / Confidential VMs aligned to Azure capabilities.',
    hyperV: 'vTPM and Secure Boot supported via Hyper-V Generation 2 VMs.',
    leans: 'either',
  },
  {
    id: 'sdn',
    dimension: 'Software-defined networking',
    question: 'How important is SDN, micro-segmentation, and software load balancing?',
    azureLocal: 'Network ATC, SDN, and Azure-aligned virtual networks built into the platform.',
    hyperV: 'Windows Server SDN available but typically less central to ops than Azure Local.',
    leans: 'either',
  },
  {
    id: 'controlPlane',
    dimension: 'Control plane',
    question: 'Where is the source of truth for policy, monitoring, and updates?',
    azureLocal: 'Azure (Arc, Policy, Monitor, Update Manager) as the default control plane.',
    hyperV: 'Local tooling (WAC, SCVMM, PowerShell) with optional Azure services.',
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
  state: WizardState,
): DecisionDimensionRow[] => {
  const azureLocalTotal =
    totals.alConnectedHCI + totals.alRAC + totals.alMultiRack + totals.alDisaggregatedSAN + totals.aldo
  const hyperVTotal = totals.hvFailover + totals.hvCampus + totals.hvSanAttached
  const outcomeLeans: DecisionDimensionRow['leans'] =
    azureLocalTotal === hyperVTotal
      ? 'either'
      : azureLocalTotal > hyperVTotal
        ? 'azureLocal'
        : 'hyperV'

  const a = state.answers
  const featureLeans: Record<string, DecisionDimensionRow['leans']> = {
    snapshots:
      a['snapshots'] === 'critical'
        ? 'hyperV'
        : a['snapshots'] === 'avoided'
          ? 'azureLocal'
          : 'either',
    storageMigration:
      a['storageMigration'] === 'critical'
        ? 'hyperV'
        : a['storageMigration'] === 'rare'
          ? 'azureLocal'
          : 'either',
    shieldedVm: a['shieldedVms'] === 'yes' ? 'hyperV' : 'either',
    trustedLaunch: a['trustedLaunch'] === 'yes' ? 'azureLocal' : 'either',
    sdn:
      a['sdn'] === 'yes'
        ? 'azureLocal'
        : a['sdn'] === 'no'
          ? 'hyperV'
          : 'either',
    controlPlane:
      a['controlPlane'] === 'azure-first'
        ? 'azureLocal'
        : a['controlPlane'] === 'local-first'
          ? 'hyperV'
          : 'either',
    hardware:
      a['hardwareRefresh'] === 'no'
        ? 'hyperV'
        : a['hardwareRefresh'] === 'yes-12' || a['hardwareRefresh'] === 'yes-24'
          ? 'azureLocal'
          : 'either',
    hybrid:
      a['controlPlane'] === 'azure-first' || a['arc'] === 'now'
        ? 'azureLocal'
        : a['arc'] === 'no'
          ? 'hyperV'
          : 'either',
    operations:
      a['scvmm'] === 'yes' ? 'hyperV' : a['arc'] === 'now' ? 'azureLocal' : 'either',
    automation:
      a['controlPlane'] === 'azure-first' ? 'azureLocal' : a['scvmm'] === 'yes' ? 'hyperV' : 'either',
    risk:
      a['hardwareRefresh'] === 'no' && a['scvmm'] === 'yes' ? 'hyperV' : outcomeLeans,
    commercial: outcomeLeans,
  }

  return decisionMatrixTemplate.map((row) => {
    if (row.id === 'outcome') return { ...row, leans: outcomeLeans }
    return { ...row, leans: featureLeans[row.id] ?? 'either' }
  })
}

const buildEnvironmentSummary = (state: WizardState): EnvironmentSummary => {
  const summary: EnvironmentSummary = {}
  const sites = state.answers['sites']
  const hosts = state.answers['hosts']
  const vms = state.answers['vms']
  const cores = state.answers['cores']
  const linuxPercent = state.answers['linuxPercent']
  const virtualDesktops = state.answers['virtualDesktops']
  const vdiProducts = state.answers['vdiProducts']
  const targetProduct = state.answers['targetProduct']
  const containerPlatform = state.answers['containerPlatform']

  if (typeof sites === 'number') summary.sites = sites
  if (typeof hosts === 'number') summary.hosts = hosts
  if (typeof vms === 'number') summary.vms = vms
  if (typeof cores === 'number') summary.cores = cores
  if (typeof virtualDesktops === 'number') summary.virtualDesktops = virtualDesktops
  if (typeof linuxPercent === 'number') {
    summary.linuxPercent = linuxPercent
    summary.windowsPercent = Math.max(0, 100 - linuxPercent)
  }
  if (typeof vdiProducts === 'string' && vdiProducts.trim().length > 0) {
    summary.vdiProducts = vdiProducts.trim()
  }
  if (typeof targetProduct === 'string' && targetProduct) {
    const choice = allQuestions.find((q) => q.id === 'targetProduct')?.choices?.find((c) => c.id === targetProduct)
    summary.targetProduct = choice?.label
  }
  if (typeof containerPlatform === 'string' && containerPlatform) {
    const choice = allQuestions.find((q) => q.id === 'containerPlatform')?.choices?.find((c) => c.id === containerPlatform)
    summary.containerPlatform = choice?.label
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
      if (!isVisible(question, state.answers)) continue
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

      if ((question.type === 'number' || question.type === 'percent') && typeof answer === 'number') {
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

const computeMigrationEffort = (
  state: WizardState,
  recommendations: Recommendation[],
): MigrationEffort | null => {
  const vms = state.answers['vms']
  if (typeof vms !== 'number' || vms <= 0) return null
  const tool = state.answers['migrationTool']
  const hosts = typeof state.answers['hosts'] === 'number' ? (state.answers['hosts'] as number) : 0
  const primaryFamily = recommendations[0]?.pattern.family

  let approach: MigrationEffort['approach'] = 'mixed'
  let approachLabel = 'Mixed Microsoft and partner tooling'
  let parallelPerHost = 6
  let hoursPerVm = 2
  const notes: string[] = []

  if (tool === 'wac-vmode') {
    approach = 'wacVmode'
    approachLabel = 'Windows Admin Center vMode'
    parallelPerHost = 8
    hoursPerVm = 1.5
    notes.push('WAC vMode supports wave-based migrations with IP preservation and Gen2 conversion where supported by the guest OS.')
    notes.push('Validate Gen1 vs Gen2 readiness — UEFI-capable Linux and Windows guests can be promoted to Gen2.')
  } else if (tool === 'azure-migrate') {
    approach = 'azureMigrate'
    approachLabel = 'Azure Migrate (assessment + replication)'
    parallelPerHost = 10
    hoursPerVm = 2.5
    notes.push('Azure Migrate scales replication in batches; size the appliance and bandwidth before each wave.')
    notes.push('Static IP preservation typically requires planned IP remap or routing changes — design for it.')
  } else if (tool === 'scvmm') {
    approach = 'scvmm'
    approachLabel = 'SCVMM-led migration to Hyper-V'
    parallelPerHost = 5
    hoursPerVm = 2
    notes.push('SCVMM converts and lands VMs on Hyper-V Failover targets using existing operations skills.')
    notes.push('Plan SCVMM library, runbooks, and licensing alongside Hyper-V cluster targets.')
  } else if (tool === 'mixed' || !tool) {
    approach = 'mixed'
    approachLabel = 'Mixed Microsoft and partner tooling'
    parallelPerHost = 6
    hoursPerVm = 2.25
    notes.push('Pick a primary tool per wave; mixing tools needs explicit handoff and validation steps.')
  }

  if (primaryFamily === 'azureLocal') {
    notes.push('Bias waves toward Azure Local once Arc onboarding, Update Manager, and Policy are in place.')
    hoursPerVm += 0.25
  } else if (primaryFamily === 'hyperV') {
    notes.push('Bias waves toward Hyper-V targets first to retire legacy hosts and reuse storage.')
  }

  const parallelPerWave = Math.max(parallelPerHost, hosts > 0 ? Math.min(parallelPerHost * Math.max(1, Math.floor(hosts / 4)), 60) : parallelPerHost)
  const waves = Math.max(1, Math.ceil(vms / parallelPerWave))
  const estimatedHours = Math.round(vms * hoursPerVm)
  const estimatedWeeks = Math.max(1, Math.ceil(estimatedHours / 60))

  let complexity: MigrationEffort['complexity']
  if (vms < 100) complexity = 'low'
  else if (vms < 500) complexity = 'moderate'
  else if (vms < 2000) complexity = 'elevated'
  else complexity = 'high'

  return {
    approach,
    approachLabel,
    totalVmsMigrated: vms,
    parallelPerWave,
    waves,
    estimatedHours,
    estimatedWeeks,
    complexity,
    notes,
  }
}

const computeContainerVerdict = (state: WizardState): ContainerPlatformVerdict | undefined => {
  const linuxPercent = state.answers['linuxPercent']
  if (typeof linuxPercent !== 'number' || linuxPercent < 40) return undefined
  const platform = state.answers['containerPlatform']
  if (platform === 'openshift') {
    return {
      recommendation: 'aro',
      rationale: [
        'Existing OpenShift footprint maps cleanly to Azure Red Hat OpenShift (ARO) for jointly-engineered support.',
        'AKS on Azure Local can host stateless services if platform consolidation is desired.',
      ],
    }
  }
  if (platform === 'kubernetes' || platform === 'docker-swarm-other' || platform === 'none-yet') {
    return {
      recommendation: 'aksOnLocal',
      rationale: [
        'Container preference and Linux share favor AKS on Azure Local for local Kubernetes workloads.',
        'Use ARO when Red Hat ecosystem dependencies (Operators, OperatorHub, OCP networking) drive the choice.',
      ],
    }
  }
  return {
    recommendation: 'evaluateBoth',
    rationale: [
      'Linux share is meaningful but no container preference was captured — evaluate AKS on Azure Local and ARO together.',
    ],
  }
}

const buildProsCons = (state: WizardState): ProsConsBlock[] => {
  const a = state.answers
  return [
    {
      option: 'azureLocal',
      title: `${versionData.azureLocal.label} (hybrid, Azure-aligned)`,
      pros: [
        'Azure Arc, Policy, Monitor, and Update Manager as the default control plane.',
        'Validated hardware catalog with consistent updates and lifecycle.',
        'Strong fit for AVD on Azure Local, AKS on Azure Local, Foundry Local AI inference, and SDN-centric designs.',
        a['hardwareRefresh'] === 'yes-12' || a['hardwareRefresh'] === 'yes-24'
          ? 'Aligns naturally with the planned hardware refresh window.'
          : 'Pairs well with new validated hardware purchases when the refresh window arrives.',
      ],
      cons: [
        'Requires validated Azure Local hardware — not all existing hosts will qualify.',
        'Requires Arc registration and Azure connectivity for the Connected pattern (use ALDO for disconnected sites).',
        a['scvmm'] === 'yes'
          ? 'SCVMM is not the primary management tool — operations need to shift to Azure-native tooling.'
          : 'Operations team must adopt Azure-native day-2 patterns.',
      ],
    },
    {
      option: 'hyperV',
      title: `${versionData.windowsServer.label} with Hyper-V`,
      pros: [
        'Reuses existing Windows Server skills, hardware, and storage strategy.',
        'Native Shielded VMs, Failover Clustering, and SCVMM for VM-led estates.',
        'Lowest-friction first wave for legacy or rarely-changed VM workloads.',
        a['hardwareRefresh'] === 'no'
          ? 'No hardware refresh required — landed on existing certified servers.'
          : 'Works with existing hosts when validated Azure Local SKUs are not in budget.',
      ],
      cons: [
        'No Azure-native control plane out of the box — Arc and policy are opt-in.',
        'Cross-site availability needs explicit campus / stretched design.',
        'Modernization workloads (AVD, AKS, AI) sit better on Azure Local.',
      ],
    },
    {
      option: 'azureNative',
      title: 'Azure-native (cloud-first)',
      pros: [
        'No on-premises hardware lifecycle for the affected workloads.',
        'Native managed services for Kubernetes, AI, identity, and VDI.',
        'Pay-as-you-go consumption model with global scale and DR options.',
      ],
      cons: [
        'Requires Azure connectivity and may not satisfy data residency or sovereignty constraints.',
        'Licensing, egress, and consumption modeling need close review using the Azure pricing calculator.',
        'Latency-sensitive or local-data workloads may still need Azure Local or Hyper-V on-premises.',
      ],
    },
  ]
}

const buildConsiderations = (
  state: WizardState,
  flags: Set<EnvFlag>,
): ConsiderationVerdict => {
  const a = state.answers
  const verdict: ConsiderationVerdict = {
    whenAzureLocal: [
      'Azure-first operating model is the explicit goal.',
      'Cross-site availability or RAC stretched cluster is needed.',
      'Modernization workloads (AVD, AKS, Foundry Local, GitHub Local, M365 Local) drive the program.',
      'A hardware refresh window aligns with adopting validated Azure Local SKUs.',
    ],
    whenHyperV: [
      'Existing Windows Server skills, SCVMM, and FC / iSCSI / SMB SAN must be preserved.',
      'Shielded VMs are required and central to the security model.',
      'Snapshots and storage migration are heavy in daily operations.',
      'No hardware refresh is in scope and validated Azure Local SKUs cannot be funded yet.',
    ],
    whenAzureNative: [
      'Workloads are greenfield or can run in Azure regions without local-data constraints.',
      'There is no requirement for sovereignty, air-gap, or strict on-premises placement.',
      'Consumption pricing is preferable to capex for the workloads in scope.',
    ],
    risks: [
      { option: 'azureLocal', risk: 'Validated hardware availability and Arc onboarding readiness must be confirmed before commit.' },
      { option: 'hyperV', risk: 'Misses the Azure-native control plane benefits and will accumulate operational drift over time.' },
      { option: 'azureNative', risk: 'Network egress, identity integration, and data gravity must be modeled — not all workloads pencil out.' },
    ],
  }
  if (flags.has('disconnected') || flags.has('sovereign')) {
    verdict.whenAzureNative = [
      'Not applicable when sovereign or disconnected operations are required.',
    ]
  }
  if (a['scvmm'] === 'yes') {
    verdict.whenHyperV.push('SCVMM is the active management tool — preserve it during the first migration waves.')
  }
  if (a['shieldedVms'] === 'yes') {
    verdict.whenHyperV.push('Shielded VMs are required — Hyper-V Host Guardian Service is the canonical pattern.')
  }
  return verdict
}

const computeAzureNativeAffinity = (state: WizardState, flags: Set<EnvFlag>): number => {
  if (flags.has('disconnected') || flags.has('sovereign')) return 0
  let score = 0
  if (state.answers['targetProduct'] === 'avs-azurevm') score += 5
  if (state.answers['controlPlane'] === 'azure-first') score += 3
  if (state.answers['arc'] === 'now') score += 2
  if (state.answers['avdScope'] === 'yes') score += 1
  if (state.answers['aksScope'] === 'yes') score += 1
  if (state.answers['hardwareRefresh'] === 'yes-12') score += 2
  return score
}

export const evaluate = (state: WizardState): EvaluationResult => {
  const totalQuestions = requiredQuestionIds.length
  const visibleRequired = requiredQuestionIds.filter((id) =>
    isVisible(allQuestions.find((q) => q.id === id)!, state.answers),
  )
  const answeredCount = visibleRequired.filter((id) =>
    isAnswered(allQuestions.find((q) => q.id === id)!, state.answers[id]),
  ).length

  const { totals, flags, overlayIds, rationales } = evaluateScores(state)

  const ready = answeredCount >= Math.ceil(visibleRequired.length * 0.6)

  const readinessGap = ready
    ? []
    : visibleRequired
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

  const azureLocalTotal =
    totals.alConnectedHCI + totals.alRAC + totals.alMultiRack + totals.alDisaggregatedSAN + totals.aldo
  const hyperVTotal = totals.hvFailover + totals.hvCampus + totals.hvSanAttached
  const sumOptions = azureLocalTotal + hyperVTotal
  const leanScore = sumOptions === 0 ? 0 : Math.round(((azureLocalTotal - hyperVTotal) / sumOptions) * 100)

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

  const considerAzureNative = ready && !flags.has('disconnected') && !flags.has('sovereign')
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

  const decisionMatrix = computeMatrixLeans(totals, state)
  const migrationEffort = ready ? computeMigrationEffort(state, recommendations) : null
  const containerPlatform = computeContainerVerdict(state)
  const prosCons = buildProsCons(state)
  const consideration = buildConsiderations(state, flags)
  const azureNativeAffinity = computeAzureNativeAffinity(state, flags)

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
    leanScore,
    azureLocalTotal,
    hyperVTotal,
    azureNativeAffinity,
    prosCons,
    migrationEffort,
    containerPlatform,
    consideration,
  }
}

export const isStageComplete = (stage: Stage, state: WizardState) => {
  const visible = visibleQuestionsForStage(stage, state)
  return visible
    .filter((question) => isQuestionRequired(question))
    .every((question) => isAnswered(question, state.answers[question.id]))
}

export const stageAnsweredCount = (stage: Stage, state: WizardState) =>
  visibleQuestionsForStage(stage, state).filter((question) =>
    isAnswered(question, state.answers[question.id]),
  ).length

export const stageVisibleCount = (stage: Stage, state: WizardState) =>
  visibleQuestionsForStage(stage, state).length

export const totalRequiredQuestions = requiredQuestionIds.length
