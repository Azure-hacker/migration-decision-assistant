import { useMemo, useState } from 'react'
import './App.css'
import {
  evaluate,
  isStageComplete,
  platforms,
  stages,
  visibleStages,
  type AnswerSet,
  type EvaluationResult,
  type Question,
  type Stage,
  type WizardState,
} from './decisionEngine'

const RESULT_STEP_ID = 'result'

const formatProgress = (current: number, total: number) =>
  total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100))

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
  const lines = [
    '# Migration Decision Assistant result',
    '',
    `Recommended platform: ${result.primary.name}`,
    `Confidence: ${result.confidence}`,
    '',
    '## Why this recommendation',
    ...result.primaryScore.rationales.map((rationale) => `- ${rationale}`),
    '',
  ]

  if (result.azureLocalRecommended) {
    lines.push(
      '## Recommended Azure Local deployment type',
      `${result.azureLocalRecommended.name}`,
      '',
      result.azureLocalRecommended.summary,
      '',
      `When to choose: ${result.azureLocalRecommended.whenToChoose}`,
      '',
    )
  }

  if (result.overlays.length > 0) {
    lines.push('## Workload overlays')
    for (const overlay of result.overlays) {
      lines.push(`### ${overlay.name}`)
      lines.push(overlay.summary)
      for (const consideration of overlay.considerations) {
        lines.push(`- ${consideration}`)
      }
      lines.push('')
    }
  }

  lines.push('## Architecture considerations')
  for (const consideration of result.considerations) {
    lines.push(`- ${consideration}`)
  }
  lines.push('')

  lines.push('## Next steps')
  for (const step of result.nextSteps) {
    lines.push(`- ${step}`)
  }
  lines.push('')

  lines.push('## Documentation')
  for (const link of result.documentationLinks) {
    lines.push(`- ${link.label}: ${link.url}`)
  }
  lines.push('')

  lines.push('## Microsoft guidance')
  for (const block of result.microsoftGuidance) {
    lines.push(`### ${block.title}`)
    lines.push(block.description)
    for (const link of block.links) {
      lines.push(`- ${link.label}: ${link.url}`)
    }
    lines.push('')
  }

  lines.push('## Answers')
  for (const answer of result.answeredQuestions) {
    lines.push(`- ${answer.stage} — ${answer.question}: ${answer.choice}`)
  }
  lines.push('')

  lines.push(
    'Disclaimer: this assistant provides reference guidance only. Customers still need sizing, licensing, validated hardware, and a formal architecture review before any deployment.',
  )

  return lines.join('\n')
}

const QuestionCard = ({
  question,
  answer,
  onAnswer,
}: {
  question: Question
  answer: string | undefined
  onAnswer: (questionId: string, choiceId: string) => void
}) => (
  <fieldset className="question-card">
    <legend>
      <span>{question.category}</span>
      {question.prompt}
    </legend>
    {question.helper ? <p className="helper">{question.helper}</p> : null}
    <div className="choice-grid">
      {question.choices.map((choice) => (
        <label
          className={choice.id === answer ? 'choice selected' : 'choice'}
          key={choice.id}
        >
          <input
            checked={choice.id === answer}
            name={question.id}
            onChange={() => onAnswer(question.id, choice.id)}
            type="radio"
            value={choice.id}
          />
          <strong>{choice.label}</strong>
          <small>{choice.description}</small>
        </label>
      ))}
    </div>
  </fieldset>
)

const ScoreBar = ({
  score,
  maxScore,
}: {
  score: number
  maxScore: number
}) => {
  const safeMax = Math.max(maxScore, 1)
  const normalized = Math.max(0, score)
  const width = Math.max(6, Math.round((normalized / safeMax) * 100))
  return (
    <div className="score-bar" aria-label={`${score} points`}>
      <span style={{ width: `${width}%` }} />
    </div>
  )
}

