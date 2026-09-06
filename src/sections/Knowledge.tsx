import { useMemo, useState } from 'react'
import type { KpRef, Question } from '@/lib/exam'
import { META, getPaperQuestions, sessionLabel } from '@/lib/exam'
import QuestionCard from '@/components/QuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'

export default function Knowledge() {
  const [kw, setKw] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(
    () => META.kpStats.filter((k) => !kw || k.name.toLowerCase().includes(kw.toLowerCase())),
    [kw]
  )
  const max = META.kpStats[0]?.count || 1

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">知识点总结 · 按考查频次排序</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            基于 {META.stats.theoryCount} 套理论真题的官方考点标注，频次越高越要重点复习。点击考点可查看相关真题。
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="搜索考点…" value={kw} onChange={(e) => setKw(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        {list.map((k, i) => {
          const expanded = open === k.name
          return (
            <Card key={k.name} className={expanded ? 'border-amber-300' : ''}>
              <CardContent className="p-4">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 text-left"
                  onClick={() => setOpen(expanded ? null : k.name)}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold ${
                      i < 10 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">{k.name}</div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: `${Math.max(4, (k.count / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{k.count} 题</Badge>
                  <Badge variant="outline" className="shrink-0 text-[11px]">{k.sessions} 个考期</Badge>
                  {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>

                {expanded && <KpDetail refs={k.refs} />}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

interface RefItem {
  ref: KpRef
  q?: Question
}

function KpDetail({ refs }: { refs: KpRef[] }) {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<RefItem[]>(refs.map((ref) => ({ ref })))

  const load = async () => {
    if (show) {
      setShow(false)
      return
    }
    setShow(true)
    if (items.every((it) => it.q)) return
    setLoading(true)
    try {
      const paperIds = [...new Set(refs.map((r) => r.p))]
      const packs = await Promise.all(paperIds.map((id) => getPaperQuestions(id)))
      const byPaper = new Map(paperIds.map((id, idx) => [id, packs[idx]]))
      setItems(refs.map((ref) => ({ ref, q: byPaper.get(ref.p)?.find((q) => q.i === ref.q) })))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 border-t pt-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">相关真题（最多展示 6 道）</span>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
          {show ? '收起题目' : '展开题目（含答案解析）'}
        </Button>
      </div>
      {show ? (
        loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> 正在加载题目…
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ ref, q }) => (
              <div key={ref.q}>
                <div className="mb-1 text-xs text-muted-foreground">
                  {sessionLabel(ref.se)}考期 · 第 {ref.no} 题
                </div>
                {q && <QuestionCard q={q} index={q.no - 1} mode="review" />}
              </div>
            ))}
          </div>
        )
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {refs.map((r) => (
            <li key={r.q} className="truncate">
              <span className="text-muted-foreground">[{sessionLabel(r.se)}]</span> 第 {r.no} 题
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
