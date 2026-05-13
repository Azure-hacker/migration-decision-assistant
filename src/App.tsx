import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Logo } from './components/Logo'
import { RfpSection } from './components/RfpSection'
import { versionData } from './data/versions'
import {
  evaluate,
  isQuestionAnswered,
  isQuestionRequired,
  isStageComplete,
  stageMissingRequired,
  stages,
  stageVisibleCount,
  stageAnsweredCount,
  visibleQuestionsForStage,
  type AnswerSet,
  type AnswerValue,
  type EvaluationResult,
  type PreMigrationPhase,
  type Question,
  type Recommendation,
  type Stage,
  type WizardState,
} from './decisionEngine'
import { buildShareUrl, clearSharedAnswers, readSharedAnswers } from './utils/share'
import { generatePptx } from './utils/pptx'

const RESULT_STEP_ID = 'result'
const RFP_STEP_ID = 'rfp'
const FEEDBACK_URL =
  'https://github.com/Azure-hacker/migration-decision-assistant/issues/new?title=Feedback%3A%20Migration%20Decision%20Assistant&labels=feedback'
const REPO_URL = 'https://github.com/Azure-hacker/migration-decision-assistant'
const PRICING_URL = 'https://azure.microsoft.com/pricing/calculator/'
const THEME_KEY = 'mda-theme'

type Theme = 'dark' | 'light'

const initialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const buildMarkdown = (result: EvaluationResult) => {
  const lines: string[] = [
    '# Migration Decision Assistant – result',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Reference versions: ${versionData.azureLocal.label}, ${versionData.windowsServer.label}`,
    '',
    '## Environment summary',
    ...Object.entries(result.environmentSummary).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Recommendations',
  ]
  for (const rec of result.recommendations) {
    lines.push(`### ${rec.pattern.name}`)
    lines.push(`Role: ${rec.role}`)
    lines.push(`Score: ${rec.score}`)
    if (rec.workloadFocus) lines.push(`Workload focus: ${rec.workloadFocus}`)
    lines.push(rec.pattern.summary)
    lines.push('')
    lines.push('Why:')
    rec.rationale.forEach((r) => lines.push(`- ${r}`))
    lines.push('')
  }

  if (result.hybridRecommended && result.hybridRationale) {
    lines.push('## Hybrid split recommendation')
    lines.push(result.hybridRationale)
    lines.push('')
  }

  if (result.migrationEffort) {
    const me = result.migrationEffort
    lines.push('## Migration effort estimate')
    lines.push(`- Approach: ${me.approachLabel}`)
    lines.push(`- VMs in scope: ${me.totalVmsMigrated}`)
    lines.push(`- Parallel per wave: ${me.parallelPerWave}`)
    lines.push(`- Waves: ${me.waves}`)
    lines.push(`- Estimated effort: ${me.estimatedHours}h engineer time (~${me.totalCalendarWeeks} total calendar weeks including pre-migration)`)
    lines.push(`- Complexity: ${me.complexity}`)
    me.notes.forEach((n) => lines.push(`- Note: ${n}`))
    lines.push('')
  }

  if (result.overlays.length > 0) {
    lines.push('## Workload overlays')
    for (const overlay of result.overlays) {
      lines.push(`### ${overlay.name}`)
      lines.push(overlay.summary)
      overlay.considerations.forEach((c) => lines.push(`- ${c}`))
      lines.push('')
    }
  }

  lines.push('## Decision matrix')
  for (const row of result.decisionMatrix) {
    lines.push(`- ${row.dimension} — ${row.question}`)
    lines.push(`  - Azure Local: ${row.azureLocal}`)
    lines.push(`  - Hyper-V: ${row.hyperV}`)
    lines.push(`  - Lean: ${row.leans}`)
  }
  lines.push('')

  if (result.considerAzureNative) {
    lines.push('## Consider also: Azure-native (cloud-first)')
    result.azureNativeRationale.forEach((r) => lines.push(`- ${r}`))
    lines.push(`- Azure pricing calculator: ${PRICING_URL}`)
    lines.push('')
  }

  lines.push(
    'Disclaimer: open source reference guidance only. Not official Microsoft support. Customers still need sizing, licensing, validated hardware, and architecture review.',
  )

  return lines.join('\n')
}

function PercentInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: AnswerValue
  onChange: (questionId: string, value: AnswerValue) => void
}) {
  const current =
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : question.defaultValue ?? question.min ?? 0
  return (
    <div className="percent-input">
      <div className="percent-bar">
        <span className="percent-windows" style={{ width: `${100 - current}%` }}>
          {100 - current}% Windows
        </span>
        <span className="percent-linux" style={{ width: `${current}%` }}>
          {current}% Linux
        </span>
      </div>
      <input
        max={question.max ?? 100}
        min={question.min ?? 0}
        onChange={(event) => onChange(question.id, Number(event.target.value))}
        step={question.step ?? 5}
        type="range"
        value={current}
      />
      <div className="percent-scale">
        <span>0% Linux</span>
        <span>50/50</span>
        <span>100% Linux</span>
      </div>
    </div>
  )
}

function NumberInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: AnswerValue
  onChange: (questionId: string, value: AnswerValue) => void
}) {
  const display = typeof value === 'number' && Number.isFinite(value) ? value : ''
  return (
    <label className="number-input">
      <span className="number-label">
        {question.unit ? `Value (${question.unit})` : 'Value'}
        {question.optional ? <em> · optional</em> : null}
      </span>
      <input
        inputMode="numeric"
        max={question.max}
        min={question.min}
        onChange={(event) => {
          const next = event.target.value
          if (next === '') {
            onChange(question.id, undefined)
            return
          }
          const parsed = Number(next)
          if (Number.isFinite(parsed)) onChange(question.id, parsed)
        }}
        placeholder={question.placeholder}
        step={question.step}
        type="number"
        value={display}
      />
    </label>
  )
}

function TextInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: AnswerValue
  onChange: (questionId: string, value: AnswerValue) => void
}) {
  const display = typeof value === 'string' ? value : ''
  return (
    <label className="text-input">
      <span className="number-label">
        Free text
        {question.optional ? <em> · optional</em> : null}
      </span>
      <input
        onChange={(event) => onChange(question.id, event.target.value)}
        placeholder={question.placeholder}
        type="text"
        value={display}
      />
    </label>
  )
}

function QuestionCard({
  question,
  value,
  onChange,
  highlightMissing,
}: {
  question: Question
  value: AnswerValue
  onChange: (questionId: string, value: AnswerValue) => void
  highlightMissing: boolean
}) {
  const required = isQuestionRequired(question)
  const answered = isQuestionAnswered(question, value)
  const showRequiredError = required && highlightMissing && !answered
  return (
    <fieldset
      className={
        showRequiredError ? 'question-card missing' : 'question-card'
      }
      data-question-id={question.id}
    >
      <legend>
        <span className="kicker">{question.category}</span>
        {question.prompt}
        {required ? (
          <span className="required-tag">required</span>
        ) : (
          <em className="optional-tag"> Optional</em>
        )}
      </legend>
      {question.helper ? <p className="helper">{question.helper}</p> : null}
      {question.type === 'single' ? (
        <div className="choice-grid">
          {question.choices?.map((choice) => {
            const checked = value === choice.id
            return (
              <label
                className={checked ? 'choice selected' : 'choice'}
                key={choice.id}
              >
                <input
                  checked={checked}
                  name={question.id}
                  onChange={() => onChange(question.id, choice.id)}
                  type="radio"
                  value={choice.id}
                />
                <strong>{choice.label}</strong>
                {choice.description ? <small>{choice.description}</small> : null}
              </label>
            )
          })}
        </div>
      ) : null}
      {question.type === 'number' ? (
        <NumberInput onChange={onChange} question={question} value={value} />
      ) : null}
      {question.type === 'text' ? (
        <TextInput onChange={onChange} question={question} value={value} />
      ) : null}
      {question.type === 'percent' ? (
        <PercentInput onChange={onChange} question={question} value={value} />
      ) : null}
      {showRequiredError ? (
        <p className="required-error">This question must be answered to continue.</p>
      ) : null}
    </fieldset>
  )
}

function DisclaimerBanner({
  visible,
  onDismiss,
}: {
  visible: boolean
  onDismiss: () => void
}) {
  if (!visible) return null
  return (
    <div className="disclaimer-banner" role="alert">
      <div className="disclaimer-text">
        <strong>Open source reference tool.</strong> Not an official Microsoft product or support offering. Always validate with sizing, licensing, validated hardware, and a formal architecture review.
      </div>
      <button className="ghost" onClick={onDismiss} type="button">
        Got it
      </button>
    </div>
  )
}

