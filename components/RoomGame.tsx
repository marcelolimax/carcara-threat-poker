import React, { useState, useEffect } from 'react';
import { useRoom, RoomVote } from '../hooks/useRoom';
import { PERSONAS, Persona } from '../lib/personas';
import SecurityCardsDisplay from './SecurityCardsDisplay';

interface RoomGameProps {
  onExit: () => void;
  mode?: 'v1' | 'v2';
  initialStories?: string[];
  initialContext?: string;
}

const RoomGame: React.FC<RoomGameProps> = ({ onExit, mode, initialStories, initialContext }) => {
  const roomMode: 'v1' | 'v2' = mode ?? 'v1';
  const r = useRoom();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [nick, setNick] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [story, setStory] = useState('');
  const [storiesText, setStoriesText] = useState((initialStories || []).join('\n'));
  const [contextText, setContextText] = useState(initialContext || '');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [starting, setStarting] = useState(false);
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState('');

  const snap = r.room;
  const me = snap?.participants.find((p) => p.id === snap.youId);
  const isHost = !!me?.isHost;
  const iVoted = snap?.votedParticipantIds.includes(snap.youId);

  useEffect(() => {
    if (snap?.phase && snap.phase !== 'generating') setStarting(false);
  }, [snap?.phase]);

  // Ao trocar de história (v2), limpa a seleção/justificativa locais.
  useEffect(() => {
    setSelectedOptionId(null);
    setJustification('');
  }, [snap?.currentStoryIndex]);

  const leave = () => { r.leave(); onExit(); };

  const handleStart = () => {
    if (starting || !story.trim()) return;
    setStarting(true);
    r.startRound(story.trim());
  };

  const handleStartV2 = () => {
    const lines = storiesText.split('\n').map((s) => s.trim()).filter(Boolean);
    if (starting || lines.length === 0) return;
    setStarting(true);
    r.startV2(lines, contextText.trim() || undefined);
  };

  const pickPersona = (p: Persona) => {
    setPersona(p);
    if (!nick.trim()) setNick(p.name);
  };

  const effectivePersona = (): Persona | null =>
    persona ? { name: (nick.trim() || persona.name).slice(0, 24), icon: persona.icon } : null;

  // ───────────────── Entrada (escolha de persona) ─────────────────
  if (!snap) {
    const ep = effectivePersona();
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-2">👥 Sala Multiplayer</h2>
        <p className="text-slate-400 text-center mb-6">Escolha sua persona e crie ou entre em uma sala.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            disabled
            title="Disponível em breve"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-500 cursor-not-allowed"
          >
            <span className="text-lg">🔒</span> Entrar com Google <span className="text-xs">(em breve)</span>
          </button>
          <span className="self-center text-slate-500 text-sm">ou entre como uma persona:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {PERSONAS.map((p) => (
            <button
              key={p.name}
              onClick={() => pickPersona(p)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                persona?.name === p.name
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-slate-700 bg-slate-800/40 hover:border-indigo-500/60'
              }`}
            >
              <span className="text-3xl">{p.icon}</span>
              <span className="text-sm font-medium text-slate-200">{p.name}</span>
            </button>
          ))}
        </div>

        {persona && (
          <div className="mb-8 max-w-sm mx-auto text-center">
            <label className="block text-xs text-slate-400 mb-1">Seu nick (editável)</label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{persona.icon}</span>
              <input
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={24}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
              />
            </div>
          </div>
        )}

        {r.error && <p className="text-center text-rose-400 text-sm mb-4">{r.error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
            <h3 className="font-semibold text-slate-100 mb-3">Criar sala</h3>
            <button
              onClick={() => ep && r.createRoom(roomMode, ep)}
              disabled={!ep}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Criar nova sala
            </button>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
            <h3 className="font-semibold text-slate-100 mb-3">Entrar em sala</h3>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="CARCARA-XXXX"
              className="w-full mb-3 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-center font-mono"
            />
            <button
              onClick={() => ep && joinCode.trim() && r.joinRoom(joinCode.trim(), ep)}
              disabled={!ep || !joinCode.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Entrar
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-200 text-sm">← Voltar</button>
        </div>
      </div>
    );
  }

  // ───────────────── Cabeçalho comum da sala ─────────────────
  const RoomHeader = (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div>
        <span className="text-xs text-slate-400">Código da sala</span>
        <div className="font-mono font-bold text-indigo-300 text-lg">{snap.code}</div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {snap.participants.map((p) => (
          <span
            key={p.id}
            title={p.name + (p.isHost ? ' (host)' : '')}
            className={`px-2 py-1 rounded-lg border text-sm ${
              p.id === snap.youId ? 'border-indigo-500 bg-indigo-600/20' : 'border-slate-700 bg-slate-800/40'
            }`}
          >
            {p.icon} {p.name}{p.isHost ? ' 👑' : ''}
            {p.id === snap.youId && !editingNick && (
              <button
                onClick={() => { setEditingNick(true); setNickDraft(p.name); }}
                className="ml-1 text-slate-400 hover:text-slate-200"
                title="Editar nick"
              >✏️</button>
            )}
          </span>
        ))}
      </div>
    </div>
  );

  const NickEditor = editingNick && me && (
    <div className="mb-4 flex items-center gap-2 justify-end">
      <span className="text-2xl">{me.icon}</span>
      <input
        value={nickDraft}
        onChange={(e) => setNickDraft(e.target.value)}
        maxLength={24}
        className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
      />
      <button
        onClick={() => { if (nickDraft.trim()) { r.updatePersona({ name: nickDraft.trim(), icon: me.icon }); setEditingNick(false); } }}
        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
      >Salvar</button>
      <button onClick={() => setEditingNick(false)} className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-sm">Cancelar</button>
    </div>
  );

  // ───────────────── Lobby ─────────────────
  if (snap.phase === 'lobby') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        {RoomHeader}
        {NickEditor}
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Lobby</h2>
        <p className="text-slate-400 mb-6">
          Compartilhe o código <span className="font-mono text-indigo-300">{snap.code}</span> com a equipe.
          {' '}{snap.participants.length} participante(s) na sala.
        </p>

        {isHost ? (
          snap.mode === 'v2' ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Histórias de usuário (uma por linha)</label>
              <textarea
                value={storiesText}
                onChange={(e) => setStoriesText(e.target.value)}
                rows={4}
                placeholder={"Como um usuário, quero redefinir minha senha...\nComo admin, quero exportar relatórios..."}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500"
              />
              <label className="block text-sm font-medium text-slate-300 mt-3 mb-2">Contexto técnico (opcional)</label>
              <input
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Ex.: app web em Node + Postgres, autenticação JWT…"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500"
              />
              <button
                onClick={handleStartV2}
                disabled={!storiesText.trim() || starting}
                className="mt-3 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {starting ? 'Preparando…' : 'Iniciar análise'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">História de usuário</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={3}
                placeholder="Como um usuário, quero..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500"
              />
              <button
                onClick={handleStart}
                disabled={!story.trim() || starting}
                className="mt-3 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {starting ? 'Gerando opções…' : 'Iniciar rodada'}
              </button>
            </div>
          )
        ) : (
          <p className="text-slate-400 italic">Aguardando o host iniciar…</p>
        )}

        {r.error && <p className="text-rose-400 text-sm mt-4">{r.error}</p>}
        <div className="mt-6"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
      </div>
    );
  }

  // ───────────────── Gerando opções (IA processando) ─────────────────
  if (snap.phase === 'generating') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        {RoomHeader}
        <div className="text-center py-12">
          <div className="inline-block w-10 h-10 border-4 border-slate-600 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-300">Gerando as opções de ameaça com a IA…</p>
          <p className="text-slate-500 text-sm mt-1">Aguarde — isso leva alguns segundos.</p>
        </div>
        <div className="text-center"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
      </div>
    );
  }

  // ───────────────── Votação ─────────────────
  if (snap.phase === 'voting') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        {RoomHeader}
        {NickEditor}
        {snap.mode === 'v2' && snap.storyCount ? (
          <p className="text-xs text-purple-300 mb-2">História {(snap.currentStoryIndex ?? 0) + 1} de {snap.storyCount}</p>
        ) : null}
        <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-400 mb-1">📌 História</h4>
          <p className="text-slate-300 italic">"{snap.userStory}"</p>
        </div>

        <p className="text-sm text-slate-400 mb-3">
          {snap.votedParticipantIds.length}/{snap.participants.length} já votaram
        </p>

        {iVoted ? (
          <p className="text-emerald-400 mb-4">✓ Seu voto foi registrado. Aguardando os demais…</p>
        ) : (
          <div className="space-y-3 mb-4">
            {snap.options?.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedOptionId === opt.id ? 'border-indigo-500 bg-indigo-900/40' : 'border-slate-700 bg-slate-800 hover:border-indigo-600'
                }`}
              >
                <span className="font-bold text-indigo-400 mr-2">Opção {opt.id}:</span>
                <span className="text-slate-300">{opt.description}</span>
              </button>
            ))}
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              placeholder="Justifique sua escolha (1-2 frases)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500"
            />
            <button
              onClick={() => selectedOptionId && justification.trim() && r.submitVote(selectedOptionId, justification.trim())}
              disabled={!selectedOptionId || !justification.trim()}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Votar
            </button>
          </div>
        )}

        {isHost && (
          snap.mode === 'v2' ? (
            <button onClick={r.nextStory} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              {(snap.currentStoryIndex ?? 0) < ((snap.storyCount ?? 1) - 1) ? 'Próxima história →' : '🃏 Gerar Cards de Segurança'}
            </button>
          ) : (
            <button onClick={r.reveal} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Revelar votos
            </button>
          )
        )}

        {r.error && <p className="text-rose-400 text-sm mt-4">{r.error}</p>}
        <div className="mt-6"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
      </div>
    );
  }

  // ───────────────── v2: gerando cards ─────────────────
  if (snap.phase === 'generating_cards') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        {RoomHeader}
        <div className="text-center py-12">
          <div className="inline-block w-10 h-10 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-300">Gerando os Cards de Segurança com a IA…</p>
          <p className="text-slate-500 text-sm mt-1">Consolidando os votos e classificando as ameaças.</p>
        </div>
      </div>
    );
  }

  // ───────────────── v2: cards gerados ─────────────────
  if (snap.phase === 'cards') {
    const copySelected = (sel: any[]) => {
      const text = (sel || []).map((c: any) => `${c.card_id} — ${c.ameaca_titulo} (ASP ${c.asp_score ?? 0})`).join('\n');
      try { navigator.clipboard?.writeText(text); alert('✅ Cards selecionados copiados!'); } catch { /* noop */ }
    };
    return (
      <div className="animate-fade-in max-w-7xl mx-auto">
        {RoomHeader}
        <SecurityCardsDisplay cards={snap.cards || []} onSelectCards={copySelected} onPlayAgain={leave} />
      </div>
    );
  }

  // ───────────────── Revelação + Decisão ─────────────────
  // (phase 'revealed' ou 'decision') — as opções permanecem visíveis para discussão.
  const votesByOption: Record<string, RoomVote[]> = {};
  (snap.votes || []).forEach((v) => {
    (votesByOption[v.selectedOptionId] = votesByOption[v.selectedOptionId] || []).push(v);
  });
  const nameOf = (pid: string) => {
    const p = snap.participants.find((x) => x.id === pid);
    return p ? `${p.icon} ${p.name}` : pid;
  };
  const chosen = snap.chosenOptionId;

  const copyDecision = async () => {
    if (!chosen) return;
    const opt = snap.options?.find((o) => o.id === chosen);
    const an = snap.analysis?.find((a) => a.id === chosen);
    const allJust = (snap.votes || [])
      .map((v) => `- ${nameOf(v.participantId)} → Opção ${v.selectedOptionId}: "${v.justification}"`)
      .join('\n');
    const text = `🎴 Decisão — Carcará Threat Poker (v1 em grupo)
Sala: ${snap.code}

📌 História: "${snap.userStory || ''}"
⚠️ Ameaça priorizada (Opção ${chosen}): ${opt?.description || ''}` +
      (an ? `\n🔒 Risco: ${an.risk} | 🛠️ Esforço de mitigação: ${an.mitigationEffort}\n🏷️ STRIDE: ${an.stride?.join(', ') || '—'}\n💡 Análise: ${an.analysis || ''}` : '') +
      `\n\n🗳️ Justificativas da equipe:\n${allJust || '—'}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert('✅ Decisão copiada para a área de transferência!');
        return;
      }
    } catch { /* fallback abaixo */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('✅ Decisão copiada! (método alternativo)');
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {RoomHeader}
      {NickEditor}
      <h2 className="text-2xl font-bold text-slate-100 mb-2">🃏 Discussão e decisão</h2>
      <p className="text-slate-400 mb-4 text-sm">
        Votos revelados. Discutam as justificativas e {isHost ? 'defina' : 'o host define'} a ameaça a priorizar.
      </p>

      <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <p className="text-slate-300 italic">"{snap.userStory}"</p>
      </div>

      {chosen && (
        <div className="mb-4 p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-emerald-300">✅ Decisão da equipe: <strong>Opção {chosen}</strong></span>
          <button
            onClick={copyDecision}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors text-sm"
          >
            📋 Copiar decisão para o backlog
          </button>
        </div>
      )}

      {snap.phase === 'revealed' && !snap.analysis && (
        <p className="text-slate-500 text-sm mb-4">Analisando as opções com a IA… (a discussão já pode começar)</p>
      )}

      <div className="space-y-4">
        {snap.options?.map((opt) => {
          const voters = votesByOption[opt.id] || [];
          const an = snap.analysis?.find((a) => a.id === opt.id);
          const isChosen = chosen === opt.id;
          return (
            <div
              key={opt.id}
              className={`p-4 rounded-xl border ${isChosen ? 'border-emerald-500 bg-emerald-900/15' : 'border-slate-700 bg-slate-800/50'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="font-bold text-indigo-400 mr-2">Opção {opt.id}:</span>
                  <span className="text-slate-200">{opt.description}</span>
                </div>
                <span className="shrink-0 text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-300">
                  {voters.length} voto(s)
                </span>
              </div>

              {an && (
                <div className="mt-3 text-xs flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300">Risco: {an.risk}</span>
                  <span className="px-2 py-1 rounded border border-sky-500/30 bg-sky-500/10 text-sky-300">Esforço: {an.mitigationEffort}</span>
                  {an.stride?.length > 0 && (
                    <span className="px-2 py-1 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">STRIDE: {an.stride.join(', ')}</span>
                  )}
                </div>
              )}
              {an?.analysis && <p className="mt-2 text-sm text-slate-400">{an.analysis}</p>}

              {voters.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-slate-700/60 pt-2">
                  {voters.map((v) => (
                    <div key={v.participantId} className="text-sm text-slate-400">
                      <span className="text-slate-300">{nameOf(v.participantId)}:</span> "{v.justification}"
                    </div>
                  ))}
                </div>
              )}

              {isHost && (
                <button
                  onClick={() => r.decide(opt.id)}
                  className={`mt-3 px-4 py-1.5 rounded-lg text-sm transition-colors ${
                    isChosen ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  {isChosen ? '✓ Decisão atual' : 'Definir como decisão'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {r.error && <p className="text-rose-400 text-sm mt-4">{r.error}</p>}
      <div className="mt-6"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
    </div>
  );
};

export default RoomGame;
