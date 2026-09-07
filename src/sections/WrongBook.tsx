import { useState } from 'react'
import type { Question } from '@/lib/exam'
import { getPaperQuestions, sessionLabel, gradeAnswer, LEVELS } from '@/lib/exam'
import type { WrongItem } from '@/lib/store'
import { getAttempts, getUser, getWrongs, removeCorrectWrongs } from '@/lib/store'
import QuestionCard from '@/components/QuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { BookX, ChevronLeft, History, Loader2, RefreshCcw, Trophy } from 'lucide-react'

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}分${sec % 60}秒`
}

function fmtDate(ts: number) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function WrongBook() {
  const user = getUser() || ''
  const [wrongs, setWrongs] = useState<WrongItem[]>(() => getWrongs(user))
  const [attempts] = useState(() => getAttempts(user))
  const [showId, setShowId] = useState<string | null>(null)
  const [qMap, setQMap] = useState<Record<string, Question | undefined>>({})

  // 重做模式
  const [redoQs, setRedoQs] = useState<Question[] | null>(null)
  const [redoAns, setRedoAns] = useState<Record<string, string>>({})
  const [redoLoading, setRedoLoading] = useState(false)
  const [redoResult, setRedoResult] = useState<{ right: number; total: number } | null>(null)

  const expand = (w: WrongItem) => {
    const key = w.qid
    if (showId === key) {
      setShowId(null)
      return
    }
    setShowId(key)
    if (qMap[key] !== undefined) return
    getPaperQuestions(w.level, w.paperId).then((qs) =>
      setQMap((m) => ({ ...m, [key]: qs.find((q) => q.i === w.qid) }))
    )
  }

  const startRedo = async () => {
    setRedoLoading(true)
    try {
      const groups = new Map<string, { level: WrongItem['level']; paperId: string; qids: string[] }>()
      for (const w of wrongs) {
        const k = `${w.level}:${w.paperId}`
        if (!groups.has(k)) groups.set(k, { level: w.level, paperId: w.paperId, qids: [] })
        groups.get(k)!.qids.push(w.qid)
      }
      const all: Question[] = []
      await Promise.all(
        [...groups.values()].map(async (g) => {
          const qs = await getPaperQuestions(g.level, g.paperId)
          for (const qid of g.qids) {
            const q = qs.find((x) => x.i === qid)
            if (q) all.push(q)
          }
        })
      )
      all.sort((a, b) => a.t - b.t || a.no - b.no)
      setRedoQs(all)
      setRedoAns({})
      setRedoResult(null)
      window.scrollTo({ top: 0 })
    } finally {
      setRedoLoading(false)
    }
  }

  const submitRedo = () => {
    if (!redoQs) return
    const correct = redoQs.filter((q) => gradeAnswer(q, redoAns[q.i])).map((q) => q.i)
    removeCorrectWrongs(user, correct)
    setRedoResult({ right: correct.length, total: redoQs.length })
    setWrongs(getWrongs(user))
    window.scrollTo({ top: 0 })
  }

  // ---------- 重做结果 ----------
  if (redoQs && redoResult) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10 text-emerald-500" />
              <div>
                <div className="text-sm text-muted-foreground">错题重做结果</div>
                <div className="text-2xl font-bold text-slate-800">
                  做对 {redoResult.right} / {redoResult.total} 题
                </div>
                <p className="mt-1 text-xs text-muted-foreground">做对的题已自动移出错题本，剩下的继续加油！</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setRedoQs(null)}>
              <ChevronLeft className="h-4 w-4" /> 返回错题本
            </Button>
          </CardContent>
        </Card>
        <div className="mt-4 space-y-4">
          {redoQs.map((q, idx) => (
            <QuestionCard key={q.i} q={q} index={idx} mode="review" value={redoAns[q.i]} />
          ))}
        </div>
      </div>
    )
  }

  // ---------- 重做答题中 ----------
  if (redoQs) {
    const answered = Object.values(redoAns).filter(Boolean).length
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">错题重做</h2>
            <p className="text-sm text-muted-foreground">共 {redoQs.length} 题 · 已答 {answered} 题 · 不限时，做对即移出错题本</p>
          </div>
          <Button variant="ghost" onClick={() => setRedoQs(null)}>
            <ChevronLeft className="h-4 w-4" /> 退出
          </Button>
        </div>
        <div className="space-y-4">
          {redoQs.map((q, idx) => (
            <QuestionCard
              key={q.i}
              q={q}
              index={idx}
              mode="exam"
              value={redoAns[q.i]}
              onChange={(v) => setRedoAns((a) => ({ ...a, [q.i]: v }))}
            />
          ))}
        </div>
        <div className="sticky bottom-4 z-10 mt-4 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" className="bg-emerald-600 px-10 shadow-lg hover:bg-emerald-700">
                提交（已答 {answered}/{redoQs.length}）
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认提交？</AlertDialogTitle>
                <AlertDialogDescription>提交后做对的题目将从错题本中移除。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>继续答题</AlertDialogCancel>
                <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700" onClick={submitRedo}>
                  确认提交
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  // ---------- 错题本主页 ----------
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <BookX className="h-5 w-5 text-rose-500" /> {user} 的错题本
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            记录保存在这台电脑的浏览器里 · 当前 {wrongs.length} 道错题 · 已模考 {attempts.length} 次
          </p>
        </div>
        {wrongs.length > 0 && (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={startRedo} disabled={redoLoading}>
            {redoLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-1.5 h-4 w-4" />}
            错题重做（{wrongs.length} 题）
          </Button>
        )}
      </div>

      {wrongs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            🎉 太棒了，目前没有错题！去「真题模考」做套卷子试试吧。
          </CardContent>
        </Card>
      )}

      {wrongs.length > 0 && (
        <div className="space-y-3">
          {wrongs.map((w) => {
            const expanded = showId === w.qid
            const q = qMap[w.qid]
            return (
              <Card key={w.qid}>
                <CardContent className="p-4">
                  <button type="button" className="w-full text-left" onClick={() => expand(w)}>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="secondary">{LEVELS[w.level].short}</Badge>
                      <Badge variant="outline">{sessionLabel(w.se)} · 第 {w.no} 题</Badge>
                      <span>我的答案：<span className="text-rose-600">{w.my || '（未作答）'}</span></span>
                      <span className="ml-auto text-amber-600">{expanded ? '收起 ▲' : '查看题目与解析 ▼'}</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="mt-3 border-t pt-3">
                      {q ? (
                        <QuestionCard q={q} index={q.no - 1} mode="review" value={w.my || undefined} />
                      ) : (
                        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> 正在加载题目…
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {attempts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <History className="h-4 w-4" /> 历史模考记录
            </h3>
            <div className="space-y-2">
              {attempts.slice(0, 20).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{LEVELS[a.level].short}</Badge>
                    <span className="text-slate-700">{sessionLabel(a.se)} 理论真题</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-sm font-bold text-slate-800">{a.score} 分</span>
                    <span>对 {a.right}/{a.count}</span>
                    <span>{fmt(a.usedSec)}</span>
                    <span>{fmtDate(a.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
