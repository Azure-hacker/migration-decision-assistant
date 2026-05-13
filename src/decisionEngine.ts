export type OptionId = 'azureLocal' | 'aro' | 'windowsHyperV'

export type Criterion =
  | 'Workload fit'
  | 'Operating model'
  | 'Cloud integration'
  | 'Modernization'
  | 'Cost continuity'
  | 'Risk readiness'

export type DecisionOption = {
  id: OptionId
  name: string
  category: string
  summary: string
  bestFit: string
  watchOut: string
}

export type Impact = Record<OptionId, number>

export type Choice = {
  id: string
  label: string
  description: string
  criterion: Criterion
  impact: Impact
  rationale: Partial<Record<OptionId, string>>
  caution?: Partial<Record<OptionId, string>>
}

export type Question = {
  id: string
  category: string
  prompt: string
  choices: Choice[]
}

export type AnswerSet = Record<string, string>

export type OptionScore = {
  option: DecisionOption
  total: number
  criteria: Array<{ name: Criterion; score: number }>
  positiveSignals: string[]
  cautions: string[]
}

export type RecommendationResult = {
  winner: DecisionOption
  winnerScore: OptionScore
  confidence: 'High' | 'Medium' | 'Low'
  scores: OptionScore[]
  rationales: string[]
  cautions: string[]
  answeredQuestions: Array<{ question: string; choice: string }>
}

export const decisionOptions: DecisionOption[] = [
  {
    id: 'azureLocal',
    name: 'Azure Local',
    category: 'Hybrid cloud infrastructure',
    summary:
      'Azure-aligned infrastructure for on-premises VMs, hybrid operations, Arc integration, and selected cloud services close to users or data.',
    bestFit:
      'Hybrid modernization where workloads must remain on-premises but need Azure governance, Arc management, VM operations, and a forward path to cloud-consistent services.',
    watchOut:
      'Requires Azure connectivity planning, validated hardware, cluster operations, identity, networking, and ongoing lifecycle management.',
  },
  {
    id: 'aro',
    name: 'Azure Red Hat OpenShift',
    category: 'Managed OpenShift application platform',
    summary:
      'A managed OpenShift platform on Azure for containerized applications, platform engineering, DevSecOps, and regulated cloud-native workloads.',
    bestFit:
      'Container-first application estates that already standardize on Kubernetes or OpenShift and need a managed Azure-hosted platform with Red Hat ecosystem alignment.',
    watchOut:
      'Not a direct landing zone for VM lift-and-shift; application packaging, platform skills, cluster networking, and shared responsibility must be validated.',
  },
  {
    id: 'windowsHyperV',
    name: 'Windows Server / Hyper-V',
    category: 'Traditional virtualization',
    summary:
      'Windows Server virtualization for familiar VM consolidation, datacenter continuity, lower-change migration, and existing Windows operational models.',
    bestFit:
      'Straightforward VM migration or consolidation where teams prioritize familiar Windows Server operations, Hyper-V clustering, existing tooling, and low platform change.',
    watchOut:
      'Provides less native Azure control-plane consistency than Azure Local and is not a managed container application platform.',
  },
]

