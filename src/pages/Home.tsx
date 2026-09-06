import { useEffect, useState } from 'react'
import Overview from '@/sections/Overview'
import Exam from '@/sections/Exam'
import Knowledge from '@/sections/Knowledge'
import Hot from '@/sections/Hot'
import Practice from '@/sections/Practice'
import { initData } from '@/lib/exam'
import { cn } from '@/lib/utils'
import { Bot, LayoutDashboard, Timer, Layers, Flame, Wrench, Loader2 } from 'lucide-react'

type Tab = 'overview' | 'exam' | 'kp' | 'hot' | 'practice'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: '总览', icon: LayoutDashboard },
  { id: 'exam', label: '真题模考', icon: Timer },
  { id: 'kp', label: '知识点总结', icon: Layers },
  { id: 'hot', label: '高频考题', icon: Flame },
  { id: 'practice', label: '实操专区', icon: Wrench },
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview')
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    initData()
      .then(() => setReady(true))
      .catch((e) => setErr(String(e)))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">机器人四级 · 真题复习与模考</h1>
            <p className="text-xs text-white/80 sm:text-sm">
              全国青少年机器人技术等级考试（四级）· 22 届真题 · 44 套试卷 · 684 道题
            </p>
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
                  ? 'border-amber-500 text-amber-600'
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
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm">{err ? `加载失败：${err}，请刷新重试` : '正在加载题库数据…'}</p>
          </div>
        ) : (
          <>
            {tab === 'overview' && <Overview onNavigate={(t) => setTab(t)} />}
            {tab === 'exam' && <Exam />}
            {tab === 'kp' && <Knowledge />}
            {tab === 'hot' && <Hot />}
            {tab === 'practice' && <Practice />}
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        数据来源于链科学题库 · 仅供教学复习使用
      </footer>
    </div>
  )
}
