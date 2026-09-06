import { useState } from 'react'
import { DATA, practicePapers, sessionLabel } from '@/lib/exam'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, ChevronDown, ChevronUp } from 'lucide-react'

function Html({ html, className }: { html: string; className?: string }) {
  return <div className={`qhtml ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />
}

export default function Practice() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Wrench className="h-5 w-5 text-amber-600" /> 实操真题专区
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {practicePapers.length} 套实际操作真题。实操考试 60 分钟，现场搭建 + 编程调试，先看懂任务要求和评分标准再动手。
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {practicePapers.map((p) => {
          const qs = DATA.questions[p.id] || []
          const expanded = open === p.id
          const theme = qs[0] ? qs[0].s.replace(/<[^>]+>/g, '').match(/主题[：:]\s*([^，。\n]+)/)?.[1] : ''
          return (
            <Card key={p.id} className={expanded ? 'lg:col-span-2 border-amber-300' : ''}>
              <CardContent className="p-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() => setOpen(expanded ? null : p.id)}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800">{sessionLabel(p.se)} 实操真题</div>
                    {theme && <div className="mt-0.5 truncate text-sm text-amber-700">主题：{theme}</div>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">{p.n} 题</Badge>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {expanded && (
                  <div className="mt-4 space-y-5 border-t pt-4">
                    {qs.map((q) => (
                      <div key={q.i} className="space-y-3">
                        <div>
                          <Badge className="mb-2 bg-amber-500 hover:bg-amber-500">任务要求</Badge>
                          <Html html={q.s} className="rounded-lg bg-slate-50 p-4 text-[15px] leading-relaxed" />
                        </div>
                        {q.a && q.a.replace(/<[^>]+>/g, '').trim() && (
                          <div>
                            <Badge variant="outline" className="mb-2">评分标准</Badge>
                            <Html html={q.a} className="rounded-lg border p-4 text-sm leading-relaxed" />
                          </div>
                        )}
                        {q.an && q.an.replace(/<[^>]+>/g, '').trim() && (
                          <div>
                            <Badge variant="outline" className="mb-2">参考思路</Badge>
                            <Html html={q.an} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm leading-relaxed" />
                          </div>
                        )}
                        {q.kp.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {q.kp.map((k) => (
                              <Badge key={k} variant="outline" className="text-[11px] font-normal">{k}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
