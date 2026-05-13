import PptxGenJS from 'pptxgenjs'
import type { EvaluationResult } from '../decisionEngine'
import { versionData } from '../data/versions'

const COLORS = {
  bg: '0B1024',
  surface: '131A35',
  surfaceLight: '1B2347',
  text: 'F4F5FB',
  textDim: 'B6BDD6',
  textMuted: '8089A8',
  violet: 'A855F7',
  cyan: '22D3EE',
  amber: 'FBBF24',
  pink: 'F472B6',
  teal: '2DD4BF',
}

const PRICING_URL = 'https://azure.microsoft.com/pricing/calculator/'
const REPO_URL = 'https://github.com/Azure-hacker/migration-decision-assistant'

const headerBar = (slide: PptxGenJS.Slide, title: string, kicker?: string) => {
  slide.background = { color: COLORS.bg }
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.6, fill: { color: COLORS.violet } })
  slide.addShape('rect', { x: 0, y: 0.6, w: 13.33, h: 0.05, fill: { color: COLORS.cyan } })
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.5,
      y: 0.12,
      w: 12.3,
      h: 0.35,
      fontSize: 11,
      color: COLORS.text,
      bold: true,
      charSpacing: 4,
    })
  }
  slide.addText(title, {
    x: 0.5,
    y: 0.85,
    w: 12.3,
    h: 0.6,
    fontSize: 26,
    color: COLORS.text,
    bold: true,
  })
}

const footerBar = (slide: PptxGenJS.Slide, page: string) => {
  slide.addShape('rect', { x: 0, y: 7.0, w: 13.33, h: 0.5, fill: { color: COLORS.surface } })
  slide.addText('Migration Decision Assistant · open source · reference guidance only', {
    x: 0.5,
    y: 7.05,
    w: 9,
    h: 0.4,
    fontSize: 10,
    color: COLORS.textMuted,
  })
  slide.addText(page, {
    x: 11.5,
    y: 7.05,
    w: 1.4,
    h: 0.4,
    fontSize: 10,
    color: COLORS.textMuted,
    align: 'right',
  })
}

const recommendationFamilyLabel = (family: 'azureLocal' | 'hyperV') =>
  family === 'azureLocal' ? versionData.azureLocal.label : versionData.windowsServer.label

