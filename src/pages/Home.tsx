import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Level } from '@/lib/exam'
import { getMeta, initData, LEVELS } from '@/lib/exam'
import Overview from '@/sections/Overview'
import Exam from '@/sections/Exam'
import Knowledge from '@/sections/Knowledge'
import Hot from '@/sections/Hot'
import Practice from '@/sections/Practice'
import WrongBook from '@/sections/WrongBook'
import { getUser, logout } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Bot, LayoutDashboard, Timer, Layers, Flame, Wrench, Loader2, ChevronLeft, Repeat, BookX, LogOut } from 'lucide-react'

type Tab = 'overview' | 'exam' | 'kp' | 'hot' | 'practice' | 'wrong'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: '总览', icon: LayoutDashboard },
  { id: 'exam', label: '真题模考', icon: Timer },
  { id: 'kp', label: '知识点总结', icon: Layers },
  { id: 'hot', label: '高频考题', icon: Flame },
  { id: 'practice', label: '实操专区', icon: Wrench },
  { id: 'wrong', label: '我的错题本', icon: BookX },
]

const THEMES: Record<Level, { header: string; accent: string; text: string }> = {
  l3: { header: 'from-sky-500 via-blue-500 to-blue-600', accent: 'border-sky-500 text-sky-600', text: 'text-sky-500' },
  l4: { header: 'from-amber-500 via-orange-500 to-orange-600', accent: 'border-amber-500 text-amber-600', text: 'text-amber-500' },
}

export default function Home({ level }: { level: Level }) {
  const [tab, setTab] = useState<Tab>('overview')
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState('')
  const theme = THEMES[level]
  const other: Level = level === 'l3' ? 'l4' : 'l3'
  const user = getUser()

  useEffect(() => {
    setReady(false)
    setErr('')
    setTab('overview')
    initData(level)
      .then(() => setReady(true))
      .catch((e) => setErr(String(e)))
  }, [level])

  const stats = getMeta(level).stats

  return (
    <div className="min-h-screen bg-slate-50">
      <header className={`bg-gradient-to-r ${theme.header} text-white shadow-md`}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <Link to="/" title="返回首页" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30">
            <Bot className="h-6 w-6" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">
              {LEVELS[level].name} · 真题复习与模考
            </h1>
            <p className="text-xs text-white/80 sm:text-sm">
              全国青少年机器人技术等级考试 · {stats.sessionCount} 届真题 · {stats.paperCount} 套试卷 · {stats.questionCount} 道题
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-white/90">
              <span>{user}</span>
              <button
                title="退出登录"
                className="flex items-center gap-0.5 rounded bg-white/15 px-1.5 py-0.5 transition hover:bg-white/25"
                onClick={() => {
                  logout()
                  window.location.reload()
                }}
              >
                <LogOut className="h-3 w-3" /> 退出
              </button>
            </div>
            <Link
              to={'/' + other}
              className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs transition hover:bg-white/25 sm:text-sm"
            >
              <Repeat className="h-3.5 w-3.5" /> 切换到{LEVELS[other].short}
            </Link>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id)
                window.scrollTo({ top: 0 })
              }}
              className={cn(
                'flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition',
                tab === t.id
                  ? theme.accent
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!ready ? (
          <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
            <Loader2 className={`h-8 w-8 animate-spin ${theme.text}`} />
            <p className="text-sm">{err ? `加载失败：${err}，请刷新重试` : '正在加载题库数据…'}</p>
          </div>
        ) : (
          <>
            {tab === 'overview' && <Overview level={level} onNavigate={(t) => setTab(t)} />}
            {tab === 'exam' && <Exam level={level} />}
            {tab === 'kp' && <Knowledge level={level} />}
            {tab === 'hot' && <Hot level={level} />}
            {tab === 'practice' && <Practice level={level} />}
            {tab === 'wrong' && <WrongBook />}
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-slate-600">
          <ChevronLeft className="mr-0.5 inline h-3 w-3" />返回首页选择级别
        </Link>
        <span className="mx-2">·</span>
        数据来源于链科学题库 · 仅供教学复习使用
      </footer>
    </div>
  )
}