const SummarySidebar = ({
  result,
  visible,
  state,
  totalAnswered,
}: {
  result: EvaluationResult
  visible: Stage[]
  state: WizardState
  totalAnswered: number
}) => {
  const maxScore = Math.max(...result.scores.map((score) => score.total), 1)
  return (
    <aside className="summary-rail" aria-label="Recommendation summary">
      <div className="summary-block">
        <span className="kicker">Current recommendation</span>
        <h3>{result.primary.name}</h3>
        <p>{result.primary.tagline}</p>
        <div className="confidence-pill">{result.confidence} confidence</div>
      </div>

      <div className="summary-block">
        <span className="kicker">Live scoring</span>
        <ul className="score-list">
          {result.scores.map((score) => (
            <li key={score.platform.id}>
              <div className="score-row">
                <strong>{score.platform.name}</strong>
                <span>{score.total}</span>
              </div>
              <ScoreBar maxScore={maxScore} score={score.total} />
            </li>
          ))}
        </ul>
      </div>

      {result.overlays.length > 0 ? (
        <div className="summary-block">
          <span className="kicker">Active workload overlays</span>
          <ul className="tag-list">
            {result.overlays.map((overlay) => (
              <li key={overlay.id}>{overlay.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="summary-block">
        <span className="kicker">Progress</span>
        <p className="progress-text">
          {totalAnswered} of {visible.reduce((count, stage) => count + stage.questions.length, 0)} questions answered
          {' · '}
          {visible.filter((stage) => isStageComplete(stage, state)).length} of {visible.length} stages complete
        </p>
      </div>
    </aside>
  )
}

const ResultView = ({
  result,
  onRestart,
}: {
  result: EvaluationResult
  onRestart: () => void
}) => {
  const exportMarkdown = () => {
    downloadFile(
      'migration-decision-result.md',
      buildMarkdown(result),
      'text/markdown',
    )
  }
  const exportJson = () => {
    downloadFile(
      'migration-decision-result.json',
      JSON.stringify(result, null, 2),
      'application/json',
    )
  }

  return (
    <div className="result-view">
      <header className="result-header">
        <div>
          <span className="kicker">Recommended platform</span>
          <h2>{result.primary.name}</h2>
          <p>{result.primary.summary}</p>
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

      <section className="result-card">
        <h3>Why this was recommended</h3>
        {result.primaryScore.rationales.length > 0 ? (
          <ul>
            {result.primaryScore.rationales.map((rationale) => (
              <li key={rationale}>{rationale}</li>
            ))}
          </ul>
        ) : (
          <p>
            The current answers do not yet produce strong rationale signals. Continue answering the questions to refine the recommendation.
          </p>
        )}
      </section>

      {result.azureLocalRecommended ? (
        <section className="result-card highlighted">
          <span className="kicker">Recommended Azure Local deployment</span>
          <h3>{result.azureLocalRecommended.name}</h3>
          <p>{result.azureLocalRecommended.summary}</p>
          <p className="strong-line">{result.azureLocalRecommended.whenToChoose}</p>
          <h4>Design considerations</h4>
          <ul>
            {result.azureLocalRecommended.considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.overlays.length > 0 ? (
        <section className="result-card">
          <h3>Workload overlays</h3>
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
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="result-card">
        <h3>Architecture considerations</h3>
        <ul>
          {result.considerations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="result-card">
        <h3>Recommended next steps</h3>
        <ol>
          {result.nextSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="result-card">
        <h3>Documentation referenced</h3>
        <ul className="link-list">
          {result.documentationLinks.map((link) => (
            <li key={link.id}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
              <small>{link.description}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="result-card">
        <h3>Microsoft guidance</h3>
        <div className="guidance-grid">
          {result.microsoftGuidance.map((block) => (
            <article key={block.id}>
              <h4>{block.title}</h4>
              <p>{block.description}</p>
              <ul className="link-list">
                {block.links.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="result-card alternatives">
        <h3>How the platforms compared</h3>
        <div className="alt-grid">
          {result.scores.map((score) => (
            <article
              key={score.platform.id}
              className={
                score.platform.id === result.primary.id
                  ? 'alt-card recommended'
                  : 'alt-card'
              }
            >
              <header>
                <span className="kicker">{score.platform.tagline}</span>
                <h4>{score.platform.name}</h4>
              </header>
              <p>{score.platform.summary}</p>
              <dl>
                <div>
                  <dt>Score</dt>
                  <dd>{score.total}</dd>
                </div>
                <div>
                  <dt>Best fit</dt>
                  <dd>{score.platform.bestFit}</dd>
                </div>
                <div>
                  <dt>Watch-out</dt>
                  <dd>{score.platform.watchOut}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="result-card disclaimer">
        <h3>Reference guidance disclaimer</h3>
        <p>
          This Migration Decision Assistant provides reference guidance based on the answers you supplied. It does not replace formal architecture review. Customers still need workload sizing, licensing validation, validated hardware confirmation, identity and security design, networking design, supportability review, and a formal architecture review before any deployment.
        </p>
      </section>
    </div>
  )
}

function App() {
  const [answers, setAnswers] = useState<AnswerSet>({})
  const [activeStepId, setActiveStepId] = useState<string>(stages[0].id)

  const state: WizardState = useMemo(() => ({ answers }), [answers])
  const result = useMemo(() => evaluate(state), [state])
  const visible = useMemo(() => visibleStages(state), [state])

  const steps = useMemo(() => {
    return [
      ...visible.map((stage) => ({ id: stage.id, label: stage.shortTitle, kind: 'stage' as const, stage })),
      { id: RESULT_STEP_ID, label: 'Result', kind: 'result' as const },
    ]
  }, [visible])

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId),
  )

  const safeActiveStep = steps[activeIndex] ?? steps[steps.length - 1]
  const isResultStep = safeActiveStep.kind === 'result'
  const activeStage = safeActiveStep.kind === 'stage' ? safeActiveStep.stage : undefined

  const totalAnswered = Object.values(answers).filter(Boolean).length
  const totalApplicable = visible.reduce((count, stage) => count + stage.questions.length, 0)
  const progressPercent = isResultStep
    ? 100
    : formatProgress(activeIndex, steps.length - 1)

  const goNext = () => {
    const nextIndex = Math.min(steps.length - 1, activeIndex + 1)
    setActiveStepId(steps[nextIndex].id)
  }

  const goBack = () => {
    const prevIndex = Math.max(0, activeIndex - 1)
    setActiveStepId(steps[prevIndex].id)
  }

  const goToStep = (stepId: string) => {
    if (steps.some((step) => step.id === stepId)) {
      setActiveStepId(stepId)
    }
  }

  const updateAnswer = (questionId: string, choiceId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: choiceId }))
  }

  const restart = () => {
    setAnswers({})
    setActiveStepId(stages[0].id)
  }

  return (
    <div className="app-shell">
      <aside className="nav-rail" aria-label="Wizard navigation">
        <div className="brand">
          <span className="brand-mark">MDA</span>
          <div>
            <strong>Migration Decision Assistant</strong>
            <small>Deterministic platform guidance</small>
          </div>
        </div>

        <ol className="nav-stages">
          {steps.map((step, index) => {
            const isActive = step.id === safeActiveStep.id
            const isComplete =
              step.kind === 'stage' ? isStageComplete(step.stage, state) : false
            const reached = index <= activeIndex

            return (
              <li
                key={step.id}
                className={[
                  'nav-step',
                  isActive ? 'active' : '',
                  isComplete ? 'complete' : '',
                  reached ? 'reached' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
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
            Reference guidance only. Customers still need sizing, licensing, validated hardware, and architecture review.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="kicker">
              {isResultStep ? 'Result' : `Stage ${activeIndex + 1} of ${steps.length - 1}`}
            </p>
            <h1>
              {isResultStep ? 'Recommended path' : activeStage?.title}
            </h1>
            {activeStage ? <p>{activeStage.description}</p> : null}
          </div>

          <div className="progress">
            <div className="progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <small>
              {totalAnswered} of {totalApplicable} questions answered
            </small>
          </div>
        </header>

        <section className="workspace-body">
          {isResultStep ? (
            <ResultView result={result} onRestart={restart} />
          ) : activeStage ? (
            <div className="questions">
              {activeStage.questions.map((question) => (
                <QuestionCard
                  answer={answers[question.id]}
                  key={question.id}
                  onAnswer={updateAnswer}
                  question={question}
                />
              ))}
            </div>
          ) : null}
        </section>

        <footer className="workspace-footer">
          <button
            className="ghost"
            disabled={activeIndex === 0}
            onClick={goBack}
            type="button"
          >
            Back
          </button>
          <div className="footer-meta">
            <small>
              Platforms evaluated: {platforms.map((platform) => platform.name).join(' · ')}
            </small>
          </div>
          {isResultStep ? (
            <button onClick={restart} type="button">
              Start over
            </button>
          ) : (
            <button onClick={goNext} type="button">
              {activeIndex >= steps.length - 2 ? 'View result' : 'Continue'}
            </button>
          )}
        </footer>
      </main>

      <SummarySidebar
        result={result}
        state={state}
        totalAnswered={totalAnswered}
        visible={visible}
      />
    </div>
  )
}

export default App
