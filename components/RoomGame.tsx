import React, { useState } from 'react';
import { useRoom } from '../hooks/useRoom';
import { PERSONAS, Persona } from '../lib/personas';

interface RoomGameProps {
  onExit: () => void;
}

const RoomGame: React.FC<RoomGameProps> = ({ onExit }) => {
  const r = useRoom();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [story, setStory] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');

  const snap = r.room;
  const me = snap?.participants.find((p) => p.id === snap.youId);
  const isHost = !!me?.isHost;
  const iVoted = snap?.votedParticipantIds.includes(snap.youId);

  const leave = () => { r.leave(); onExit(); };

  // ───────────────── Entrada (escolha de persona) ─────────────────
  if (!snap) {
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {PERSONAS.map((p) => (
            <button
              key={p.name}
              onClick={() => setPersona(p)}
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

        {r.error && <p className="text-center text-rose-400 text-sm mb-4">{r.error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
            <h3 className="font-semibold text-slate-100 mb-3">Criar sala</h3>
            <button
              onClick={() => persona && r.createRoom('v1', persona)}
              disabled={!persona}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Criar nova sala (v1)
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
              onClick={() => persona && joinCode.trim() && r.joinRoom(joinCode.trim(), persona)}
              disabled={!persona || !joinCode.trim()}
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
    <div className="flex items-center justify-between mb-6">
      <div>
        <span className="text-xs text-slate-400">Código da sala</span>
        <div className="font-mono font-bold text-indigo-300 text-lg">{snap.code}</div>
      </div>
      <div className="flex items-center gap-2">
        {snap.participants.map((p) => (
          <span
            key={p.id}
            title={p.name + (p.isHost ? ' (host)' : '')}
            className={`px-2 py-1 rounded-lg border text-sm ${
              p.id === snap.youId ? 'border-indigo-500 bg-indigo-600/20' : 'border-slate-700 bg-slate-800/40'
            }`}
          >
            {p.icon} {p.name}{p.isHost ? ' 👑' : ''}
          </span>
        ))}
      </div>
    </div>
  );

  // ───────────────── Lobby ─────────────────
  if (snap.phase === 'lobby') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        {RoomHeader}
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Lobby</h2>
        <p className="text-slate-400 mb-6">
          Compartilhe o código <span className="font-mono text-indigo-300">{snap.code}</span> com a equipe.
          {' '}{snap.participants.length} participante(s) na sala.
        </p>

        {isHost ? (
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
              onClick={() => story.trim() && r.startRound(story.trim())}
              disabled={!story.trim()}
              className="mt-3 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Iniciar rodada
            </button>
          </div>
        ) : (
          <p className="text-slate-400 italic">Aguardando o host iniciar a rodada…</p>
        )}

        {r.error && <p className="text-rose-400 text-sm mt-4">{r.error}</p>}
        <div className="mt-6"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
      </div>
    );
  }

  // ───────────────── Votação ─────────────────
  if (snap.phase === 'voting') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        {RoomHeader}
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
          <button onClick={r.reveal} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Revelar votos
          </button>
        )}

        {r.error && <p className="text-rose-400 text-sm mt-4">{r.error}</p>}
        <div className="mt-6"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
      </div>
    );
  }

  // ───────────────── Revelação ─────────────────
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {RoomHeader}
      <h2 className="text-2xl font-bold text-slate-100 mb-4">🃏 Votos revelados</h2>
      <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <p className="text-slate-300 italic">"{snap.userStory}"</p>
      </div>
      <div className="space-y-3">
        {snap.votes?.map((v) => {
          const p = snap.participants.find((x) => x.id === v.participantId);
          return (
            <div key={v.participantId} className="p-3 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="text-slate-200 font-medium">{p?.icon} {p?.name} → Opção {v.selectedOptionId}</div>
              <div className="text-sm text-slate-400 mt-1">"{v.justification}"</div>
            </div>
          );
        })}
      </div>
      <div className="mt-6"><button onClick={leave} className="text-slate-400 hover:text-slate-200 text-sm">← Sair da sala</button></div>
    </div>
  );
};

export default RoomGame;
