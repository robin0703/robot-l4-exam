import type { Level } from '@/lib/exam'
import { getMeta, sessionLabel } from '@/lib/exam'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpenCheck, FileText, Layers, Flame, CalendarDays, ArrowRight } from 'lucide-react'

interface Props {
  level: Level
  onNavigate: (tab: 'exam' | 'kp' | 'hot' | 'practice') => void
}

export default function Overview({ level, onNavigate }: Props) {
  const { stats, kpStats, hot } = getMeta(level)
  const maxKp = kpStats[0]?.count || 1

  const cards = [
    { icon: FileText, label: '历年真题试卷', value: stats.paperCount, sub: `理论 ${stats.theoryCount} 套 · 实操 ${stats.practiceCount} 套` },
    { icon: BookOpenCheck, label: '题目总数', value: stats.questionCount, sub: '单选 / 多选 / 判断 / 实操' },
    { icon: Layers, label: '考点覆盖', value: stats.kpCount, sub: '官方标注知识点' },
    {
      icon: CalendarDays,
      label: '覆盖考期',
      value: stats.sessionCount,
      sub: `${sessionLabel(stats.firstSession)} — ${sessionLabel(stats.lastSession)}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <c.icon className="h-4 w-4" />
                <span className="text-xs">{c.label}</span>
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-800">{c.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>📊 高频考点 TOP 10</span>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('kp')}>
                全部考点 <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {kpStats.slice(0, 10).map((k, i) => (
              <div key={k.name} className="group">
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-slate-700">
                    <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[11px] font-bold text-amber-700">
                      {i + 1}
                    </span>
                    {k.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{k.count} 题</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${Math.max(6, (k.count / maxKp) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" /> 反复考的真题 TOP 5
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('hot')}>
                高频考题榜 <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hot.slice(0, 5).map((h) => (
              <div key={h.qid + h.paperId} className="rounded-lg border p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge className="bg-orange-500 hover:bg-orange-500">×{h.count}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {h.sessions.map(sessionLabel).join(' · ')}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-slate-700">{h.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-lg font-bold text-slate-800">准备好了吗？来一场全真模考</div>
            <p className="mt-1 text-sm text-muted-foreground">
              任选一届理论真题，30 分钟倒计时，客观题自动判分，交卷后立即查看答案与解析。
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => onNavigate('exam')}>
              开始模考
            </Button>
            <Button variant="outline" onClick={() => onNavigate('practice')}>
              看实操真题
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
