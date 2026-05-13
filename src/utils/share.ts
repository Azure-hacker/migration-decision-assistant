import type { AnswerSet } from '../decisionEngine'

const SHARE_PARAM = 'a'

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
  return url.toString()
}

export const readSharedAnswers = (): AnswerSet | null => {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const value = url.searchParams.get(SHARE_PARAM)
  if (!value) return null
  return decodeAnswers(value)
}

export const clearSharedAnswers = () => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has(SHARE_PARAM)) return
  url.searchParams.delete(SHARE_PARAM)
  window.history.replaceState({}, '', url.toString())
}
