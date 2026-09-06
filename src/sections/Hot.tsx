import { useState } from 'react'
import type { Level, Question } from '@/lib/exam'
import { getMeta, findQuestion, sessionLabel } from '@/lib/exam'
import QuestionCard from '@/components/QuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, Loader2 } from 'lucide-react'

export default function Hot({ level }: { level: Level }) {
  const META = getMeta(level)
  const [showId, setShowId] = useState<string | null>(null)
  const [qMap, setQMap] = useState<Record<string, Question | undefined>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const expand = (key: string, paperId: string, qid: string) => {
    if (showId === key) return
    setShowId(key)
    if (qMap[key]) return
    setLoadingId(key)
    findQuestion(level, paperId, qid)
      .then((q) => setQMap((m) => ({ ...m, [key]: q })))
      .finally(() => setLoadingId((cur) => (cur === key ? null : cur)))
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Flame className="h-5 w-5 text-orange-500" /> 高频考题榜
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          在多个考期反复出现的题目（按题干比对去重，共 {META.hot.length} 组）。这些题换个年份还会再考，务必吃透。
        </p>
      </div>

      <div className="space-y-3">
        {META.hot.map((h, rank) => {
          const key = `${h.paperId}-${h.qid}`
          const expanded = showId === key
          const q = qMap[key]
          return (
            <Card key={key} className={rank < 3 ? 'border-orange-300' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      rank < 3 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {rank + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Badge className="bg-orange-500 hover:bg-orange-500">考了 {h.count} 次</Badge>
                      {h.sessions.map((s) => (
                        <Badge key={s} variant="outline" className="text-[11px] font-normal">
                          {sessionLabel(s)}
                        </Badge>
                      ))}
                    </div>
                    {expanded ? (
                      loadingId === key ? (
                        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> 正在加载题目…
                        </div>
                      ) : q ? (
                        <QuestionCard q={q} index={q.no - 1} mode="review" />
                      ) : (
                        <p className="text-sm text-rose-600">题目加载失败，请重试</p>
                      )
                    ) : (
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => expand(key, h.paperId, h.qid)}
                      >
                        <p className="line-clamp-2 text-sm text-slate-700">{h.text}</p>
                        <span className="mt-1 inline-block text-xs text-amber-600">点击查看题目与答案解析 →</span>
                      </button>
                    )}
                    {expanded && (
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowId(null)}>
                        收起
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
