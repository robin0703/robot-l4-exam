import { useMemo, useState } from 'react'
import { DATA, questionsForKp, sessionLabel } from '@/lib/exam'
import QuestionCard from '@/components/QuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

export default function Knowledge() {
  const [kw, setKw] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(
    () => DATA.kpStats.filter((k) => !kw || k.name.toLowerCase().includes(kw.toLowerCase())),
    [kw]
  )
  const max = DATA.kpStats[0]?.count || 1

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">知识点总结 · 按考查频次排序</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            基于 {DATA.stats.theoryCount} 套理论真题的官方考点标注，频次越高越要重点复习。点击考点可查看相关真题。
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

                {expanded && <KpDetail name={k.name} />}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function KpDetail({ name }: { name: string }) {
  const [show, setShow] = useState(false)
  const items = useMemo(() => questionsForKp(name, 6), [name])
  return (
    <div className="mt-4 border-t pt-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">相关真题（最多展示 6 道）</span>
        <Button size="sm" variant="outline" onClick={() => setShow(!show)}>
          {show ? '收起题目' : '展开题目（含答案解析）'}
        </Button>
      </div>
      {show ? (
        <div className="space-y-3">
          {items.map(({ paper, q }) => (
            <div key={q.i}>
              <div className="mb-1 text-xs text-muted-foreground">{sessionLabel(paper.se)}考期 · 第 {q.no} 题</div>
              <QuestionCard q={q} index={q.no - 1} mode="review" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {items.map(({ paper, q }) => (
            <li key={q.i} className="truncate">
              <span className="text-muted-foreground">[{sessionLabel(paper.se)}]</span> 第 {q.no} 题
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
