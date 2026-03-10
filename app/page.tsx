'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Settings, Play, RotateCcw, Clock, Hash, Check, X } from 'lucide-react';

type GameState = 'setup' | 'playing' | 'finished';

interface Settings {
  timeLimit: number;
  maxExercises: number;
}

interface Exercise {
  a: number;
  b: number;
}

interface AnswerRecord extends Exercise {
  userAnswer: number | null;
  isCorrect: boolean;
}

export default function MaaltafelsApp() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [settings, setSettings] = useState<Settings>({ timeLimit: 40, maxExercises: 10 });
  
  const [currentExercise, setCurrentExercise] = useState<Exercise>({ a: 2, b: 2 });
  const [inputValue, setInputValue] = useState<string>('');
  
  const [stats, setStats] = useState<{ correct: number; total: number; history: AnswerRecord[] }>({
    correct: 0,
    total: 0,
    history: []
  });
  
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeLimit);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a random exercise between 2x2 and 10x10
  const generateExercise = (): Exercise => {
    const a = Math.floor(Math.random() * 9) + 2; // 2 to 10
    const b = Math.floor(Math.random() * 9) + 2; // 2 to 10
    return { a, b };
  };

  const startGame = () => {
    setStats({ correct: 0, total: 0, history: [] });
    setTimeLeft(settings.timeLimit);
    setCurrentExercise(generateExercise());
    setInputValue('');
    setGameState('playing');
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startGame();
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState === 'playing' && timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Keep focus on input
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentExercise]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const parsedAnswer = parseInt(inputValue, 10);
    const isCorrect = parsedAnswer === currentExercise.a * currentExercise.b;

    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      history: [...stats.history, { ...currentExercise, userAnswer: parsedAnswer, isCorrect }]
    };

    setStats(newStats);
    setInputValue('');

    if (newStats.total >= settings.maxExercises) {
      setGameState('finished');
    } else {
      setCurrentExercise(generateExercise());
      // Re-focus is handled by useEffect, but let's be safe
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const progressPercentage = (timeLeft / settings.timeLimit) * 100;
  const isPerfectScore = stats.correct === settings.maxExercises && stats.total === settings.maxExercises;

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 font-sans flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-sky-600 tracking-tight mb-2">
            Rekenkampioen
          </h1>
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
                className="p-8 md:p-12"
              >
                <div className="flex items-center justify-center mb-8 text-sky-500">
                  <Settings className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-8">Instellingen</h2>
                
                <form onSubmit={handleSetupSubmit} className="space-y-6 max-w-sm mx-auto">
                  <div className="space-y-2">
                    <label htmlFor="timeLimit" className="flex items-center text-sm font-semibold text-slate-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Tijd per sessie (seconden)
                    </label>
                    <input
                      id="timeLimit"
                      type="number"
                      min="10"
                      max="300"
                      value={settings.timeLimit}
                      onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value) || 40 })}
                      className="w-full text-lg px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="maxExercises" className="flex items-center text-sm font-semibold text-slate-600">
                      <Hash className="w-4 h-4 mr-2" />
                      Aantal oefeningen
                    </label>
                    <input
                      id="maxExercises"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxExercises}
                      onChange={(e) => setSettings({ ...settings, maxExercises: parseInt(e.target.value) || 10 })}
                      className="w-full text-lg px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-8 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-sky-200 transition-transform active:scale-95 flex items-center justify-center"
                  >
                    <Play className="w-6 h-6 mr-2 fill-current" />
                    Start Sessie
                  </button>
                </form>
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
                {/* Top Bar: Stats & Timer */}
                <div className="w-full flex justify-between items-center mb-8">
                  <div className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-slate-400" />
                    Oefening {stats.total + 1} / {settings.maxExercises}
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Juist: {stats.correct}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-100 rounded-full mb-12 overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${timeLeft < 10 ? 'bg-rose-400' : 'bg-sky-400'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>

                {/* Exercise Area */}
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
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full max-w-[200px] text-center text-5xl md:text-6xl font-black text-sky-600 px-4 py-4 rounded-3xl border-4 border-slate-200 focus:border-sky-400 focus:ring-8 focus:ring-sky-100 transition-all outline-none"
                    autoFocus
                    onBlur={() => {
                      // Keep focus forcefully if we are playing
                      if (gameState === 'playing') {
                        setTimeout(() => inputRef.current?.focus(), 10);
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
                  {isPerfectScore ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <CheckCircle className="w-32 h-32 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <XCircle className="w-32 h-32 text-rose-500" />
                    </motion.div>
                  )}
                </div>

                <h2 className="text-4xl font-black text-slate-800 mb-2">
                  {isPerfectScore ? 'Perfect!' : 'Goed geprobeerd!'}
                </h2>
                
                <div className="text-2xl font-bold text-slate-500 mb-8">
                  Score: <span className={isPerfectScore ? 'text-emerald-500' : 'text-rose-500'}>{stats.correct}</span> / {stats.total}
                </div>

                {stats.history.length > 0 && (
                  <div className="w-full max-w-md bg-slate-50 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto border border-slate-100 shadow-inner">
                    <h3 className="font-bold text-slate-700 mb-4 text-center">Jouw antwoorden:</h3>
                    <ul className="space-y-3">
                      {stats.history.map((record, idx) => (
                        <li key={idx} className="flex items-center justify-between text-lg font-medium bg-white p-3 rounded-xl shadow-sm">
                          <span className="text-slate-600 w-24">{record.a} × {record.b} =</span>
                          <span className={`font-bold w-16 text-center ${record.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {record.userAnswer ?? '?'}
                          </span>
                          <span className="w-8 flex justify-end">
                            {record.isCorrect ? (
                              <Check className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <X className="w-6 h-6 text-rose-500" />
                            )}
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
                    Opnieuw
                  </button>
                  <button
                    onClick={() => setGameState('setup')}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-lg py-4 px-6 rounded-2xl transition-transform active:scale-95 flex items-center justify-center"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Instellingen
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