function SummarySidebar({
  result,
  visible,
  state,
  onJump,
  activeStepId,
  totalAnswered,
  totalVisibleRequired,
}: {
  result: EvaluationResult
  visible: Stage[]
  state: WizardState
  onJump: (id: string) => void
  activeStepId: string
  totalAnswered: number
  totalVisibleRequired: number
}) {
  return (
    <aside className="summary-rail" aria-label="Engagement summary">
      <div className="summary-block">
        <span className="kicker">Engagement summary</span>
        <p className="summary-line">
          {totalAnswered} of {totalVisibleRequired} required answers captured.
        </p>
        <ul className="env-list">
          {result.environmentSummary.sites !== undefined ? (
            <li><span>Sites</span><strong>{result.environmentSummary.sites}</strong></li>
          ) : null}
          {result.environmentSummary.hosts !== undefined ? (
            <li><span>Hosts</span><strong>{result.environmentSummary.hosts}</strong></li>
          ) : null}
          {result.environmentSummary.vms !== undefined ? (
            <li><span>VMs</span><strong>{result.environmentSummary.vms}</strong></li>
          ) : null}
          {result.environmentSummary.cores !== undefined ? (
            <li><span>Cores</span><strong>{result.environmentSummary.cores}</strong></li>
          ) : null}
          {result.environmentSummary.linuxPercent !== undefined ? (
            <li>
              <span>Guest OS</span>
              <strong>
                {result.environmentSummary.linuxPercent}% Linux / {result.environmentSummary.windowsPercent}% Windows
              </strong>
            </li>
          ) : null}
          {result.environmentSummary.virtualDesktops !== undefined ? (
            <li><span>Virtual desktops</span><strong>{result.environmentSummary.virtualDesktops}</strong></li>
          ) : null}
          {result.environmentSummary.targetProduct ? (
            <li><span>Target product</span><strong>{result.environmentSummary.targetProduct}</strong></li>
          ) : null}
        </ul>
      </div>

      <div className="summary-block">
        <span className="kicker">Stages</span>
        <ul className="summary-stages">
          {visible.map((stage) => {
            const answered = stageAnsweredCount(stage, state)
            const total = stageVisibleCount(stage, state)
            const isComplete = isStageComplete(stage, state)
            const isActive = stage.id === activeStepId
            return (
              <li
                className={[
                  'summary-stage',
                  isComplete ? 'complete' : '',
                  isActive ? 'active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={stage.id}
              >
                <button onClick={() => onJump(stage.id)} type="button">
                  <span>{stage.shortTitle}</span>
                  <small>
                    {answered}/{total}
                  </small>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {result.ready ? (
        <div className="summary-block">
          <span className="kicker">Top recommendations</span>
          <ul className="summary-recs">
            {result.recommendations.slice(0, 3).map((rec) => (
              <li key={`${rec.pattern.id}-${rec.role}`}>
                <strong>{rec.pattern.shortName}</strong>
                <small>
                  {rec.role === 'primary'
                    ? 'Primary'
                    : rec.role === 'workload-specific'
                      ? 'Hybrid workload split'
                      : 'Alternative'}
                </small>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="summary-block muted-block">
          <span className="kicker">Recommendation</span>
          <p>Answer the required questions to unlock the deterministic recommendation.</p>
        </div>
      )}
    </aside>
  )
}

function LeanVisualizer({ result }: { result: EvaluationResult }) {
  const lean = result.leanScore
  const knobLeft = `${Math.max(0, Math.min(100, 50 + lean / 2))}%`
  const verdict =
    lean > 15
      ? 'Inputs lean toward Azure Local'
      : lean < -15
        ? 'Inputs lean toward Hyper-V'
        : 'Balanced — both options remain viable'
  return (
    <div className="lean-visualizer">
      <div className="lean-track">
        <span className="lean-end lean-end-hv">
          {versionData.windowsServer.label} — Hyper-V
        </span>
        <div className="lean-bar">
          <div className="lean-knob" style={{ left: knobLeft }} aria-hidden="true" />
        </div>
        <span className="lean-end lean-end-al">{versionData.azureLocal.label}</span>
      </div>
      <div className="lean-meta">
        <span className="lean-score">
          Lean: <strong>{lean > 0 ? `+${lean}` : lean}</strong>
        </span>
        <span className="lean-verdict">{verdict}</span>
      </div>
      <div className="lean-totals">
        <span>Azure Local signal: <strong>{result.azureLocalTotal}</strong></span>
        <span>Hyper-V signal: <strong>{result.hyperVTotal}</strong></span>
        {result.azureNativeAffinity > 0 ? (
          <span>Azure-native affinity: <strong>{result.azureNativeAffinity}</strong></span>
        ) : null}
      </div>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const familyClass = rec.pattern.family === 'azureLocal' ? 'rec-card azure-local' : 'rec-card hyper-v'
  return (
    <article className={familyClass}>
      <header>
        <span className="kicker">
          {rec.role === 'primary'
            ? 'Primary recommendation'
            : rec.role === 'workload-specific'
              ? 'Hybrid split — recommended for'
              : 'Secondary option'}
        </span>
        <h3>{rec.pattern.name}</h3>
        <p className="tagline">{rec.pattern.tagline}</p>
      </header>
      <p>{rec.pattern.summary}</p>
      {rec.workloadFocus ? (
        <p className="workload-focus">
          <strong>Use this for:</strong> {rec.workloadFocus}
        </p>
      ) : null}
      <h4>Why this matched</h4>
      {rec.rationale.length > 0 ? (
        <ul>
          {rec.rationale.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p>No strong rationale signals yet — refine answers to strengthen the match.</p>
      )}
      <div className="rec-grid">
        <div>
          <h5>Best for</h5>
          <ul>
            {rec.pattern.bestFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Watch-outs</h5>
          <ul>
            {rec.pattern.watchOuts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rec-links">
        {rec.pattern.docs.map((doc) => (
          <a href={doc.url} key={doc.url} rel="noreferrer" target="_blank">
            {doc.label} →
          </a>
        ))}
      </div>
    </article>
  )
}

function MigrationEffortCard({ effort }: { effort: import('./decisionEngine').MigrationEffort }) {
  return (
    <section className="result-card">
      <span className="kicker">Migration effort estimate</span>
      <h3>
        {effort.approachLabel}
        {effort.approachPreview ? <span className="preview-tag" style={{ marginLeft: 10 }}>Preview</span> : null}
      </h3>

      <div className="effort-grid">
        <div>
          <span className="kicker">VMs to migrate</span>
          <strong>{effort.totalVmsMigrated}</strong>
        </div>
        <div>
          <span className="kicker">Parallel / wave</span>
          <strong>{effort.parallelPerWave}</strong>
        </div>
        <div>
          <span className="kicker">Migration waves</span>
          <strong>{effort.waves}</strong>
        </div>
        <div>
          <span className="kicker">Engineer effort</span>
          <strong>~{effort.estimatedHours}h</strong>
        </div>
        <div>
          <span className="kicker">Migration execution</span>
          <strong>~{effort.migrationWeeks} wks</strong>
        </div>
        <div>
          <span className="kicker">Total calendar</span>
          <strong style={{ color: 'var(--accent-amber)' }}>~{effort.totalCalendarWeeks} wks</strong>
        </div>
      </div>

      {effort.preMigrationPhases.length > 0 ? (
        <>
          <h4 style={{ marginTop: 20, marginBottom: 10 }}>Implementation phases</h4>
          <div className="phases-table">
            {effort.preMigrationPhases.map((phase: PreMigrationPhase) => (
              <div key={phase.phase} className="phase-row">
                <div className="phase-meta">
                  <span className="phase-name">{phase.phase}</span>
                  <span className="phase-weeks">{phase.weeks} wks</span>
                </div>
                <p className="phase-desc">{phase.description}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {effort.notes.length > 0 ? (
        <ul style={{ marginTop: 14 }}>
          {effort.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}

      <div className="effort-gd-callout">
        <span className="kicker">Microsoft Global Delivery — Unified</span>
        <p>
          For migration delivery on both Azure Local and Hyper-V on Windows Server, Microsoft Global Delivery (Unified) offers structured programs: upskilling workshops (WorkshopPLUS), activation services, landing zone delivery, Day-2 operations, and managed migration waves.
          Reach out to your Microsoft account team and ask to be connected with a <strong>CSA / Global Delivery Program Lead</strong>.
        </p>
        <div className="rec-links">
          <a href="https://www.microsoft.com/en-us/microsoft-unified" rel="noreferrer" target="_blank">Microsoft Unified →</a>
          <a href="https://learn.microsoft.com/en-us/services-hub/unified/services/workshopplus" rel="noreferrer" target="_blank">WorkshopPLUS →</a>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 12 }}>
        Planning estimate only — based on {effort.totalVmsMigrated} VMs at ~{effort.parallelPerWave} VMs/wave, {effort.waves} waves, ~{effort.migrationWeeks} execution weeks + ~{effort.preMigrationWeeks} pre-migration weeks.
        Confirm with formal sizing, validated hardware, staffing plan, and Microsoft / partner delivery teams.
      </p>
    </section>
  )
}


function ResultView({
  result,
  onRestart,
  onShare,
  shareToast,
}: {
  result: EvaluationResult
  onRestart: () => void
  onShare: () => void
  shareToast: string
}) {
  const [pptxState, setPptxState] = useState<'idle' | 'building' | 'done' | 'error'>('idle')
  if (!result.ready) {
    return (
      <div className="result-view">
        <section className="result-card highlighted">
          <h3>More information needed</h3>
          <p>
            Answer the required questions in earlier stages to unlock the deterministic recommendation. The assistant deliberately does not show a recommendation before enough environment data is captured.
          </p>
          <p>Still missing for example:</p>
          <ul>
            {result.readinessGap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    )
  }

  const exportMarkdown = () => downloadFile('migration-decision-result.md', buildMarkdown(result), 'text/markdown')
  const exportJson = () => {
    const replacer = (_key: string, value: unknown) => {
      if (value instanceof Set) return Array.from(value)
      return value
    }
    downloadFile('migration-decision-result.json', JSON.stringify(result, replacer, 2), 'application/json')
  }

  const exportPptx = async () => {
    setPptxState('building')
    try {
      await generatePptx(result)
      setPptxState('done')
      window.setTimeout(() => setPptxState('idle'), 3000)
    } catch (err) {
      console.error(err)
      setPptxState('error')
      window.setTimeout(() => setPptxState('idle'), 4000)
    }
  }

  return (
    <div className="result-view">
      <header className="result-header">
        <div>
          <span className="kicker">Deterministic recommendation</span>
          <h2>{result.recommendations[0]?.pattern.name ?? 'Recommendation pending'}</h2>
          <p>
            Built from {result.answeredCount} of {result.totalQuestions} required answers using {versionData.azureLocal.label} and {versionData.windowsServer.label} reference guidance.
          </p>
        </div>
        <div className="result-actions">
          <button onClick={exportPptx} type="button">
            {pptxState === 'building'
              ? 'Building PPTX…'
              : pptxState === 'done'
                ? 'PPTX downloaded ✓'
                : pptxState === 'error'
                  ? 'PPTX error — retry'
                  : 'Generate report (PPTX)'}
          </button>
          <button onClick={exportMarkdown} type="button">
            Export markdown
          </button>
          <button onClick={exportJson} type="button">
            Export JSON
          </button>
          <button className="ghost" onClick={onShare} type="button">
            {shareToast || 'Copy share link'}
          </button>
          <button className="ghost" onClick={onRestart} type="button">
            Start over
          </button>
        </div>
      </header>

      <section className="result-card">
        <span className="kicker">Where your inputs land</span>
        <h3>Azure Local vs Hyper-V on Windows Server</h3>
        <p>
          Both options remain valid — the slider shows where the captured inputs lean today. Azure-native (cloud-first) is also worth considering for the right workloads.
        </p>
        <LeanVisualizer result={result} />
      </section>

      {result.hybridRecommended && result.hybridRationale ? (
        <section className="result-card highlighted">
          <span className="kicker">Hybrid recommendation</span>
          <h3>Use both platforms — split by workload</h3>
          <p>{result.hybridRationale}</p>
        </section>
      ) : null}

      <section className="rec-grid-outer">
        {result.recommendations.map((rec) => (
          <RecommendationCard key={`${rec.pattern.id}-${rec.role}`} rec={rec} />
        ))}
      </section>

      <section className="result-card">
        <h3>Pros, cons, and when each option fits</h3>
        <p>Use this side-by-side to frame the decision conversation. None of these options are excluded by default.</p>
        <div className="proscons-grid">
          {result.prosCons.map((block) => {
            const cls =
              block.option === 'azureLocal'
                ? 'proscons-card azure-local'
                : block.option === 'hyperV'
                  ? 'proscons-card hyper-v'
                  : 'proscons-card azure-native'
            return (
              <article className={cls} key={block.option}>
                <h4>{block.title}</h4>
                <h5>Pros</h5>
                <ul>
                  {block.pros.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <h5>Cons</h5>
                <ul>
                  {block.cons.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
        <div className="when-grid">
          <div className="when-card al">
            <span className="kicker">Choose Azure Local when</span>
            <ul>
              {result.consideration.whenAzureLocal.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="when-card hv">
            <span className="kicker">Choose Hyper-V when</span>
            <ul>
              {result.consideration.whenHyperV.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="when-card az">
            <span className="kicker">Consider Azure-native when</span>
            <ul>
              {result.consideration.whenAzureNative.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="risks-row">
          <h4>Risks per option</h4>
          <ul>
            {result.consideration.risks.map((r) => (
              <li key={r.option + r.risk}>
                <strong>
                  {r.option === 'azureLocal'
                    ? 'Azure Local'
                    : r.option === 'hyperV'
                      ? 'Hyper-V'
                      : 'Azure-native'}
                  :
                </strong>{' '}
                {r.risk}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {result.containerPlatform ? (
        <section className="result-card">
          <span className="kicker">Container platform guidance</span>
          <h3>
            {result.containerPlatform.recommendation === 'aksOnLocal'
              ? 'AKS on Azure Local fits the captured inputs'
              : result.containerPlatform.recommendation === 'aro'
                ? 'Azure Red Hat OpenShift (ARO) fits the captured inputs'
                : 'Evaluate AKS on Azure Local and ARO together'}
          </h3>
          <ul>
            {result.containerPlatform.rationale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.migrationEffort ? (
        <MigrationEffortCard effort={result.migrationEffort} />
      ) : null}

      {result.overlays.length > 0 ? (
        <section className="result-card">
          <h3>Workload overlays</h3>
          <p>These workloads activated additional considerations.</p>
          <div className="overlay-grid">
            {result.overlays.map((overlay) => (
              <article key={overlay.id} className="overlay-card">
                <h4>{overlay.name}</h4>
                <p>{overlay.summary}</p>
                <ul>
                  {overlay.considerations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="rec-links">
                  {overlay.docs.map((doc) => (
                    <a href={doc.url} key={doc.url} rel="noreferrer" target="_blank">
                      {doc.label} →
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="result-card">
        <h3>Azure Local vs. Hyper-V — decision matrix</h3>
        <p>
          A side-by-side view of the dimensions that drive the choice between Azure Local and Hyper-V on Windows Server, including the IT operations features admins care about most.
        </p>
        <div className="matrix-table">
          <div className="matrix-row matrix-head">
            <div>Dimension</div>
            <div>Decision question</div>
            <div>Azure Local</div>
            <div>Hyper-V</div>
            <div>Your input leans</div>
          </div>
          {result.decisionMatrix.map((row) => (
            <div className="matrix-row" key={row.id}>
              <div className="matrix-dim">{row.dimension}</div>
              <div>{row.question}</div>
              <div>{row.azureLocal}</div>
              <div>{row.hyperV}</div>
              <div className={`leans leans-${row.leans}`}>
                {row.leans === 'azureLocal'
                  ? 'Azure Local'
                  : row.leans === 'hyperV'
                    ? 'Hyper-V'
                    : '—'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.considerAzureNative ? (
        <section className="result-card consider-cloud">
          <span className="kicker">Consider also</span>
          <h3>Azure-native (cloud-first) for the right workloads</h3>
          <ul>
            {result.azureNativeRationale.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>
            <a href={PRICING_URL} rel="noreferrer" target="_blank">
              Open the Azure pricing calculator →
            </a>
          </p>
        </section>
      ) : null}

      <section className="result-card unified-card">
        <span className="kicker">Microsoft Global Delivery — Unified</span>
        <h3>Reach out to your Microsoft representative</h3>
        <p>
          For Azure Local upskilling workshops, activation, migration delivery, Day-2 operations, and landing zone services, work with your Microsoft account team. Ask to be connected with a Customer Success Account Manager (CSAM) or a CSA / Global Delivery Program Lead.
        </p>
        <div className="rec-links">
          <a href="https://www.microsoft.com/en-us/microsoft-unified" rel="noreferrer" target="_blank">
            Microsoft Unified →
          </a>
          <a href="https://learn.microsoft.com/en-us/services-hub/unified/services/" rel="noreferrer" target="_blank">
            Services Hub catalog →
          </a>
          <a href="https://learn.microsoft.com/en-us/services-hub/unified/services/workshopplus" rel="noreferrer" target="_blank">
            WorkshopPLUS engagements →
          </a>
        </div>
      </section>

      <section className="result-card disclaimer">
        <h3>Reference guidance only</h3>
        <p>
          This open source assistant is not an official Microsoft product, support channel, or commitment. The recommendation reflects the inputs you provided and current public Microsoft documentation references for {versionData.azureLocal.label} and {versionData.windowsServer.label}. Customers still need workload sizing, licensing validation, validated hardware confirmation, identity and security design, networking design, supportability review, and a formal architecture review before any deployment.
        </p>
      </section>
    </div>
  )
}

function App() {
  const [answers, setAnswers] = useState<AnswerSet>(() => {
    const shared = readSharedAnswers()
    if (shared) {
      clearSharedAnswers()
      return shared.answers
    }
    return {}
  })
  const [activeStepId, setActiveStepId] = useState<string>(() => {
    const shared = readSharedAnswers()
    if (shared?.goToResult) return RESULT_STEP_ID
    return stages[0].id
  })
  const [theme, setTheme] = useState<Theme>(initialTheme())
  // Disclaimer shows on every page load; dismissed only for this session (no localStorage persist)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true)
  const [navOpen, setNavOpen] = useState(false)
  const [highlightMissing, setHighlightMissing] = useState(false)
  const [shareToast, setShareToast] = useState('')

  const workspaceRef = useRef<HTMLDivElement | null>(null)

  const state: WizardState = useMemo(() => ({ answers }), [answers])
  const result = useMemo(() => evaluate(state), [state])
  const visible = stages

  const steps = useMemo(
    () => [
      ...visible.map((stage) => ({ id: stage.id, label: stage.shortTitle, kind: 'stage' as const, stage })),
      { id: RESULT_STEP_ID, label: 'Result', kind: 'result' as const },
      { id: RFP_STEP_ID, label: 'RFI / RFP · Preview', kind: 'rfp' as const },
    ],
    [visible],
  )

  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStepId))
  const safeStep = steps[activeIndex] ?? steps[steps.length - 1]
  const isResultStep = safeStep.kind === 'result'
  const isRfpStep = safeStep.kind === 'rfp'
  const activeStage = safeStep.kind === 'stage' ? safeStep.stage : undefined

  const totalVisibleRequired = visible.reduce(
    (count, stage) =>
      count +
      visibleQuestionsForStage(stage, state).filter(isQuestionRequired).length,
    0,
  )
  const totalAnswered = visible.reduce(
    (count, stage) =>
      count +
      visibleQuestionsForStage(stage, state).filter(
        (q) => isQuestionRequired(q) && isQuestionAnswered(q, answers[q.id]),
      ).length,
    0,
  )

  const progressPercent = isResultStep
    ? 100
    : isRfpStep
      ? 100
      : Math.min(100, Math.round(((activeIndex + 1) / (steps.length - 1)) * 100))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (typeof window !== 'undefined') window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const navigateToStep = (id: string) => {
    setActiveStepId(id)
    setHighlightMissing(false)
    setNavOpen(false)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    workspaceRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  const goToStep = (id: string) => {
    if (steps.some((step) => step.id === id)) navigateToStep(id)
  }

  const goNext = () => {
    if (activeStage) {
      const missing = stageMissingRequired(activeStage, state)
      if (missing.length > 0) {
        setHighlightMissing(true)
        const first = missing[0]
        const node = document.querySelector(`[data-question-id="${first.id}"]`) as HTMLElement | null
        node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }
    const nextIndex = Math.min(steps.length - 1, activeIndex + 1)
    navigateToStep(steps[nextIndex].id)
  }

  const goBack = () => {
    const prevIndex = Math.max(0, activeIndex - 1)
    navigateToStep(steps[prevIndex].id)
  }

  const updateAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const restart = () => {
    setAnswers({})
    navigateToStep(stages[0].id)
  }

  const dismissDisclaimer = () => {
    setShowDisclaimer(false)
  }

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  const copyShareLink = async () => {
    const url = buildShareUrl(answers)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setShareToast('Share link copied ✓')
    } catch {
      setShareToast('Copy failed — link in console')
      console.log('Share link:', url)
    }
    window.setTimeout(() => setShareToast(''), 2500)
  }

  const headerSubtitle = isRfpStep
    ? 'RFI / RFP companion in preview'
    : isResultStep
      ? 'Result'
      : `Stage ${activeIndex + 1} of ${steps.length - 2}`

  const headerTitle = isRfpStep
    ? 'RFI / RFP companion'
    : isResultStep
      ? 'Recommended path'
      : activeStage?.title ?? ''

  return (
    <div className="app-shell">
      <DisclaimerBanner onDismiss={dismissDisclaimer} visible={showDisclaimer} />

      <button
        aria-label="Toggle navigation"
        className="nav-toggle"
        onClick={() => setNavOpen((open) => !open)}
        type="button"
      >
        ☰ Steps
      </button>

      <aside
        className={navOpen ? 'nav-rail open' : 'nav-rail'}
        aria-label="Wizard navigation"
      >
        <div className="brand">
          <Logo size={44} />
          <div>
            <strong>Migration Decision Assistant</strong>
            <small>Open source · Reference guidance</small>
          </div>
        </div>

        <ol className="nav-stages">
          {steps.map((step, index) => {
            const isActive = step.id === safeStep.id
            const isComplete = step.kind === 'stage' ? isStageComplete(step.stage, state) : false
            const isPreview = step.kind === 'rfp'
            return (
              <li
                className={[
                  'nav-step',
                  isActive ? 'active' : '',
                  isComplete ? 'complete' : '',
                  isPreview ? 'preview' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={step.id}
              >
                <button onClick={() => goToStep(step.id)} type="button">
                  <span className="step-index">{index + 1}</span>
                  <span className="step-label">{step.label}</span>
                  {isPreview ? <span className="preview-tag">Preview</span> : null}
                </button>
              </li>
            )
          })}
        </ol>

        <div className="nav-footer">
          <p>
            Reference versions: <strong>{versionData.azureLocal.label}</strong> ·{' '}
            <strong>{versionData.windowsServer.label}</strong>
          </p>
          <p className="muted">Last refreshed {versionData.lastChecked}</p>
        </div>
      </aside>

      <main className="workspace" ref={workspaceRef}>
        <header className="workspace-header">
          <div>
            <p className="kicker">{headerSubtitle}</p>
            <h1>{headerTitle}</h1>
            {activeStage ? <p>{activeStage.description}</p> : null}
            {isRfpStep ? (
              <p>
                A curated answer bank for sales and pre-sales teams responding to RFI / RFP requests. This module is in preview while we expand coverage.
              </p>
            ) : null}
          </div>
          <div className="header-tools">
            <button
              aria-label="Toggle theme"
              className="ghost icon-button"
              onClick={toggleTheme}
              type="button"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>
            <a className="ghost icon-button" href={FEEDBACK_URL} rel="noreferrer" target="_blank">
              💬 Feedback
            </a>
            <a className="ghost icon-button" href={REPO_URL} rel="noreferrer" target="_blank">
              ★ GitHub
            </a>
          </div>
        </header>

        {!isRfpStep ? (
          <div className="progress">
            <div className="progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <small>
              {totalAnswered} of {totalVisibleRequired} required answers captured
              {isResultStep ? ' — recommendation ready below.' : '.'}
            </small>
          </div>
        ) : null}

        <section className="workspace-body">
          {isRfpStep ? (
            <RfpSection />
          ) : isResultStep ? (
            <ResultView
              onRestart={restart}
              onShare={copyShareLink}
              result={result}
              shareToast={shareToast}
            />
          ) : activeStage ? (
            <div className="questions">
              {visibleQuestionsForStage(activeStage, state).map((question) => (
                <QuestionCard
                  highlightMissing={highlightMissing}
                  key={question.id}
                  onChange={updateAnswer}
                  question={question}
                  value={answers[question.id]}
                />
              ))}
              {highlightMissing ? (
                <p className="missing-banner">
                  Some required questions are not answered yet. Scroll to the highlighted ones above and pick a value before continuing.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <footer className="workspace-footer">
          <button className="ghost" disabled={activeIndex === 0} onClick={goBack} type="button">
            ← Back
          </button>
          <div className="footer-meta">
            <small>
              Open source ·{' '}
              <a href={REPO_URL} rel="noreferrer" target="_blank">
                Contribute on GitHub
              </a>{' '}
              ·{' '}
              <a href={FEEDBACK_URL} rel="noreferrer" target="_blank">
                Open an issue
              </a>
            </small>
            <small className="privacy-note">
              No data you enter is stored or sent anywhere. The tool runs in your browser. You can also clone and run the app locally — see <a href={REPO_URL} rel="noreferrer" target="_blank">the repository</a>.
            </small>
          </div>
          {isResultStep || isRfpStep ? (
            <button onClick={isRfpStep ? () => goToStep(stages[0].id) : restart} type="button">
              {isRfpStep ? 'Back to wizard' : 'Start over'}
            </button>
          ) : (
            <button onClick={goNext} type="button">
              {activeIndex >= steps.length - 3 ? 'View result →' : 'Continue →'}
            </button>
          )}
        </footer>
      </main>

      <SummarySidebar
        activeStepId={activeStepId}
        onJump={goToStep}
        result={result}
        state={state}
        totalAnswered={totalAnswered}
        totalVisibleRequired={totalVisibleRequired}
        visible={visible}
      />
    </div>
  )
}

export default App
