export type Kind = 'T' | 'P'

export interface Paper {
  id: string
  se: string
  k: Kind
  ti: string
  et: number
  n: number
}

export interface QOpt {
  l: string
  c: string
}

export interface Question {
  i: string
  no: number
  t: number // 1 单选 2 多选 3 判断 4 实操
  s: string
  o: QOpt[]
  a: string
  an: string
  sc: number
  kp: string[]
}

export interface KpRef {
  p: string
  q: string
  se: string
  no: number
}

export interface KpStat {
  name: string
  count: number
  sessions: number
  refs: KpRef[]
}

export interface HotGroup {
  count: number
  sessions: string[]
  paperId: string
  qid: string
  text: string
}

export interface MetaData {
  papers: Paper[]
  kpStats: KpStat[]
  hot: HotGroup[]
  stats: {
    paperCount: number
    theoryCount: number
    practiceCount: number
    questionCount: number
    kpCount: number
  }
}

export const META: MetaData = {
  papers: [],
  kpStats: [],
  hot: [],
  stats: { paperCount: 0, theoryCount: 0, practiceCount: 0, questionCount: 0, kpCount: 0 },
}

const BASE = (import.meta.env.BASE_URL || '/') + 'data/'
const paperCache = new Map<string, Question[]>()

export async function initData(): Promise<void> {
  if (META.papers.length) return
  const r = await fetch(BASE + 'meta.json')
  if (!r.ok) throw new Error('meta load failed: ' + r.status)
  Object.assign(META, await r.json())
}

export async function getPaperQuestions(paperId: string): Promise<Question[]> {
  const hit = paperCache.get(paperId)
  if (hit) return hit
  const r = await fetch(`${BASE}papers/${paperId}.json`)
  if (!r.ok) throw new Error('paper load failed: ' + r.status)
  const qs = (await r.json()) as Question[]
  paperCache.set(paperId, qs)
  return qs
}

export async function findQuestion(paperId: string, qid: string): Promise<Question | undefined> {
  return (await getPaperQuestions(paperId)).find((q) => q.i === qid)
}

export const sessionLabel = (se: string) =>
  se.length === 6 ? `${se.slice(0, 4)}年${parseInt(se.slice(4), 10)}月` : se

export const typeLabel = (t: number) =>
  ({ 1: '单选题', 2: '多选题', 3: '判断题', 4: '实操题' } as Record<number, string>)[t] ?? '题目'

export const answerText = (q: Question) =>
  q.t === 3 ? (q.a === '1' ? '正确' : '错误') : q.a

export function stripHtml(s: string): string {
  const d = document.createElement('div')
  d.innerHTML = s || ''
  return (d.textContent || '').replace(/\s+/g, ' ').trim()
}

const norm = (x: string) =>
  x
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join(',')

export function gradeAnswer(q: Question, v: string | undefined): boolean {
  if (!v) return false
  if (q.t === 2) return norm(v) === norm(q.a)
  return v.trim() === q.a.trim()
}

export const getTheoryPapers = () => META.papers.filter((p) => p.k === 'T')
export const getPracticePapers = () => META.papers.filter((p) => p.k === 'P')