export const questions: Question[] = [
  {
    id: 'primary-workload',
    category: 'Workload shape',
    prompt: 'What is the dominant workload you need to place first?',
    choices: [
      {
        id: 'vm-estate',
        label: 'Mostly existing VMs',
        description: 'The near-term need is VM migration, consolidation, or replacement of an existing virtualization platform.',
        criterion: 'Workload fit',
        impact: { azureLocal: 4, aro: -3, windowsHyperV: 5 },
        rationale: {
          azureLocal: 'The workload is VM-heavy, which fits Azure Local when hybrid Azure management is also valuable.',
          windowsHyperV: 'Existing VM estates align strongly with Windows Server / Hyper-V for low-change virtualization.',
        },
        caution: {
          aro: 'ARO is optimized for containerized workloads, not direct VM lift-and-shift.',
        },
      },
      {
        id: 'container-platform',
        label: 'Mostly containers and platform engineering',
        description: 'The target is a Kubernetes or OpenShift platform with CI/CD, policy, and app team self-service.',
        criterion: 'Modernization',
        impact: { azureLocal: 1, aro: 6, windowsHyperV: -3 },
        rationale: {
          aro: 'Container-first platform needs are the clearest fit for Azure Red Hat OpenShift.',
        },
        caution: {
          windowsHyperV: 'Traditional Hyper-V does not provide a managed OpenShift application platform.',
        },
      },
      {
        id: 'mixed-hybrid',
        label: 'Mixed VMs and selected modernization',
        description: 'VMs remain important, but the roadmap includes Azure governance and some app modernization.',
        criterion: 'Workload fit',
        impact: { azureLocal: 5, aro: 2, windowsHyperV: 2 },
        rationale: {
          azureLocal: 'A mixed VM and hybrid modernization estate favors Azure Local as a bridge platform.',
        },
      },
    ],
  },
  {
    id: 'location-requirement',
    category: 'Placement constraint',
    prompt: 'Where do workloads need to run?',
    choices: [
      {
        id: 'must-stay-on-prem',
        label: 'Must remain on-premises or at the edge',
        description: 'Latency, data residency, disconnected operations, or facility constraints require local placement.',
        criterion: 'Cloud integration',
        impact: { azureLocal: 6, aro: -2, windowsHyperV: 4 },
        rationale: {
          azureLocal: 'Local placement with Azure-connected operations is a core Azure Local scenario.',
          windowsHyperV: 'On-premises placement also fits Windows Server / Hyper-V.',
        },
        caution: {
          aro: 'ARO is an Azure-hosted managed service and may not satisfy strict on-premises placement requirements.',
        },
      },
      {
        id: 'azure-cloud-ok',
        label: 'Azure region placement is acceptable',
        description: 'Applications can run in Azure if private networking, identity, and compliance controls are met.',
        criterion: 'Cloud integration',
        impact: { azureLocal: 1, aro: 5, windowsHyperV: -1 },
        rationale: {
          aro: 'Azure-hosted placement supports ARO when the target is cloud-native containers.',
        },
      },
      {
        id: 'hybrid-flexible',
        label: 'Hybrid placement is flexible',
        description: 'Some workloads stay local while others can move to Azure over time.',
        criterion: 'Cloud integration',
        impact: { azureLocal: 5, aro: 3, windowsHyperV: 1 },
        rationale: {
          azureLocal: 'Hybrid flexibility favors Azure Local for a consistent Azure management path across local workloads.',
        },
      },
    ],
  },
  {
    id: 'migration-change',
    category: 'Migration posture',
    prompt: 'How much application change is acceptable in the first wave?',
    choices: [
      {
        id: 'minimal-change',
        label: 'Minimal change',
        description: 'The priority is moving workloads with as little replatforming as possible.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 3, aro: -4, windowsHyperV: 6 },
        rationale: {
          windowsHyperV: 'Minimal-change migration favors Windows Server / Hyper-V for familiar VM operations.',
        },
        caution: {
          aro: 'A container platform usually requires packaging and operational changes before migration.',
        },
      },
      {
        id: 'moderate-replatform',
        label: 'Moderate replatforming',
        description: 'The team can update operations and tooling while keeping many workloads as VMs.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 5, aro: 1, windowsHyperV: 2 },
        rationale: {
          azureLocal: 'Moderate replatforming fits Azure Local when the goal is hybrid operations without full app refactoring.',
        },
      },
      {
        id: 'modernize-apps',
        label: 'Modernize application delivery',
        description: 'The program is prepared to containerize, automate deployments, and adopt platform engineering practices.',
        criterion: 'Modernization',
        impact: { azureLocal: 1, aro: 6, windowsHyperV: -3 },
        rationale: {
          aro: 'Application modernization and platform engineering strongly favor ARO.',
        },
      },
    ],
  },
  {
    id: 'azure-management',
    category: 'Operations',
    prompt: 'How important is Azure-native management and governance?',
    choices: [
      {
        id: 'azure-control-plane-critical',
        label: 'Critical',
        description: 'Azure portal, Azure Arc, policy, monitoring, and cloud governance are strategic requirements.',
        criterion: 'Operating model',
        impact: { azureLocal: 6, aro: 4, windowsHyperV: -1 },
        rationale: {
          azureLocal: 'Azure-native governance is a leading reason to choose Azure Local for on-premises workloads.',
          aro: 'ARO also benefits from Azure identity, networking, monitoring, and policy integration.',
        },
      },
      {
        id: 'azure-control-plane-helpful',
        label: 'Helpful but not mandatory',
        description: 'Azure integration is valuable, but existing tools can remain primary during the first phase.',
        criterion: 'Operating model',
        impact: { azureLocal: 4, aro: 2, windowsHyperV: 2 },
        rationale: {
          azureLocal: 'Azure Local benefits from Azure integration while still supporting local operations.',
        },
      },
      {
        id: 'local-tools-primary',
        label: 'Local tools are primary',
        description: 'The team wants to keep existing Windows, Hyper-V, or datacenter tooling as the main control plane.',
        criterion: 'Operating model',
        impact: { azureLocal: 1, aro: -1, windowsHyperV: 5 },
        rationale: {
          windowsHyperV: 'Existing local Windows Server and Hyper-V tooling favors Windows Server / Hyper-V.',
        },
      },
    ],
  },
  {
    id: 'team-skills',
    category: 'Skills',
    prompt: 'Which operational skill set is strongest today?',
    choices: [
      {
        id: 'windows-virtualization',
        label: 'Windows Server and virtualization',
        description: 'Admins are strongest with Windows Server, Failover Clustering, Hyper-V, PowerShell, and traditional VM operations.',
        criterion: 'Operating model',
        impact: { azureLocal: 3, aro: -2, windowsHyperV: 6 },
        rationale: {
          windowsHyperV: 'The current team skill profile aligns with Windows Server / Hyper-V.',
          azureLocal: 'Windows virtualization skills transfer to Azure Local operations.',
        },
      },
      {
        id: 'azure-hybrid',
        label: 'Azure and hybrid infrastructure',
        description: 'Teams are comfortable with Azure subscriptions, identity, Arc, policy, monitoring, and infrastructure as code.',
        criterion: 'Operating model',
        impact: { azureLocal: 6, aro: 3, windowsHyperV: 1 },
        rationale: {
          azureLocal: 'Azure and hybrid infrastructure skills strongly support Azure Local adoption.',
        },
      },
      {
        id: 'openshift-devops',
        label: 'OpenShift, Kubernetes, and DevOps',
        description: 'Teams already run Kubernetes or OpenShift and have mature container delivery practices.',
        criterion: 'Modernization',
        impact: { azureLocal: 1, aro: 6, windowsHyperV: -2 },
        rationale: {
          aro: 'Existing OpenShift and Kubernetes skills strongly favor ARO.',
        },
      },
    ],
  },
  {
    id: 'redhat-standard',
    category: 'Platform standard',
    prompt: 'Is Red Hat OpenShift a required or preferred enterprise standard?',
    choices: [
      {
        id: 'openshift-required',
        label: 'Required standard',
        description: 'Enterprise architecture or app teams require OpenShift compatibility and Red Hat platform alignment.',
        criterion: 'Modernization',
        impact: { azureLocal: -1, aro: 7, windowsHyperV: -4 },
        rationale: {
          aro: 'A formal OpenShift standard is the strongest signal for ARO.',
        },
      },
      {
        id: 'openshift-helpful',
        label: 'Helpful for some teams',
        description: 'Some application teams prefer OpenShift, but it is not universal.',
        criterion: 'Modernization',
        impact: { azureLocal: 1, aro: 4, windowsHyperV: 0 },
        rationale: {
          aro: 'Partial OpenShift alignment gives ARO a modernization advantage.',
        },
      },
      {
        id: 'not-openshift-standard',
        label: 'Not a standard',
        description: 'The organization is not committed to OpenShift as a required platform.',
        criterion: 'Modernization',
        impact: { azureLocal: 2, aro: -2, windowsHyperV: 2 },
        rationale: {
          azureLocal: 'Without an OpenShift requirement, infrastructure fit and operating model become more important.',
          windowsHyperV: 'Without an OpenShift requirement, traditional virtualization remains viable for VM estates.',
        },
      },
    ],
  },
  {
    id: 'windows-dependency',
    category: 'Application constraints',
    prompt: 'How dependent are workloads on Windows Server patterns?',
    choices: [
      {
        id: 'deep-windows-dependency',
        label: 'Deep dependency',
        description: 'Workloads rely on Windows Server, Active Directory integration, legacy agents, or VM-level administration.',
        criterion: 'Workload fit',
        impact: { azureLocal: 4, aro: -4, windowsHyperV: 6 },
        rationale: {
          windowsHyperV: 'Deep Windows Server dependency favors Windows Server / Hyper-V.',
          azureLocal: 'Windows VM dependency can also fit Azure Local when hybrid Azure operations are desired.',
        },
      },
      {
        id: 'some-windows-dependency',
        label: 'Some dependency',
        description: 'A meaningful subset is Windows-based, but not every workload depends on Windows Server.',
        criterion: 'Workload fit',
        impact: { azureLocal: 5, aro: 1, windowsHyperV: 3 },
        rationale: {
          azureLocal: 'A mixed Windows estate can fit Azure Local as a bridge for hybrid VM operations.',
        },
      },
      {
        id: 'portable-apps',
        label: 'Mostly portable applications',
        description: 'Applications can be containerized or moved without VM-level Windows Server assumptions.',
        criterion: 'Modernization',
        impact: { azureLocal: 1, aro: 5, windowsHyperV: -1 },
        rationale: {
          aro: 'Portable applications improve fit for ARO and cloud-native delivery.',
        },
      },
    ],
  },
  {
    id: 'connectivity',
    category: 'Network readiness',
    prompt: 'What connectivity model is realistic?',
    choices: [
      {
        id: 'reliable-azure-connectivity',
        label: 'Reliable Azure connectivity',
        description: 'Outbound connectivity, identity integration, private networking, and Azure operations are realistic.',
        criterion: 'Cloud integration',
        impact: { azureLocal: 5, aro: 4, windowsHyperV: 1 },
        rationale: {
          azureLocal: 'Reliable connectivity supports Azure Local registration, Arc, monitoring, and lifecycle operations.',
          aro: 'Reliable Azure networking supports private ARO designs and enterprise controls.',
        },
      },
      {
        id: 'limited-connectivity',
        label: 'Limited or intermittent connectivity',
        description: 'Sites may have constrained bandwidth, strict egress, or intermittent connectivity.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 1, aro: -3, windowsHyperV: 4 },
        rationale: {
          windowsHyperV: 'Limited connectivity favors a more locally managed Windows Server / Hyper-V approach.',
        },
        caution: {
          azureLocal: 'Azure Local requires careful planning for Azure registration, updates, monitoring, and support connectivity.',
          aro: 'ARO depends on Azure-hosted control and data-plane networking.',
        },
      },
      {
        id: 'private-cloud-networking',
        label: 'Advanced private cloud networking is ready',
        description: 'The organization can support private endpoints, hub-spoke networking, firewalls, DNS, and route control.',
        criterion: 'Cloud integration',
        impact: { azureLocal: 4, aro: 5, windowsHyperV: 0 },
        rationale: {
          aro: 'Advanced Azure networking readiness improves fit for private ARO patterns.',
        },
      },
    ],
  },
  {
    id: 'cost-driver',
    category: 'Commercial driver',
    prompt: 'What is the strongest commercial driver?',
    choices: [
      {
        id: 'use-windows-investments',
        label: 'Use existing Windows investments',
        description: 'The program wants to preserve licensing, skills, and tooling investments where possible.',
        criterion: 'Cost continuity',
        impact: { azureLocal: 2, aro: -1, windowsHyperV: 5 },
        rationale: {
          windowsHyperV: 'Existing Windows investments favor Windows Server / Hyper-V cost continuity.',
        },
      },
      {
        id: 'hybrid-cloud-value',
        label: 'Capture hybrid cloud value',
        description: 'The goal is to modernize operations while keeping local infrastructure where needed.',
        criterion: 'Cost continuity',
        impact: { azureLocal: 6, aro: 2, windowsHyperV: 1 },
        rationale: {
          azureLocal: 'Hybrid cloud value and local infrastructure modernization are strong Azure Local signals.',
        },
      },
      {
        id: 'managed-platform-value',
        label: 'Use a managed application platform',
        description: 'The program values managed platform operations, developer velocity, and standardized app delivery.',
        criterion: 'Cost continuity',
        impact: { azureLocal: 0, aro: 6, windowsHyperV: -2 },
        rationale: {
          aro: 'Managed application platform value strongly favors ARO.',
        },
      },
    ],
  },
  {
    id: 'resiliency',
    category: 'Availability',
    prompt: 'What availability model is needed first?',
    choices: [
      {
        id: 'local-cluster-ha',
        label: 'Local cluster high availability',
        description: 'The priority is keeping local VM workloads resilient across on-premises nodes.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 5, aro: -1, windowsHyperV: 5 },
        rationale: {
          azureLocal: 'Local cluster availability fits Azure Local for hybrid VM estates.',
          windowsHyperV: 'Hyper-V clustering fits local VM resiliency requirements.',
        },
      },
      {
        id: 'cloud-zone-ha',
        label: 'Azure cloud availability patterns',
        description: 'The target can use Azure regional design, availability zones, private ingress, and cloud DR patterns.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 1, aro: 5, windowsHyperV: -1 },
        rationale: {
          aro: 'Azure cloud availability patterns fit ARO for containerized applications.',
        },
      },
      {
        id: 'basic-ha',
        label: 'Basic availability is enough for V1',
        description: 'The first wave is not mission-critical or can tolerate simpler resilience.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 1, aro: 1, windowsHyperV: 2 },
        rationale: {
          windowsHyperV: 'Simpler availability needs can be satisfied with a lower-change Hyper-V design.',
        },
      },
    ],
  },
  {
    id: 'governance',
    category: 'Security and governance',
    prompt: 'Which governance pattern matters most?',
    choices: [
      {
        id: 'azure-policy-monitoring',
        label: 'Azure policy, monitoring, and inventory',
        description: 'Centralized Azure governance and inventory are needed across hybrid resources.',
        criterion: 'Cloud integration',
        impact: { azureLocal: 6, aro: 3, windowsHyperV: 0 },
        rationale: {
          azureLocal: 'Azure policy, monitoring, and inventory are major reasons to adopt Azure Local with Arc.',
        },
      },
      {
        id: 'app-platform-controls',
        label: 'Application platform controls',
        description: 'Namespace isolation, image policy, service mesh, secrets, and cluster RBAC are central.',
        criterion: 'Modernization',
        impact: { azureLocal: 0, aro: 6, windowsHyperV: -2 },
        rationale: {
          aro: 'Application platform controls map directly to ARO and OpenShift operating practices.',
        },
      },
      {
        id: 'windows-admin-controls',
        label: 'Windows administration controls',
        description: 'Existing Windows identity, host controls, patching, and VM administration are primary.',
        criterion: 'Operating model',
        impact: { azureLocal: 2, aro: -1, windowsHyperV: 5 },
        rationale: {
          windowsHyperV: 'Windows administration controls favor Windows Server / Hyper-V.',
        },
      },
    ],
  },
  {
    id: 'time-to-value',
    category: 'Delivery',
    prompt: 'What is the desired first-wave delivery style?',
    choices: [
      {
        id: 'quick-vm-landing',
        label: 'Quick VM landing zone',
        description: 'Stand up a practical place to run migrated VMs quickly.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 3, aro: -3, windowsHyperV: 6 },
        rationale: {
          windowsHyperV: 'A quick VM landing zone is a strong Windows Server / Hyper-V signal.',
        },
      },
      {
        id: 'hybrid-operating-model',
        label: 'Hybrid operating model foundation',
        description: 'Build a repeatable foundation for local workloads with Azure governance and lifecycle practices.',
        criterion: 'Risk readiness',
        impact: { azureLocal: 6, aro: 2, windowsHyperV: 1 },
        rationale: {
          azureLocal: 'A hybrid operating model foundation strongly favors Azure Local.',
        },
      },
      {
        id: 'developer-platform',
        label: 'Developer platform foundation',
        description: 'Deliver a standardized app platform for product teams and pipelines.',
        criterion: 'Modernization',
        impact: { azureLocal: 0, aro: 6, windowsHyperV: -3 },
        rationale: {
          aro: 'A developer platform foundation strongly favors ARO.',
        },
      },
    ],
  },
]

