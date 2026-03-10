'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, Play, RotateCcw, Hash, Check, X, Star } from 'lucide-react'

type GameState = 'setup' | 'playing' | 'finished'

interface Exercise {
  a: number
  b: number
}

interface AnswerRecord extends Exercise {
  userAnswer: number | null
  isCorrect: boolean
}

const TIME_LIMIT = parseInt(process.env.NEXT_PUBLIC_TIME_LIMIT || '40', 10)
const MIN_CORRECT = parseInt(process.env.NEXT_PUBLIC_MIN_CORRECT || '10', 10)
const MIN_PERCENTAGE = parseInt(process.env.NEXT_PUBLIC_MIN_PERCENTAGE || '80', 10)

export default function MaaltafelsApp() {
  const [gameState, setGameState] = useState<GameState>('setup')

  const [currentExercise, setCurrentExercise] = useState<Exercise>({ a: 2, b: 2 })
  const [inputValue, setInputValue] = useState<string>('')

  const [stats, setStats] = useState<{ correct: number; total: number; history: AnswerRecord[] }>({
    correct: 0,
    total: 0,
    history: [],
  })

  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateExercise = (): Exercise => {
    const a = Math.floor(Math.random() * 9) + 2
    const b = Math.floor(Math.random() * 9) + 2
    return { a, b }
  }

  const startGame = () => {
    setStats({ correct: 0, total: 0, history: [] })
    setTimeLeft(TIME_LIMIT)
    setCurrentExercise(generateExercise())
    setInputValue('')
    setGameState('playing')
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (gameState === 'playing' && timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameState('finished')
    }
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState, currentExercise])

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const parsedAnswer = parseInt(inputValue, 10)
    const isCorrect = parsedAnswer === currentExercise.a * currentExercise.b

    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      history: [...stats.history, { ...currentExercise, userAnswer: parsedAnswer, isCorrect }],
    }

    setStats(newStats)
    setInputValue('')

    setCurrentExercise(generateExercise())
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const progressPercentage = (timeLeft / TIME_LIMIT) * 100

  const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  const hasEnoughCorrect = stats.correct >= MIN_CORRECT
  const hasEnoughPercentage = percentage >= MIN_PERCENTAGE
  const isPerfect = hasEnoughCorrect && stats.correct === stats.total
  const isGood = hasEnoughCorrect && hasEnoughPercentage && !isPerfect
  const isNotGood = !hasEnoughCorrect || !hasEnoughPercentage

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 font-sans flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-sky-600 tracking-tight mb-2">Tafelkampioen</h1>
          <p className="text-lg text-slate-500 font-medium">Oefen de maaltafels van 2 tot 10!</p>
        </header>

        <main className="bg-white rounded-3xl shadow-xl shadow-sky-100/50 overflow-hidden border border-sky-100">
          <AnimatePresence mode="wait">
            {gameState === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 md:p-12 flex flex-col items-center"
              >
                <div className="flex items-center justify-center mb-8 text-sky-500">
                  <Play className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold text-center mb-4">Klaar om je tafels te oefenen?</h2>
                <p className="text-slate-500 text-center mb-8 max-w-sm">
                  Je hebt {TIME_LIMIT} seconden om zoveel mogelijk oefeningen op te lossen. Probeer er minstens {MIN_CORRECT} juist te
                  hebben en niet meer dan {100 - MIN_PERCENTAGE}% fout!
                </p>

                <button
                  onClick={startGame}
                  className="w-full max-w-sm bg-sky-500 hover:bg-sky-600 text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-sky-200 transition-transform active:scale-95 flex items-center justify-center"
                >
                  <Play className="w-6 h-6 mr-2 fill-current" />
                  Start Sessie
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="p-8 md:p-12 flex flex-col items-center"
              >
                <div className="w-full flex justify-between items-center mb-8">
                  <div className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-slate-400" />
                    Oefening {stats.total + 1}
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Juist: {stats.correct}
                  </div>
                </div>

                <div className="w-full h-8 bg-slate-200 rounded-full mb-12 overflow-hidden relative flex items-center justify-center shadow-inner">
                  <motion.div
                    className={`absolute left-0 top-0 h-full rounded-full ${timeLeft < 10 ? 'bg-rose-400' : 'bg-sky-400'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                  <span className="relative z-10 font-black text-slate-800 drop-shadow-sm">{timeLeft}s</span>
                </div>

                <form onSubmit={handleInputSubmit} className="flex flex-col items-center w-full max-w-md">
                  <div className="flex items-center justify-center text-6xl md:text-8xl font-black text-slate-800 mb-8 w-full">
                    <span className="w-24 text-right">{currentExercise.a}</span>
                    <span className="mx-4 text-sky-400 text-5xl md:text-7xl">×</span>
                    <span className="w-24 text-left">{currentExercise.b}</span>
                    <span className="mx-4 text-slate-300">=</span>
                  </div>

                  <input
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-full max-w-[200px] text-center text-5xl md:text-6xl font-black text-sky-600 px-4 py-4 rounded-3xl border-4 border-slate-200 focus:border-sky-400 focus:ring-8 focus:ring-sky-100 transition-all outline-none"
                    autoFocus
                    onBlur={() => {
                      if (gameState === 'playing') {
                        setTimeout(() => inputRef.current?.focus(), 10)
                      }
                    }}
                  />
                  <p className="mt-6 text-slate-400 font-medium">Typ je antwoord en druk op Enter</p>
                </form>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 md:p-12 flex flex-col items-center"
              >
                <div className="mb-6">
                  {isPerfect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                      <Star className="w-32 h-32 text-amber-400 fill-amber-400 drop-shadow-lg" />
                    </motion.div>
                  )}
                  {isGood && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                      <CheckCircle className="w-32 h-32 text-emerald-500 drop-shadow-lg" />
                    </motion.div>
                  )}
                  {isNotGood && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                      <XCircle className="w-32 h-32 text-rose-500 drop-shadow-lg" />
                    </motion.div>
                  )}
                </div>

                <h2 className="text-4xl font-black text-slate-800 mb-2 text-center">
                  {isPerfect ? 'Perfect!' : isGood ? 'Goed gedaan!' : 'Nog even oefenen!'}
                </h2>

                <div className="flex gap-6 mb-8">
                  <div className="text-xl font-bold text-slate-500 text-center">
                    Score: <span className={hasEnoughCorrect ? 'text-emerald-500' : 'text-rose-500'}>{stats.correct}</span> / {stats.total}
                  </div>
                  <div className="text-xl font-bold text-slate-500 text-center">
                    Percentage: <span className={hasEnoughPercentage ? 'text-emerald-500' : 'text-rose-500'}>{percentage}%</span>
                  </div>
                </div>

                {stats.history.length > 0 && (
                  <div className="w-full max-w-md bg-slate-50 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto border border-slate-100 shadow-inner">
                    <h3 className="font-bold text-slate-700 mb-4 text-center">Jouw antwoorden:</h3>
                    <ul className="space-y-3">
                      {stats.history.map((record, idx) => (
                        <li key={idx} className="flex items-center justify-between text-lg font-medium bg-white p-3 rounded-xl shadow-sm">
                          <span className="text-slate-600 w-24">
                            {record.a} × {record.b} =
                          </span>
                          <span className={`font-bold w-16 text-center ${record.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {record.userAnswer ?? '?'}
                          </span>
                          <span className="w-8 flex justify-end">
                            {record.isCorrect ? <Check className="w-6 h-6 text-emerald-500" /> : <X className="w-6 h-6 text-rose-500" />}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={startGame}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-sky-200 transition-transform active:scale-95 flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Opnieuw Spelen
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
