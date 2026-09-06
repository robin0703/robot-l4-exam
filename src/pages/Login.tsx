import { useState } from 'react'
import { STUDENTS } from '@/data/students'
import { setUser } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, KeyRound, User, LogIn } from 'lucide-react'

const QUESTION = '魔都最帅的科创老师是谁？'
const ANSWER = '肉饼'

export default function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('')
  const [ans, setAns] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    const n = name.trim()
    const a = ans.trim()
    if (!n) return setErr('请输入你的名字')
    if (!STUDENTS.includes(n)) return setErr('名单里没有这个名字，请检查是否写对，或找老师添加')
    if (!a) return setErr('请回答验证问题')
    if (a !== ANSWER) return setErr('验证问题答错了，再想想～')
    setUser(n)
    onLogin(n)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Bot className="h-8 w-8" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">机器人等级考试 · 真题复习与模考</h1>
            <p className="text-xs text-muted-foreground">本网站仅限卓因创客学员使用，请验证身份后进入</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User className="h-4 w-4" /> 你的名字
              </label>
              <Input
                list="student-names"
                placeholder="输入报名时登记的名字"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
              <datalist id="student-names">
                {STUDENTS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <KeyRound className="h-4 w-4" /> 验证问题：{QUESTION}
              </label>
              <Input
                placeholder="请输入答案"
                value={ans}
                onChange={(e) => setAns(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>

            {err && <p className="text-sm text-rose-600">{err}</p>}

            <Button className="w-full bg-amber-500 hover:bg-amber-600" size="lg" onClick={submit}>
              <LogIn className="mr-1.5 h-4 w-4" /> 进入网站
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              名字写对才能进哦 · 登录后你的做题记录会保存在这台电脑上
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
