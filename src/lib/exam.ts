import raw from '@/data/examData.json'

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

export interface KpStat {
  name: string
  count: number
  sessions: number
}

export interface HotGroup {
  count: number
  sessions: string[]
  paperId: string
  qid: string
}

export interface ExamData {
  papers: Paper[]
  questions: Record<string, Question[]>
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

export const DATA = raw as unknown as ExamData

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

export function findQuestion(paperId: string, qid: string): Question | undefined {
  return (DATA.questions[paperId] || []).find((q) => q.i === qid)
}

export function questionsForKp(name: string, limit = 8) {
  const out: { paper: Paper; q: Question }[] = []
  const sorted = [...DATA.papers].sort((a, b) => (a.se < b.se ? 1 : -1))
  for (const p of sorted) {
    for (const q of DATA.questions[p.id] || []) {
      if (q.kp.includes(name)) {
        out.push({ paper: p, q })
        if (out.length >= limit) return out
      }
    }
  }
  return out
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

export const theoryPapers = DATA.papers.filter((p) => p.k === 'T')
export const practicePapers = DATA.papers.filter((p) => p.k === 'P')
