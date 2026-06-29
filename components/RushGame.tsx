import React, { useEffect, useRef, useState } from 'react';

interface RushGameProps {
  onExit: () => void;
}

interface Question {
  scenario: string;
  stride: string;
  explicacao: string;
}

const STRIDE = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];
const THEMES = ['Geral', 'App bancário', 'E-commerce', 'IoT', 'API pública', 'Mobile'];

const timeLimitMs = (answered: number) => Math.max(6, 12 - Math.floor(answered / 5)) * 1000;

interface Feedback { chosen: string | null; correct: boolean; correctStride: string; explicacao: string; gained: number; }

const RushGame: React.FC<RushGameProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<'entry' | 'loading' | 'playing' | 'gameover'>('entry');
  const [theme, setTheme] = useState('Geral');
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const answeredRef = useRef(0);
  const deadlineRef = useRef(0);
  const lockedRef = useRef(false);
  const fetchingRef = useRef(false);

  const current = questions[qIndex];

  // Embaralha (Fisher-Yates) para o sequenciamento não ser previsível (a IA tende a
  // gerar as perguntas em ordem STRIDE).
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fetchBatch = async (append: boolean) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch('/api/rush/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme === 'Geral' ? '' : theme, count: 12 }),
      });
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      const qs: Question[] = shuffle(data.questions || []);
      if (qs.length === 0) throw new Error('empty');
      setQuestions((prev) => (append ? [...prev, ...qs] : qs));
      return true;
    } catch {
      if (!append) { setError('Falha ao gerar perguntas. Verifique o backend e tente novamente.'); setPhase('entry'); }
      return false;
    } finally {
      fetchingRef.current = false;
    }
  };

  const start = async () => {
    setError(null);
    setPhase('loading');
    livesRef.current = 3; comboRef.current = 0; answeredRef.current = 0; lockedRef.current = false;
    setLives(3); setCombo(0); setBestCombo(0); setAnswered(0); setScore(0); setQIndex(0); setFeedback(null);
    const ok = await fetchBatch(false);
    if (ok) setPhase('playing');
  };

  // Timer da pergunta atual.
  useEffect(() => {
    if (phase !== 'playing' || !current || feedback || lockedRef.current) return;
    const limit = timeLimitMs(answeredRef.current);
    deadlineRef.current = Date.now() + limit;
    setTimeLeft(limit);
    const id = setInterval(() => {
      const remain = deadlineRef.current - Date.now();
      if (remain <= 0) { clearInterval(id); answer(null); }
      else setTimeLeft(remain);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, feedback]);

  const goNext = () => {
    const next = qIndex + 1;
    if (questions.length - next <= 4) fetchBatch(true);
    setQIndex(next);
    lockedRef.current = false;
  };

  const answer = (chosen: string | null) => {
    if (lockedRef.current || !current) return;
    lockedRef.current = true;
    const limit = timeLimitMs(answeredRef.current);
    const remaining = Math.max(0, deadlineRef.current - Date.now());
    const correct = chosen === current.stride;
    let gained = 0;
    if (correct) {
      const speedBonus = Math.round((remaining / limit) * 100);
      const mult = 1 + comboRef.current * 0.1;
      gained = Math.round((100 + speedBonus) * mult);
      comboRef.current += 1;
      setScore((s) => s + gained);
      setCombo(comboRef.current);
      setBestCombo((b) => Math.max(b, comboRef.current));
    } else {
      comboRef.current = 0; setCombo(0);
      livesRef.current -= 1; setLives(livesRef.current);
    }
    answeredRef.current += 1; setAnswered(answeredRef.current);
    setFeedback({ chosen, correct, correctStride: current.stride, explicacao: current.explicacao, gained });
    setTimeout(() => {
      setFeedback(null);
      if (!correct && livesRef.current <= 0) { setPhase('gameover'); return; }
      goNext();
    }, 1500);
  };

  // ───────── Entrada ─────────
  if (phase === 'entry') {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">⚡ Carcará Rush</h2>
        <p className="text-slate-400 mb-6">Classifique a ameaça no STRIDE correto antes do tempo acabar. Acertos em sequência valem combo. Você tem 3 vidas!</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {THEMES.map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${theme === t ? 'border-amber-500 bg-amber-600/20 text-amber-200' : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-amber-500/60'}`}>
              {t}
            </button>
          ))}
        </div>
        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={start} className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">⚡ Começar</button>
          <button onClick={onExit} className="px-6 py-2 text-slate-400 hover:text-slate-200">← Voltar</button>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || (phase === 'playing' && !current)) {
    return (
      <div className="animate-fade-in text-center py-16">
        <div className="inline-block w-10 h-10 border-4 border-slate-600 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-300">Preparando as ameaças…</p>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="animate-fade-in max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">🏁 Fim de jogo</h2>
        <div className="my-6 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700"><div className="text-2xl font-extrabold text-amber-300">{score}</div><div className="text-xs text-slate-400">pontos</div></div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700"><div className="text-2xl font-extrabold text-emerald-300">{bestCombo}x</div><div className="text-xs text-slate-400">melhor combo</div></div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700"><div className="text-2xl font-extrabold text-slate-200">{answered}</div><div className="text-xs text-slate-400">respondidas</div></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={start} className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">Jogar de novo</button>
          <button onClick={onExit} className="px-6 py-2 text-slate-400 hover:text-slate-200">← Sair</button>
        </div>
      </div>
    );
  }

  // ───────── Jogando ─────────
  const limit = timeLimitMs(answeredRef.current);
  const pct = Math.max(0, Math.min(100, (timeLeft / limit) * 100));
  const barColor = pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="text-slate-300">{'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}</div>
        <div className="flex gap-4">
          <span className="text-amber-300 font-bold">{score} pts</span>
          <span className={`font-bold ${combo > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>combo {combo}x</span>
        </div>
      </div>

      {/* Barra de tempo */}
      <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mb-5">
        <div className={`h-full ${barColor} transition-all duration-100`} style={{ width: `${pct}%` }} />
      </div>

      {/* Cenário */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-5 min-h-[96px] flex items-center">
        <p className="text-lg text-slate-100">{current.scenario}</p>
      </div>

      <p className="text-center text-slate-400 text-sm mb-3">Qual categoria STRIDE?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STRIDE.map((s) => {
          let cls = 'border-slate-700 bg-slate-800 hover:border-amber-500 hover:bg-slate-700/60 text-slate-200';
          if (feedback) {
            if (s === feedback.correctStride) cls = 'border-emerald-500 bg-emerald-600/30 text-emerald-100';
            else if (s === feedback.chosen) cls = 'border-red-500 bg-red-600/30 text-red-100';
            else cls = 'border-slate-700 bg-slate-800/40 text-slate-500';
          }
          return (
            <button
              key={s}
              onClick={() => answer(s)}
              disabled={!!feedback}
              className={`px-4 py-3 rounded-lg border text-left font-medium transition-all ${cls}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`mt-4 p-3 rounded-lg border ${feedback.correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10'}`}>
          <p className={`font-semibold ${feedback.correct ? 'text-emerald-300' : 'text-red-300'}`}>
            {feedback.correct ? `✓ Correto! +${feedback.gained} pts` : `✗ Era ${feedback.correctStride}`}
          </p>
          <p className="text-sm text-slate-300 mt-1">{feedback.explicacao}</p>
        </div>
      )}

      <div className="mt-6 text-center"><button onClick={onExit} className="text-slate-400 hover:text-slate-200 text-sm">← Sair do jogo</button></div>
    </div>
  );
};

export default RushGame;
