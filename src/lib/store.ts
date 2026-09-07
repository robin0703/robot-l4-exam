import type { Level, Paper, Question } from './exam'
import { gradeAnswer } from './exam'

// ---------- 登录 ----------
const USER_KEY = 'rlx_user'

export function getUser(): string | null {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export function setUser(name: string) {
  localStorage.setItem(USER_KEY, name)
}

export function logout() {
  localStorage.removeItem(USER_KEY)
}

// ---------- 做题记录 ----------
export interface Attempt {
  id: string
  level: Level
  paperId: string
  se: string
  score: number
  total: number
  right: number
  count: number
  usedSec: number
  date: number
  redo?: boolean
}

export interface WrongItem {
  level: Level
  paperId: string
  qid: string
  se: string
  no: number
  my: string
  date: number
}

const attemptsKey = (name: string) => `rlx_attempts_${name}`
const wrongsKey = (name: string) => `rlx_wrongs_${name}`

export function getAttempts(name: string): Attempt[] {
  try {
    return JSON.parse(localStorage.getItem(attemptsKey(name)) || '[]')
  } catch {
    return []
  }
}

export function getWrongs(name: string): WrongItem[] {
  try {
    const m = JSON.parse(localStorage.getItem(wrongsKey(name)) || '{}')
    return Object.values(m) as WrongItem[]
  } catch {
    return []
  }
}

/** 交卷时保存成绩 + 错题。返回本次成绩。 */
export function saveAttempt(
  name: string,
  level: Level,
  paper: Paper,
  questions: Question[],
  answers: Record<string, string>,
  usedSec: number
): Attempt {
  const total = questions.reduce((s, q) => s + (q.sc || 0), 0)
  const score = questions.reduce((s, q) => s + (gradeAnswer(q, answers[q.i]) ? q.sc || 0 : 0), 0)
  const right = questions.filter((q) => gradeAnswer(q, answers[q.i])).length

  const attempt: Attempt = {
    id: `${Date.now()}`,
    level,
    paperId: paper.id,
    se: paper.se,
    score,
    total,
    right,
    count: questions.length,
    usedSec,
    date: Date.now(),
  }
  const attempts = getAttempts(name)
  attempts.unshift(attempt)
  localStorage.setItem(attemptsKey(name), JSON.stringify(attempts.slice(0, 200)))

  // 错题 upsert（key: qid）
  let wrongsMap: Record<string, WrongItem> = {}
  try {
    wrongsMap = JSON.parse(localStorage.getItem(wrongsKey(name)) || '{}')
  } catch {
    wrongsMap = {}
  }
  for (const q of questions) {
    if (!gradeAnswer(q, answers[q.i])) {
      wrongsMap[q.i] = {
        level,
        paperId: paper.id,
        qid: q.i,
        se: paper.se,
        no: q.no,
        my: answers[q.i] || '',
        date: Date.now(),
      }
    } else {
      // 本次做对了，移出错题本（避免旧的误判/旧作答残留）
      delete wrongsMap[q.i]
    }
  }
  localStorage.setItem(wrongsKey(name), JSON.stringify(wrongsMap))
  return attempt
}

/** 错题重做后，把做对的题移出错题本 */
export function removeCorrectWrongs(name: string, qids: string[]) {
  let wrongsMap: Record<string, WrongItem> = {}
  try {
    wrongsMap = JSON.parse(localStorage.getItem(wrongsKey(name)) || '{}')
  } catch {
    return
  }
  for (const id of qids) delete wrongsMap[id]
  localStorage.setItem(wrongsKey(name), JSON.stringify(wrongsMap))
}
