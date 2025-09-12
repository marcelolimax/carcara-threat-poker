import React from 'react';
import { Gamecard } from '../types';

interface GamecardDisplayProps {
  card: Gamecard;
  onPlayAgain: () => void;
}

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const riskColorMap: { [key: string]: string } = {
    baixo: 'bg-green-500/20 text-green-300 border-green-500/30',
    médio: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    alto: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    crítico: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${riskColorMap[risk] || 'bg-gray-500/20 text-gray-300'}`}>
      {risk.charAt(0).toUpperCase() + risk.slice(1)}
    </span>
  );
};

const EffortBadge: React.FC<{ effort: string }> = ({ effort }) => {
    const effortColorMap: { [key: string]: string } = {
    baixo: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    médio: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    alto: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'muito alto': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${effortColorMap[effort] || 'bg-gray-500/20 text-gray-300'}`}>
      {effort.charAt(0).toUpperCase() + effort.slice(1)}
    </span>
  );
};

const GamecardDisplay: React.FC<GamecardDisplayProps> = ({ card, onPlayAgain }) => {
  const cardText = `
🎴 Gamecard de Threat Poker AI

📌 Task: ${card.task}
⚠️ Ameaça escolhida: ${card.chosenThreat}
📖 Prática OWASP SAMM: ${card.sammPractice}
🔒 Risco estimado: ${card.risk}
🛠️ Esforço de mitigação: ${card.mitigationEffort}
💡 Explicação consolidada: ${card.consolidatedExplanation}
✅ Ação sugerida: ${card.suggestedAction}
  `;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(cardText.trim());
    // simple feedback
    alert("Gamecard copiado para a área de transferência!");
  };

  return (
    <div className="animate-fade-in-up p-6 bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">🎴 Gamecard de Threat Poker AI</h2>
      
      <div className="space-y-4 text-slate-300">
        <div>
          <h3 className="font-semibold text-slate-400">📌 Task</h3>
          <p className="italic">"{card.task}"</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-400">⚠️ Ameaça escolhida (Decisão da Equipe)</h3>
          <p>"{card.chosenThreat}"</p>
        </div>
         <div>
          <h3 className="font-semibold text-slate-400">📖 Prática OWASP SAMM</h3>
          <p>{card.sammPractice}</p>
        </div>
        <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold text-slate-400 mb-2">🔒 Risco estimado</h3>
              <RiskBadge risk={card.risk} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-400 mb-2">🛠️ Esforço de mitigação</h3>
              <EffortBadge effort={card.mitigationEffort} />
            </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-400">💡 Análise do Especialista para a Opção Escolhida</h3>
          <div className="mt-2 p-4 bg-slate-800/60 border border-slate-700 rounded-md space-y-3">
             {card.consolidatedExplanation.split('\n').map((paragraph, index) => (
                <p key={index} className="text-slate-300">{paragraph}</p>
             ))}
          </div>
        </div>
        <div className="p-4 bg-emerald-900/50 border border-emerald-500/30 rounded-lg">
          <h3 className="font-semibold text-emerald-300">✅ Ação sugerida</h3>
          <p className="text-emerald-200">{card.suggestedAction}</p>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleCopyToClipboard}
          className="flex-1 bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all"
        >
          Copiar para Backlog
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default GamecardDisplay;