const criteria: Criterion[] = [
  'Workload fit',
  'Operating model',
  'Cloud integration',
  'Modernization',
  'Cost continuity',
  'Risk readiness',
]

const optionOrder: OptionId[] = ['azureLocal', 'aro', 'windowsHyperV']

const getSelectedChoice = (question: Question, answers: AnswerSet) =>
  question.choices.find((choice) => choice.id === answers[question.id]) ??
  question.choices[0]

const getConfidence = (scores: OptionScore[]) => {
  const margin = scores[0].total - scores[1].total

  if (margin >= 12) {
    return 'High'
  }

  if (margin >= 6) {
    return 'Medium'
  }

  return 'Low'
}

export const evaluateDecision = (answers: AnswerSet): RecommendationResult => {
  const scoresByOption = new Map<OptionId, OptionScore>(
    decisionOptions.map((option) => [
      option.id,
      {
        option,
        total: 0,
        criteria: criteria.map((name) => ({ name, score: 0 })),
        positiveSignals: [],
        cautions: [],
      },
    ]),
  )

  const answeredQuestions = questions.map((question) => {
    const choice = getSelectedChoice(question, answers)

    for (const option of decisionOptions) {
      const score = scoresByOption.get(option.id)

      if (!score) {
        continue
      }

      const impact = choice.impact[option.id]
      const criterionScore = score.criteria.find(
        (item) => item.name === choice.criterion,
      )

      score.total += impact

      if (criterionScore) {
        criterionScore.score += impact
      }

      const rationale = choice.rationale[option.id]
      const caution = choice.caution?.[option.id]

      if (impact > 0 && rationale) {
        score.positiveSignals.push(rationale)
      }

      if (impact < 0 && caution) {
        score.cautions.push(caution)
      }
    }

    return { question: question.prompt, choice: choice.label }
  })

  const scores = [...scoresByOption.values()].sort((left, right) => {
    const scoreDifference = right.total - left.total

    if (scoreDifference !== 0) {
      return scoreDifference
    }

    return optionOrder.indexOf(left.option.id) - optionOrder.indexOf(right.option.id)
  })

  const winnerScore = scores[0]
  const rationales = winnerScore.positiveSignals.slice(0, 5)
  const cautions =
    winnerScore.cautions.length > 0
      ? winnerScore.cautions.slice(0, 4)
      : [
          `${winnerScore.option.name} scored highest, but final fit still depends on validated sizing, licensing, networking, supportability, identity, and operational readiness.`,
        ]

  return {
    winner: winnerScore.option,
    winnerScore,
    confidence: getConfidence(scores),
    scores,
    rationales,
    cautions,
    answeredQuestions,
  }
}
