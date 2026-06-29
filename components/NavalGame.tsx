import React, { useState } from 'react';

interface NavalGameProps {
  onExit: () => void;
}

interface Cell {
  stride: string;
  hasThreat: boolean;
  titulo?: string;
  descricao?: string;
  severidade?: 'baixo' | 'medio' | 'alto' | 'critico';
  owasp?: string;
  cwe?: string;
  motivo?: string;
}
interface Component { id: string; name: string; cells: Cell[]; }
interface Board { theme: string; components: Component[]; totalThreats: number; }

const STRIDE = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];
const ABBR: Record<string, string> = {
  'Spoofing': 'S', 'Tampering': 'T', 'Repudiation': 'R',
  'Information Disclosure': 'I', 'Denial of Service': 'D', 'Elevation of Privilege': 'E',
};
const POINTS: Record<string, number> = { baixo: 10, medio: 30, alto: 60, critico: 100 };
const SEV_COLOR: Record<string, string> = {
  baixo: 'bg-green-600/70 border-green-400',
  medio: 'bg-yellow-600/70 border-yellow-400',
  alto: 'bg-orange-600/70 border-orange-400',
  critico: 'bg-red-600/70 border-red-400',
};
const THEMES = ['App bancário', 'E-commerce', 'Plataforma IoT', 'Rede social', 'SaaS de saúde', 'API pública'];

