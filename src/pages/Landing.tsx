import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Level, MetaData } from '@/lib/exam'
import { initData, getMeta, sessionLabel } from '@/lib/exam'
import { getUser, logout } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, ArrowRight, FileText, Layers, Timer, Wrench, Loader2, LogOut, UserCircle2 } from 'lucide-react'

const LEVEL_CARDS: {
  level: Level
  title: string
  desc: string
  gradient: string
  ring: string
  badge: string
}[] = [
  {
    level: 'l1',
    title: '机器人一级',
    desc: '理论：单选 / 多选 / 判断 · 实操：搭建 + 编程',
    gradient: 'from-emerald-500 to-green-600',
    ring: 'hover:border-emerald-400',
    badge: 'bg-emerald-500',
  },
  {
    level: 'l2',
    title: '机器人二级',
    desc: '理论：单选 / 多选 / 判断 · 实操：搭建 + 编程',
    gradient: 'from-violet-500 to-purple-600',
    ring: 'hover:border-violet-400',
    badge: 'bg-violet-500',
  },
  {
    level: 'l3',
    title: '机器人三级',
    desc: '理论：单选 / 多选 / 判断 · 实操：搭建 + 编程',
    gradient: 'from-sky-500 to-blue-600',
    ring: 'hover:border-sky-400',
    badge: 'bg-sky-500',
  },
  {
    level: 'l4',
    title: '机器人四级',
    desc: '理论：单选 / 多选 / 判断 · 实操：搭建 + 编程',
    gradient: 'from-amber-500 to-orange-600',
    ring: 'hover:border-amber-400',
    badge: 'bg-amber-500',
  },
]

const FEATURES = [
  { icon: Timer, label: '全真模考', sub: '30 分钟倒计时 · 自动判分' },
  { icon: Layers, label: '知识点总结', sub: '按考查频次排序' },
  { icon: FileText, label: '高频考题', sub: '反复出现的真题榜' },
  { icon: Wrench, label: '实操专区', sub: '任务要求 + 评分标准' },
]

export default function Landing() {
  const nav = useNavigate()
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState('')
  const [metas, setMetas] = useState<Record<Level, MetaData> | null>(null)
  const user = getUser()

  useEffect(() => {
    Promise.all([initData('l1'), initData('l2'), initData('l3'), initData('l4')])
      .then(() => {
        setMetas({ l1: getMeta('l1'), l2: getMeta('l2'), l3: getMeta('l3'), l4: getMeta('l4') })
        setReady(true)
      })
      .catch((e) => setErr(String(e)))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white">
        <div className="absolute right-4 top-4 flex items-center gap-2 text-xs text-white/80">
          <UserCircle2 className="h-4 w-4" />
          <span>{user}</span>
          <button
            className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 transition hover:bg-white/20"
            onClick={() => {
              logout()
              window.location.reload()
            }}
          >
            <LogOut className="h-3 w-3" /> 退出
          </button>
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-12 text-center sm:px-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Bot className="h-8 w-8" />
          </span>
          <h1 className="text-2xl font-bold sm:text-3xl">青少年机器人等级考试 · 真题复习与模考</h1>
          <p className="text-sm text-white/70">
            全国青少年机器人技术等级考试 · 历年真题 · 知识点总结 · 高频考题 · 实操专区
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {!ready ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm">{err ? `加载失败：${err}，请刷新重试` : '正在加载题库数据…'}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {LEVEL_CARDS.map((c) => {
                const st = metas![c.level].stats
                return (
                  <Card
                    key={c.level}
                    className={`cursor-pointer transition hover:shadow-lg ${c.ring}`}
                    onClick={() => nav('/' + c.level)}
                  >
                    <CardContent className="p-6">
                      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${c.gradient} px-4 py-2 text-xl font-bold text-white`}>
                        {c.title}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.desc}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge className={c.badge}>{st.paperCount} 套真题</Badge>
                        <Badge variant="secondary">{st.questionCount} 道题</Badge>
                        <Badge variant="secondary">{st.kpCount} 个考点</Badge>
                        <Badge variant="outline">
                          {sessionLabel(st.firstSession)} — {sessionLabel(st.lastSession)}
                        </Badge>
                      </div>
                      <div className="mt-5 flex items-center text-sm font-medium text-slate-700">
                        进入复习 <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FEATURES.map((f) => (
                <Card key={f.label}>
                  <CardContent className="p-4 text-center">
                    <f.icon className="mx-auto h-5 w-5 text-slate-500" />
                    <div className="mt-2 text-sm font-medium text-slate-800">{f.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{f.sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        数据来源于链科学题库 · 仅供教学复习使用
      </footer>
    </div>
  )
}
