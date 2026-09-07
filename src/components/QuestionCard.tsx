import type { Question } from '@/lib/exam'
import { answerText, gradeAnswer, stripHtml, typeLabel } from '@/lib/exam'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  q: Question
  index: number
  mode: 'exam' | 'review'
  value?: string
  onChange?: (v: string) => void
}

function Html({ html, className }: { html: string; className?: string }) {
  return <div className={cn('qhtml', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

export default function QuestionCard({ q, index, mode, value, onChange }: Props) {
  const reveal = mode === 'review'
  const correct = reveal ? gradeAnswer(q, value) : undefined
  const selectedSet = new Set((value || '').split(',').filter(Boolean))

  const pick = (letter: string) => {
    if (!onChange || reveal) return
    if (q.t === 2) {
      const next = new Set(selectedSet)
      if (next.has(letter)) next.delete(letter)
      else next.add(letter)
      onChange([...next].sort().join(','))
    } else {
      onChange(letter)
    }
  }

  const judgeLabels: Record<string, string> = { '1': '✔ 正确', '0': '✘ 错误' }
  const options: { l: string; c: string }[] =
    q.t === 3
      ? [
          { l: '1', c: judgeLabels['1'] },
          { l: '0', c: judgeLabels['0'] },
        ]
      : q.o

  // 源数据多选答案为 "BCD"（无逗号），统一按字母提取
  const correctSet = new Set(
    q.t === 3 ? [q.a.trim()] : (q.a.match(/[A-Za-z]/g) || []).map((s) => s.toUpperCase())
  )

  const hasAnalysis = stripHtml(q.an).length > 0

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 sm:p-5 shadow-sm',
        reveal && correct === true && 'border-emerald-300',
        reveal && correct === false && 'border-rose-300'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabel(q.t)}</Badge>
            <span className="text-xs text-muted-foreground">{q.sc} 分</span>
            {q.t === 2 && <span className="text-xs text-amber-600">多选，全部选对才得分</span>}
            {reveal &&
              (correct ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 回答正确
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                  <XCircle className="h-3.5 w-3.5" /> {value ? '回答错误' : '未作答'}
                </span>
              ))}
          </div>

          <Html html={q.s} className="text-[15px] leading-relaxed" />

          <div className="mt-3 space-y-2">
            {options.map((opt) => {
              const isSel = selectedSet.has(opt.l)
              const isAns = correctSet.has(opt.l)
              return (
                <button
                  key={opt.l}
                  type="button"
                  disabled={reveal}
                  onClick={() => pick(opt.l)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition',
                    !reveal && 'hover:border-amber-400 hover:bg-amber-50 cursor-pointer',
                    !reveal && isSel && 'border-amber-500 bg-amber-50 ring-1 ring-amber-400',
                    reveal && isAns && 'border-emerald-500 bg-emerald-50',
                    reveal && isSel && !isAns && 'border-rose-400 bg-rose-50',
                    reveal && 'cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                      !reveal && isSel && 'border-amber-500 bg-amber-500 text-white',
                      reveal && isAns && 'border-emerald-500 bg-emerald-500 text-white',
                      reveal && isSel && !isAns && 'border-rose-400 bg-rose-400 text-white'
                    )}
                  >
                    {q.t === 3 ? (opt.l === '1' ? '✓' : '✗') : opt.l}
                  </span>
                  <Html html={opt.c} className="flex-1 text-sm leading-relaxed" />
                </button>
              )
            })}
          </div>

          {reveal && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="font-medium text-slate-700">
                正确答案：<span className="text-emerald-600 font-bold">{answerText(q)}</span>
                {value !== undefined && (
                  <span className="ml-3 text-slate-500">
                    你的作答：
                    <span className={correct ? 'text-emerald-600' : 'text-rose-500'}>
                      {value ? (q.t === 3 ? judgeLabels[value] ?? value : value) : '（未作答）'}
                    </span>
                  </span>
                )}
              </div>
              {hasAnalysis && (
                <div className="mt-2 border-t pt-2">
                  <span className="font-medium text-slate-700">解析：</span>
                  <Html html={q.an} className="mt-1 text-slate-600" />
                </div>
              )}
              {q.kp.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 border-t pt-2">
                  {q.kp.map((k) => (
                    <Badge key={k} variant="outline" className="text-[11px] font-normal">
                      {k}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