const NavalGame: React.FC<NavalGameProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<'entry' | 'loading' | 'playing'>('entry');
  const [theme, setTheme] = useState('');
  const [board, setBoard] = useState<Board | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [score, setScore] = useState(0);
  const [detail, setDetail] = useState<{ comp: string; cell: Cell } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const keyOf = (cid: string, stride: string) => `${cid}-${stride}`;
  const found = board ? revealed.size > 0
    ? [...revealed].filter((k) => {
        const [cid, ...rest] = k.split('-');
        const stride = rest.join('-');
        const comp = board.components.find((c) => c.id === cid);
        return comp?.cells.find((c) => c.stride === stride)?.hasThreat;
      }).length
    : 0 : 0;
  const won = board ? found >= board.totalThreats : false;

  const start = async () => {
    setPhase('loading');
    setError(null);
    try {
      const res = await fetch('/api/naval/new-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim() }),
      });
      if (!res.ok) throw new Error('fail');
      const data: Board = await res.json();
      setBoard(data);
      setRevealed(new Set());
      setShots(0); setHits(0); setScore(0); setDetail(null);
      setPhase('playing');
    } catch {
      setError('Falha ao gerar o tabuleiro. Verifique o backend e tente novamente.');
      setPhase('entry');
    }
  };

  const fire = (comp: Component, cell: Cell) => {
    const k = keyOf(comp.id, cell.stride);
    if (revealed.has(k) || won) return;
    setRevealed((prev) => new Set(prev).add(k));
    setShots((s) => s + 1);
    setDetail({ comp: comp.name, cell });
    if (cell.hasThreat) {
      setHits((h) => h + 1);
      setScore((sc) => sc + (POINTS[cell.severidade || 'baixo'] || 0));
    }
  };

  // ───────── Entrada ─────────
  if (phase === 'entry') {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">🚢 Carcará Naval</h2>
        <p className="text-slate-400 mb-6">Caça-ameaças STRIDE. Escolha um tema e a IA esconde as ameaças no tabuleiro. Acerte as células certas!</p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {THEMES.map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${theme === t ? 'border-cyan-500 bg-cyan-600/20 text-cyan-200' : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-500/60'}`}>
              {t}
            </button>
          ))}
        </div>
        <input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="ou digite um tema (ex.: sistema de votação online)"
          className="w-full mb-4 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-center"
        />
        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={start} disabled={!theme.trim()}
            className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
            🎯 Iniciar jogo
          </button>
          <button onClick={onExit} className="px-6 py-2 text-slate-400 hover:text-slate-200">← Voltar</button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="animate-fade-in text-center py-16">
        <div className="inline-block w-10 h-10 border-4 border-slate-600 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-300">Posicionando as ameaças no tabuleiro…</p>
      </div>
    );
  }

  if (!board) return null;

  // ───────── Tabuleiro ─────────
  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">🚢 Carcará Naval — <span className="text-cyan-300">{board.theme}</span></h2>
          <p className="text-slate-400 text-sm">Clique numa célula (componente × STRIDE) para procurar ameaças.</p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700"><div className="text-lg font-bold text-cyan-300">{found}/{board.totalThreats}</div><div className="text-[11px] text-slate-400">ameaças</div></div>
          <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700"><div className="text-lg font-bold text-emerald-300">{score}</div><div className="text-[11px] text-slate-400">pontos</div></div>
          <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700"><div className="text-lg font-bold text-slate-200">{accuracy}%</div><div className="text-[11px] text-slate-400">precisão ({shots} tiros)</div></div>
        </div>
      </div>

      {won && (
        <div className="mb-4 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-emerald-300 font-semibold">🏆 Você encontrou todas as ameaças! Pontos: {score} · Precisão: {accuracy}% em {shots} tiros.</span>
          <button onClick={() => setPhase('entry')} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Jogar de novo</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabuleiro */}
        <div className="lg:col-span-2 overflow-x-auto">
          <table className="w-full border-separate" style={{ borderSpacing: 6 }}>
            <thead>
              <tr>
                <th className="text-left text-xs text-slate-500 font-medium px-2">Componente</th>
                {STRIDE.map((s) => (
                  <th key={s} className="text-xs text-slate-400 font-semibold w-12" title={s}>{ABBR[s]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {board.components.map((comp) => (
                <tr key={comp.id}>
                  <td className="text-sm text-slate-300 font-medium pr-2 align-middle whitespace-nowrap">{comp.name}</td>
                  {STRIDE.map((s) => {
                    const cell = comp.cells.find((c) => c.stride === s)!;
                    const k = keyOf(comp.id, s);
                    const isRevealed = revealed.has(k);
                    let cls = 'bg-slate-800 border-slate-600 hover:border-cyan-500 hover:bg-slate-700';
                    let content: React.ReactNode = '';
                    if (isRevealed) {
                      if (cell.hasThreat) { cls = `${SEV_COLOR[cell.severidade || 'baixo']} text-white`; content = '💥'; }
                      else { cls = 'bg-slate-900 border-slate-800 text-slate-600'; content = '💧'; }
                    }
                    return (
                      <td key={s} className="p-0">
                        <button
                          onClick={() => fire(comp, cell)}
                          disabled={isRevealed || won}
                          title={`${comp.name} · ${s}`}
                          className={`w-12 h-12 rounded-lg border flex items-center justify-center text-lg transition-all ${cls} ${isRevealed ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {content}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-3">
            <span>💥 ameaça encontrada</span><span>💧 água</span>
            <span className="ml-auto">S Spoofing · T Tampering · R Repudiation · I Information Disclosure · D Denial of Service · E Elevation of Privilege</span>
          </div>
        </div>

        {/* Painel de detalhe */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[180px]">
          {!detail ? (
            <p className="text-slate-500 text-sm">Selecione uma célula para investigar. As ameaças estão escondidas — use seu conhecimento de STRIDE para encontrá-las.</p>
          ) : detail.cell.hasThreat ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-slate-400">{detail.comp} · {detail.cell.stride}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${SEV_COLOR[detail.cell.severidade || 'baixo']} text-white`}>
                  {detail.cell.severidade} · +{POINTS[detail.cell.severidade || 'baixo']}
                </span>
              </div>
              <h3 className="font-bold text-slate-100">💥 {detail.cell.titulo}</h3>
              <p className="text-sm text-slate-300 mt-1">{detail.cell.descricao}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {detail.cell.owasp && <span className="px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">{detail.cell.owasp}</span>}
                {detail.cell.cwe && <span className="px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-300">{detail.cell.cwe}</span>}
              </div>
            </div>
          ) : (
            <div>
              <span className="text-xs text-slate-400">{detail.comp} · {detail.cell.stride}</span>
              <h3 className="font-bold text-slate-300 mt-1">💧 Água</h3>
              <p className="text-sm text-slate-400 mt-1">{detail.cell.motivo || 'Sem ameaça relevante nesta categoria.'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6"><button onClick={onExit} className="text-slate-400 hover:text-slate-200 text-sm">← Sair do jogo</button></div>
    </div>
  );
};

export default NavalGame;
