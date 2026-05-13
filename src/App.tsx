import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Logo } from './components/Logo'
import { versionData } from './data/versions'
import {
  evaluate,
  isStageComplete,
  stageAnsweredCount,
  stages,
  totalRequiredQuestions,
  type AnswerSet,
  type AnswerValue,
  type EvaluationResult,
  type Question,
  type Recommendation,
  type Stage,
  type WizardState,
} from './decisionEngine'

const RESULT_STEP_ID = 'result'
const FEEDBACK_URL =
  'https://github.com/Azure-hacker/migration-decision-assistant/issues/new?title=Feedback%3A%20Migration%20Decision%20Assistant&labels=feedback'
const REPO_URL = 'https://github.com/Azure-hacker/migration-decision-assistant'
const PRICING_URL = 'https://azure.microsoft.com/pricing/calculator/'
const THEME_KEY = 'mda-theme'
const DISMISS_KEY = 'mda-disclaimer-dismissed'

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
  }
  lines.push('')

  if (result.considerAzureNative) {
    lines.push('## Consider also: Azure-native (cloud-first)')
    result.azureNativeRationale.forEach((r) => lines.push(`- ${r}`))
    lines.push(`- Azure pricing calculator: ${PRICING_URL}`)
    lines.push('')
  }

  lines.push(
    'Disclaimer: open source reference guidance only. Not official Microsoft support. Customers still need sizing, licensing, validated hardware, identity, security, networking, supportability, and a formal architecture review before any deployment.',
  )

  return lines.join('\n')
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
}: {
  question: Question
  value: AnswerValue
  onChange: (questionId: string, value: AnswerValue) => void
}) {
  return (
    <fieldset className="question-card">
      <legend>
        <span className="kicker">{question.category}</span>
        {question.prompt}
        {question.optional ? <em className="optional-tag"> Optional</em> : null}
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
      <div>
        <strong>Open source reference tool.</strong> This assistant is a community-built guide for scoping conversations. It is not an official Microsoft product or support offering. Always validate the recommendation with sizing, licensing, validated hardware, and a formal architecture review.
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
}: {
  result: EvaluationResult
  visible: Stage[]
  state: WizardState
  onJump: (id: string) => void
  activeStepId: string
  totalAnswered: number
}) {
  return (
    <aside className="summary-rail" aria-label="Engagement summary">
      <div className="summary-block">
        <span className="kicker">Engagement summary</span>
        <p className="summary-line">
          {totalAnswered} of {totalRequiredQuestions} required answers captured.
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
          {result.environmentSummary.virtualDesktops !== undefined ? (
            <li><span>Virtual desktops</span><strong>{result.environmentSummary.virtualDesktops}</strong></li>
          ) : null}
          {result.environmentSummary.guestOs ? (
            <li><span>Guest OS mix</span><strong>{result.environmentSummary.guestOs}</strong></li>
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
            const total = stage.questions.length
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
              <li key={rec.pattern.id}>
                <strong>{rec.pattern.shortName}</strong>
                <small>{rec.role === 'primary' ? 'Primary' : rec.role === 'workload-specific' ? 'Hybrid workload split' : 'Alternative'}</small>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="summary-block muted-block">
          <span className="kicker">Recommendation</span>
          <p>
            Answer at least {Math.ceil(totalRequiredQuestions * 0.6)} required questions to unlock the deterministic recommendation.
          </p>
        </div>
      )}
    </aside>
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

function ResultView({
  result,
  onRestart,
}: {
  result: EvaluationResult
  onRestart: () => void
}) {
  if (!result.ready) {
    return (
      <div className="result-view">
        <section className="result-card highlighted">
          <h3>More information needed</h3>
          <p>
            Answer the questions in earlier stages to unlock the deterministic recommendation. The assistant deliberately does not show a recommendation before enough environment data is captured.
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
          <button onClick={exportMarkdown} type="button">
            Export markdown
          </button>
          <button onClick={exportJson} type="button">
            Export JSON
          </button>
          <button className="ghost" onClick={onRestart} type="button">
            Start over
          </button>
        </div>
      </header>

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
          A side-by-side view of the dimensions that drive the choice between Azure Local and Hyper-V on Windows Server. The
          final row shows where your inputs lean.
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
          For Azure Local upskilling workshops, activation, migration delivery, Day-2 operations, and landing zone services, work with your Microsoft account team and Microsoft Unified delivery teams.
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
  const [answers, setAnswers] = useState<AnswerSet>({})
  const [activeStepId, setActiveStepId] = useState<string>(stages[0].id)
  const [theme, setTheme] = useState<Theme>(initialTheme())
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(DISMISS_KEY) !== '1'
  })

  const workspaceRef = useRef<HTMLDivElement | null>(null)

  const state: WizardState = useMemo(() => ({ answers }), [answers])
  const result = useMemo(() => evaluate(state), [state])
  const visible = stages

  const steps = useMemo(
    () => [
      ...visible.map((stage) => ({ id: stage.id, label: stage.shortTitle, kind: 'stage' as const, stage })),
      { id: RESULT_STEP_ID, label: 'Result', kind: 'result' as const },
    ],
    [visible],
  )

  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStepId))
  const safeStep = steps[activeIndex] ?? steps[steps.length - 1]
  const isResultStep = safeStep.kind === 'result'
  const activeStage = safeStep.kind === 'stage' ? safeStep.stage : undefined

  const totalApplicable = visible.reduce((count, stage) => count + stage.questions.length, 0)
  const totalAnswered = Object.entries(answers).filter(([key, value]) => {
    const question = visible.flatMap((stage) => stage.questions).find((q) => q.id === key)
    if (!question) return false
    if (question.type === 'number') return typeof value === 'number' && Number.isFinite(value)
    if (question.type === 'text') return typeof value === 'string' && value.trim().length > 0
    return typeof value === 'string' && value.length > 0
  }).length

  const progressPercent = isResultStep
    ? 100
    : Math.min(100, Math.round(((activeIndex + 1) / steps.length) * 100))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (typeof window !== 'undefined') window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    workspaceRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' })
  }, [activeStepId])

  const goNext = () => {
    const nextIndex = Math.min(steps.length - 1, activeIndex + 1)
    setActiveStepId(steps[nextIndex].id)
  }

  const goBack = () => {
    const prevIndex = Math.max(0, activeIndex - 1)
    setActiveStepId(steps[prevIndex].id)
  }

  const goToStep = (id: string) => {
    if (steps.some((step) => step.id === id)) setActiveStepId(id)
  }

  const updateAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const restart = () => {
    setAnswers({})
    setActiveStepId(stages[0].id)
  }

  const dismissDisclaimer = () => {
    setShowDisclaimer(false)
    if (typeof window !== 'undefined') window.localStorage.setItem(DISMISS_KEY, '1')
  }

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return (
    <div className="app-shell">
      <DisclaimerBanner onDismiss={dismissDisclaimer} visible={showDisclaimer} />

      <aside className="nav-rail" aria-label="Wizard navigation">
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
            return (
              <li
                className={[
                  'nav-step',
                  isActive ? 'active' : '',
                  isComplete ? 'complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={step.id}
              >
                <button onClick={() => goToStep(step.id)} type="button">
                  <span className="step-index">{index + 1}</span>
                  <span className="step-label">{step.label}</span>
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
            <p className="kicker">
              {isResultStep ? 'Result' : `Stage ${activeIndex + 1} of ${steps.length - 1}`}
            </p>
            <h1>{isResultStep ? 'Recommended path' : activeStage?.title}</h1>
            {activeStage ? <p>{activeStage.description}</p> : null}
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

        <div className="progress">
          <div className="progress-bar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>
            {totalAnswered} of {totalApplicable} questions answered ·{' '}
            {Math.min(100, Math.round((totalAnswered / Math.max(totalRequiredQuestions, 1)) * 100))}% of required inputs
          </small>
        </div>

        <section className="workspace-body">
          {isResultStep ? (
            <ResultView onRestart={restart} result={result} />
          ) : activeStage ? (
            <div className="questions">
              {activeStage.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  onChange={updateAnswer}
                  question={question}
                  value={answers[question.id]}
                />
              ))}
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
          </div>
          {isResultStep ? (
            <button onClick={restart} type="button">
              Start over
            </button>
          ) : (
            <button onClick={goNext} type="button">
              {activeIndex >= steps.length - 2 ? 'View result →' : 'Continue →'}
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
        visible={visible}
      />
    </div>
  )
}

export default App