export const generatePptx = async (result: EvaluationResult, customer?: string) => {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = 'Migration Decision Assistant'
  pptx.company = 'Open source community'

  // Cover
  const cover = pptx.addSlide()
  cover.background = { color: COLORS.bg }
  cover.addShape('rect', { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: COLORS.bg } })
  cover.addShape('ellipse', { x: -2, y: -3, w: 7, h: 7, fill: { color: COLORS.violet, transparency: 80 }, line: { color: COLORS.bg } })
  cover.addShape('ellipse', { x: 9, y: 4, w: 6, h: 6, fill: { color: COLORS.cyan, transparency: 80 }, line: { color: COLORS.bg } })
  cover.addShape('ellipse', { x: 4, y: 5.5, w: 5, h: 5, fill: { color: COLORS.pink, transparency: 85 }, line: { color: COLORS.bg } })

  cover.addText('MIGRATION DECISION ASSISTANT', {
    x: 0.6,
    y: 1.3,
    w: 12,
    h: 0.5,
    fontSize: 14,
    bold: true,
    color: COLORS.cyan,
    charSpacing: 6,
  })
  cover.addText(customer ? `${customer} — recommended path` : 'Recommended path', {
    x: 0.6,
    y: 1.85,
    w: 12,
    h: 1,
    fontSize: 36,
    bold: true,
    color: COLORS.text,
  })
  cover.addText(result.recommendations[0]?.pattern.name ?? 'Recommendation pending', {
    x: 0.6,
    y: 2.85,
    w: 12,
    h: 0.8,
    fontSize: 28,
    color: COLORS.violet,
    bold: true,
  })
  cover.addText(
    `Reference versions: ${versionData.azureLocal.label} · ${versionData.windowsServer.label}`,
    {
      x: 0.6,
      y: 5.6,
      w: 12,
      h: 0.4,
      fontSize: 14,
      color: COLORS.textDim,
    },
  )
  cover.addText(
    'Open source reference tool — not an official Microsoft product or support offering.',
    {
      x: 0.6,
      y: 6.0,
      w: 12,
      h: 0.4,
      fontSize: 12,
      color: COLORS.textMuted,
      italic: true,
    },
  )
  cover.addText(`Generated ${new Date().toISOString().slice(0, 10)} · ${REPO_URL}`, {
    x: 0.6,
    y: 6.4,
    w: 12,
    h: 0.4,
    fontSize: 10,
    color: COLORS.textMuted,
  })

  // Executive summary
  const exec = pptx.addSlide()
  headerBar(exec, 'Executive summary', 'Recommendation overview')
  const summaryRows: string[] = []
  result.recommendations.slice(0, 3).forEach((rec) => {
    const role = rec.role === 'primary' ? 'Primary' : rec.role === 'workload-specific' ? 'Hybrid split' : 'Alternative'
    summaryRows.push(`• ${role}: ${rec.pattern.name} (score ${rec.score})`)
  })
  if (result.hybridRecommended && result.hybridRationale) {
    summaryRows.push('')
    summaryRows.push(`Hybrid: ${result.hybridRationale}`)
  }
  if (summaryRows.length === 0) {
    summaryRows.push('Not enough information was captured to render a deterministic recommendation.')
  }
  exec.addText(summaryRows.join('\n'), {
    x: 0.5,
    y: 1.7,
    w: 12.3,
    h: 4,
    fontSize: 16,
    color: COLORS.text,
    valign: 'top',
  })

  exec.addText(
    `Lean indicator: ${
      result.leanScore > 5
        ? `Inputs lean toward Azure Local (+${result.leanScore})`
        : result.leanScore < -5
          ? `Inputs lean toward Hyper-V (${result.leanScore})`
          : 'Balanced — both options remain viable'
    }`,
    {
      x: 0.5,
      y: 5.8,
      w: 12.3,
      h: 0.7,
      fontSize: 14,
      color: COLORS.cyan,
      bold: true,
    },
  )
  footerBar(exec, '2')

  // Environment
  const env = pptx.addSlide()
  headerBar(env, 'Environment snapshot', 'Inputs that anchored the decision')
  const envItems: string[] = []
  const e = result.environmentSummary
  if (e.sites !== undefined) envItems.push(`Sites / datacenters: ${e.sites}`)
  if (e.hosts !== undefined) envItems.push(`Hosts: ${e.hosts}`)
  if (e.vms !== undefined) envItems.push(`VMs: ${e.vms}`)
  if (e.cores !== undefined) envItems.push(`Physical cores: ${e.cores}`)
  if (e.linuxPercent !== undefined) envItems.push(`Guest OS mix: ${e.linuxPercent}% Linux / ${e.windowsPercent ?? 100 - e.linuxPercent}% Windows`)
  if (e.virtualDesktops !== undefined) envItems.push(`Virtual desktops: ${e.virtualDesktops}`)
  if (e.vdiProducts) envItems.push(`VDI products: ${e.vdiProducts}`)
  if (e.targetProduct) envItems.push(`Target Microsoft product preference: ${e.targetProduct}`)
  if (e.containerPlatform) envItems.push(`Container platform: ${e.containerPlatform}`)
  if (envItems.length === 0) envItems.push('No environment data captured yet.')
  env.addText(envItems.map((i) => `• ${i}`).join('\n'), {
    x: 0.5,
    y: 1.7,
    w: 12.3,
    h: 5,
    fontSize: 16,
    color: COLORS.text,
    valign: 'top',
  })
  footerBar(env, '3')

  // Recommendations detail
  result.recommendations.slice(0, 3).forEach((rec, idx) => {
    const slide = pptx.addSlide()
    const role = rec.role === 'primary' ? 'Primary recommendation' : rec.role === 'workload-specific' ? 'Hybrid split' : 'Alternative option'
    headerBar(slide, rec.pattern.name, `${role} · ${recommendationFamilyLabel(rec.pattern.family)}`)
    slide.addText(rec.pattern.summary, {
      x: 0.5,
      y: 1.7,
      w: 12.3,
      h: 0.9,
      fontSize: 14,
      color: COLORS.textDim,
      italic: true,
    })

    slide.addText('Why this matched', {
      x: 0.5,
      y: 2.8,
      w: 6,
      h: 0.4,
      fontSize: 13,
      color: COLORS.violet,
      bold: true,
      charSpacing: 4,
    })
    slide.addText((rec.rationale.length > 0 ? rec.rationale : ['Recommendation derived from overall scoring.']).map((r) => `• ${r}`).join('\n'), {
      x: 0.5,
      y: 3.2,
      w: 6,
      h: 3.2,
      fontSize: 12,
      color: COLORS.text,
      valign: 'top',
    })

    slide.addText('Best for', {
      x: 6.8,
      y: 2.8,
      w: 6,
      h: 0.4,
      fontSize: 13,
      color: COLORS.cyan,
      bold: true,
      charSpacing: 4,
    })
    slide.addText(rec.pattern.bestFor.map((b) => `• ${b}`).join('\n'), {
      x: 6.8,
      y: 3.2,
      w: 6,
      h: 1.7,
      fontSize: 12,
      color: COLORS.text,
      valign: 'top',
    })

    slide.addText('Watch-outs', {
      x: 6.8,
      y: 5.0,
      w: 6,
      h: 0.4,
      fontSize: 13,
      color: COLORS.amber,
      bold: true,
      charSpacing: 4,
    })
    slide.addText(rec.pattern.watchOuts.map((w) => `• ${w}`).join('\n'), {
      x: 6.8,
      y: 5.4,
      w: 6,
      h: 1.4,
      fontSize: 12,
      color: COLORS.text,
      valign: 'top',
    })
    footerBar(slide, String(4 + idx))
  })

  // Decision matrix
  const matrix = pptx.addSlide()
  headerBar(matrix, 'Azure Local vs Hyper-V — decision matrix', 'Side-by-side dimensions')
  const matrixHeader = ['Dimension', 'Azure Local', 'Hyper-V', 'Lean'].map((t) => ({ text: t }))
  const matrixRows = result.decisionMatrix.slice(0, 9).map((row) =>
    [
      row.dimension,
      row.azureLocal,
      row.hyperV,
      row.leans === 'azureLocal' ? 'Azure Local' : row.leans === 'hyperV' ? 'Hyper-V' : '—',
    ].map((t) => ({ text: t })),
  )
  matrix.addTable([matrixHeader, ...matrixRows], {
    x: 0.5,
    y: 1.6,
    w: 12.3,
    fontSize: 10,
    color: COLORS.text,
    fill: { color: COLORS.surface },
    border: { type: 'solid', pt: 0.5, color: COLORS.surfaceLight },
    colW: [1.8, 4.6, 4.6, 1.3],
  })
  footerBar(matrix, 'Decision matrix')

  // IT ops feature comparison summary
  const features = pptx.addSlide()
  headerBar(features, 'IT operations features', 'What admins notice day to day')
  const opsFeatureRows = [
    ['Snapshots / checkpoints', 'Production checkpoints + Azure Backup', 'Native Hyper-V checkpoints + SCVMM'],
    ['Storage migration', 'Live storage migration in HCI volumes', 'Vendor-driven SAN moves + Hyper-V live migration'],
    ['Shielded VMs', 'Trusted Launch / Confidential Computing patterns', 'Native Shielded VMs with Host Guardian Service'],
    ['Trusted Launch / vTPM', 'Aligned to Azure capabilities', 'Hyper-V Generation 2 VMs with vTPM and Secure Boot'],
    ['Software-defined networking', 'Network ATC and SDN built into platform', 'Windows Server SDN available, less central'],
    ['Control plane', 'Arc, Policy, Monitor, Update Manager (default)', 'WAC, SCVMM, PowerShell with optional Azure'],
  ]
  features.addTable(
    [
      ['Feature', 'Azure Local', 'Hyper-V on Windows Server'].map((t) => ({ text: t })),
      ...opsFeatureRows.map((r) => r.map((t) => ({ text: t }))),
    ],
    {
      x: 0.5,
      y: 1.6,
      w: 12.3,
      fontSize: 11,
      color: COLORS.text,
      fill: { color: COLORS.surface },
      border: { type: 'solid', pt: 0.5, color: COLORS.surfaceLight },
      colW: [3.0, 4.65, 4.65],
    },
  )
  footerBar(features, 'IT ops features')

  // Migration effort
  if (result.migrationEffort) {
    const me = result.migrationEffort
    const slide = pptx.addSlide()
    headerBar(slide, 'Migration effort estimate', `${me.approachLabel}`)
    const lines = [
      `Total VMs in scope: ${me.totalVmsMigrated}`,
      `Parallel VMs per wave: ${me.parallelPerWave}`,
      `Estimated waves: ${me.waves}`,
      `Estimated effort: ~${me.estimatedHours} hours (~${me.estimatedWeeks} weeks of focused execution)`,
      `Complexity: ${me.complexity}`,
      '',
      'Notes:',
      ...me.notes.map((n) => `• ${n}`),
      '',
      'Planning estimate only — confirm with formal sizing, validated hardware, and partner / Microsoft delivery teams.',
    ]
    slide.addText(lines.join('\n'), {
      x: 0.5,
      y: 1.6,
      w: 12.3,
      h: 5.2,
      fontSize: 14,
      color: COLORS.text,
      valign: 'top',
    })
    footerBar(slide, 'Migration effort')
  }

  // Pros / cons
  const prosCons = pptx.addSlide()
  headerBar(prosCons, 'Pros, cons, and when each option fits', 'Side-by-side')
  const proWidth = 4.0
  result.prosCons.forEach((block, i) => {
    const x = 0.5 + i * (proWidth + 0.25)
    const headerColor = block.option === 'azureLocal' ? COLORS.violet : block.option === 'hyperV' ? COLORS.cyan : COLORS.amber
    prosCons.addShape('rect', { x, y: 1.55, w: proWidth, h: 0.55, fill: { color: headerColor } })
    prosCons.addText(block.title, { x: x + 0.1, y: 1.6, w: proWidth - 0.2, h: 0.45, fontSize: 13, color: COLORS.bg, bold: true })
    prosCons.addText('Pros\n' + block.pros.map((p) => `+ ${p}`).join('\n'), {
      x,
      y: 2.2,
      w: proWidth,
      h: 2.4,
      fontSize: 10,
      color: COLORS.text,
      fill: { color: COLORS.surface },
      valign: 'top',
    })
    prosCons.addText('Cons\n' + block.cons.map((c) => `- ${c}`).join('\n'), {
      x,
      y: 4.7,
      w: proWidth,
      h: 2.2,
      fontSize: 10,
      color: COLORS.text,
      fill: { color: COLORS.surfaceLight },
      valign: 'top',
    })
  })
  footerBar(prosCons, 'Pros and cons')

  // Considerations: when to choose
  const considerations = pptx.addSlide()
  headerBar(considerations, 'When to choose what', 'Risks per option')
  considerations.addText('Choose Azure Local when:', { x: 0.5, y: 1.5, w: 4, h: 0.4, fontSize: 13, bold: true, color: COLORS.violet })
  considerations.addText(result.consideration.whenAzureLocal.map((s) => `• ${s}`).join('\n'), {
    x: 0.5, y: 1.95, w: 4, h: 4.5, fontSize: 11, color: COLORS.text, valign: 'top',
  })
  considerations.addText('Choose Hyper-V when:', { x: 4.7, y: 1.5, w: 4, h: 0.4, fontSize: 13, bold: true, color: COLORS.cyan })
  considerations.addText(result.consideration.whenHyperV.map((s) => `• ${s}`).join('\n'), {
    x: 4.7, y: 1.95, w: 4, h: 4.5, fontSize: 11, color: COLORS.text, valign: 'top',
  })
  considerations.addText('Consider Azure-native when:', { x: 8.9, y: 1.5, w: 4, h: 0.4, fontSize: 13, bold: true, color: COLORS.amber })
  considerations.addText(result.consideration.whenAzureNative.map((s) => `• ${s}`).join('\n'), {
    x: 8.9, y: 1.95, w: 4, h: 4.5, fontSize: 11, color: COLORS.text, valign: 'top',
  })
  footerBar(considerations, 'When to choose')

  // Implementation phases / baseline architecture
  const phases = pptx.addSlide()
  headerBar(phases, 'Baseline implementation phases', 'Reference flow')
  const phaseRows = [
    ['1. Discover', 'Inventory hosts, VMs, dependencies, storage, networks. Capture sizing and validated hardware target.'],
    ['2. Design', 'Apply Azure Local baseline architecture / Odin reference architectures or Hyper-V cluster design. Identity, networking, storage, monitoring, updates.'],
    ['3. Pilot', 'Stand up first cluster (or Hyper-V target). Migrate non-production workloads. Validate operations, observability, and DR.'],
    ['4. Wave', 'Execute waves with chosen tooling (WAC vMode, Azure Migrate, SCVMM). Preserve IPs where possible. Validate Gen1 vs Gen2 readiness.'],
    ['5. Operate', 'Day-2 operations on Arc / Azure Update Manager / Azure Monitor or local WAC / SCVMM tooling. Patch and capacity cadence.'],
    ['6. Optimize', 'Workload placement reviews, AKS / AVD / AI overlays, cost optimization, sovereignty review where applicable.'],
  ]
  phases.addTable(
    [
      ['Phase', 'Activities'].map((t) => ({ text: t })),
      ...phaseRows.map((r) => r.map((t) => ({ text: t }))),
    ],
    {
      x: 0.5,
      y: 1.6,
      w: 12.3,
      fontSize: 11,
      color: COLORS.text,
      fill: { color: COLORS.surface },
      border: { type: 'solid', pt: 0.5, color: COLORS.surfaceLight },
      colW: [2.0, 10.3],
    },
  )
  footerBar(phases, 'Implementation phases')

  // Microsoft Unified
  const unified = pptx.addSlide()
  headerBar(unified, 'Microsoft Global Delivery — Unified', 'Reach out to your Microsoft representative')
  unified.addText(
    [
      'For Azure Local upskilling workshops, activation, migration delivery, Day-2 operations, and landing zones — work with your Microsoft account team and request a Customer Success Account Manager (CSAM) or Global Delivery Program Lead.',
      '',
      'Reference offerings:',
      '• Microsoft Unified — proactive services and delivery offerings',
      '• Services Hub — catalog of available delivery services',
      '• WorkshopPLUS — guided technical workshops for upskilling teams',
      '• Activation, migration, Day-2 operations, and landing zone services',
      '',
      'Engage your Microsoft representative to scope and align a statement of work.',
    ].join('\n'),
    {
      x: 0.5,
      y: 1.6,
      w: 12.3,
      h: 4.8,
      fontSize: 14,
      color: COLORS.text,
      valign: 'top',
    },
  )
  unified.addText(
    'Microsoft Unified · Services Hub · WorkshopPLUS · CSA / GD Program Lead',
    {
      x: 0.5,
      y: 6.4,
      w: 12.3,
      h: 0.4,
      fontSize: 12,
      color: COLORS.cyan,
      bold: true,
    },
  )
  footerBar(unified, 'Unified')

  // Closing / disclaimer
  const closing = pptx.addSlide()
  headerBar(closing, 'Reference guidance only', 'Disclaimer')
  closing.addText(
    [
      'This open source assistant is not an official Microsoft product, support channel, or commitment.',
      '',
      'The recommendation reflects the inputs you provided and current public Microsoft documentation references for ' +
        `${versionData.azureLocal.label} and ${versionData.windowsServer.label}.`,
      '',
      'Customers still need workload sizing, licensing validation, validated hardware confirmation, identity and security design, networking design, supportability review, and a formal architecture review before any deployment.',
      '',
      `Pricing comparison for Azure-native: ${PRICING_URL}`,
      `Repository / contributing / issues: ${REPO_URL}`,
    ].join('\n'),
    {
      x: 0.5,
      y: 1.6,
      w: 12.3,
      h: 5,
      fontSize: 14,
      color: COLORS.text,
      valign: 'top',
    },
  )
  footerBar(closing, 'Disclaimer')

  await pptx.writeFile({ fileName: 'migration-decision-assistant.pptx' })
}
