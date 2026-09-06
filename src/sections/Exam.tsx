import { useEffect, useMemo, useRef, useState } from 'react'
import type { Paper } from '@/lib/exam'
import { DATA, gradeAnswer, sessionLabel, theoryPapers } from '@/lib/exam'
import QuestionCard from '@/components/QuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Clock, ChevronLeft, PlayCircle, Trophy } from 'lucide-react'

type Phase = 'pick' | 'run' | 'result'

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Exam() {
  const [phase, setPhase] = useState<Phase>('pick')
  const [paper, setPaper] = useState<Paper | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [remaining, setRemaining] = useState(0)
  const [usedSec, setUsedSec] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)

  const questions = useMemo(() => (paper ? DATA.questions[paper.id] || [] : []), [paper])

  useEffect(() => {
    if (phase !== 'run') return
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          setPhase('result')
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  const start = (p: Paper) => {
    setPaper(p)
    setAnswers({})
    setRemaining((p.et || 30) * 60)
    setUsedSec(0)
    setPhase('run')
    window.scrollTo({ top: 0 })
  }

  const submit = () => {
    setUsedSec((paper?.et || 30) * 60 - remaining)
    setPhase('result')
    window.scrollTo({ top: 0 })
  }

  if (phase === 'pick') {
    return (
      <div ref={topRef}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">选择一套理论真题开始模考</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {theoryPapers.length} 套 · 每套 30 题（单选 20 + 多选 5 + 判断 5）· 限时 30 分钟 · 满分 100 分
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {theoryPapers.map((p) => (
            <Card key={p.id} className="transition hover:border-amber-400 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="text-xl font-bold text-slate-800">{sessionLabel(p.se)}</div>
                <div className="text-xs text-muted-foreground">{p.n} 题 · {p.et} 分钟</div>
                <Button size="sm" className="mt-1 w-full bg-amber-500 hover:bg-amber-600" onClick={() => start(p)}>
                  <PlayCircle className="mr-1 h-4 w-4" /> 开始模考
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'run' && paper) {
    const answered = Object.values(answers).filter(Boolean).length
    return (
      <div ref={topRef}>
        <div className="sticky top-0 z-20 -mx-4 mb-4 border-b bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={() => setPhase('pick')}>
              <ChevronLeft className="h-4 w-4" /> 退出
            </Button>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-800">{sessionLabel(paper.se)} 理论真题</div>
              <div className="text-xs text-muted-foreground">已答 {answered}/{questions.length}</div>
            </div>
            <Badge className={`px-3 py-1.5 text-sm font-mono ${remaining < 300 ? 'bg-rose-500' : 'bg-slate-800'}`}>
              <Clock className="mr-1 h-4 w-4" /> {fmt(remaining)}
            </Badge>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.i}
              q={q}
              index={idx}
              mode="exam"
              value={answers[q.i]}
              onChange={(v) => setAnswers((a) => ({ ...a, [q.i]: v }))}
            />
          ))}

          <div className="sticky bottom-4 z-10 flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" className="bg-emerald-600 px-10 shadow-lg hover:bg-emerald-700">
                  交卷（已答 {answered}/{questions.length}）
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认交卷？</AlertDialogTitle>
                  <AlertDialogDescription>
                    {answered < questions.length
                      ? `还有 ${questions.length - answered} 题未作答，未作答题目不得分。`
                      : '全部题目已作答，交卷后立即判分并展示解析。'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>继续答题</AlertDialogCancel>
                  <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700" onClick={submit}>
                    确认交卷
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'result' && paper) {
    const total = questions.reduce((s, q) => s + (q.sc || 0), 0)
    const got = questions.reduce((s, q) => s + (gradeAnswer(q, answers[q.i]) ? q.sc || 0 : 0), 0)
    const right = questions.filter((q) => gradeAnswer(q, answers[q.i])).length
    return (
      <div ref={topRef}>
        <Card className="mx-auto mb-6 max-w-3xl border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10 text-amber-500" />
              <div>
                <div className="text-sm text-muted-foreground">{sessionLabel(paper.se)} 理论真题 · 模考成绩</div>
                <div className="text-3xl font-bold text-slate-800">
                  {got} <span className="text-base font-normal text-muted-foreground">/ {total} 分</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-center text-sm">
              <div>
                <div className="text-xl font-bold text-emerald-600">{right}/{questions.length}</div>
                <div className="text-xs text-muted-foreground">答对题数</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-700">{fmt(usedSec)}</div>
                <div className="text-xs text-muted-foreground">用时</div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setPhase('pick')}>
              <ChevronLeft className="h-4 w-4" /> 返回选卷
            </Button>
          </CardContent>
        </Card>

        <div className="mx-auto max-w-3xl space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard key={q.i} q={q} index={idx} mode="review" value={answers[q.i]} />
          ))}
        </div>
      </div>
    )
  }

  return null
}
