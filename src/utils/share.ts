import type { AnswerSet } from '../decisionEngine'

const SHARE_PARAM = 'a'
const RESULT_PARAM = 'r'

const encodeAnswers = (answers: AnswerSet) => {
  const json = JSON.stringify(answers)
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(json)))
  }
  return ''
}

const decodeAnswers = (value: string): AnswerSet | null => {
  try {
    const json = decodeURIComponent(escape(atob(value)))
    const parsed = JSON.parse(json)
    if (parsed && typeof parsed === 'object') return parsed as AnswerSet
  } catch {
    return null
  }
  return null
}

export const buildShareUrl = (answers: AnswerSet) => {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  url.searchParams.set(SHARE_PARAM, encodeAnswers(answers))
  url.searchParams.set(RESULT_PARAM, '1')
  return url.toString()
}

export type SharedState = { answers: AnswerSet; goToResult: boolean }

export const readSharedAnswers = (): SharedState | null => {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const value = url.searchParams.get(SHARE_PARAM)
  if (!value) return null
  const answers = decodeAnswers(value)
  if (!answers) return null
  const goToResult = url.searchParams.get(RESULT_PARAM) === '1'
  return { answers, goToResult }
}

export const clearSharedAnswers = () => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has(SHARE_PARAM)) return
  url.searchParams.delete(SHARE_PARAM)
  url.searchParams.delete(RESULT_PARAM)
  window.history.replaceState({}, '', url.toString())
}
