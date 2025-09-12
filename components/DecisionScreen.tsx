import React, { useState } from 'react';
import { AnalyzedThreat } from '../types';

interface DecisionScreenProps {
  analyzedThreats: AnalyzedThreat[];
  onSubmitDecision: (chosenThreat: AnalyzedThreat) => void;
}

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const riskColorMap: { [key: string]: string } = {
    baixo: 'bg-green-500/20 text-green-300 border-green-500/30',
    médio: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    alto: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    crítico: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${riskColorMap[risk]}`}>{risk}</span>;
};

const EffortBadge: React.FC<{ effort: string }> = ({ effort }) => {
  const effortColorMap: { [key: string]: string } = {
    baixo: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    médio: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    alto: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'muito alto': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${effortColorMap[effort]}`}>{effort}</span>;
};


const DecisionScreen: React.FC<DecisionScreenProps> = ({ analyzedThreats, onSubmitDecision }) => {
  const [selectedThreat, setSelectedThreat] = useState<AnalyzedThreat | null>(null);

  const handleSubmit = () => {
    if (selectedThreat) {
      onSubmitDecision(selectedThreat);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-slate-100 mb-2">Análise do Especialista</h2>
      <p className="text-slate-400 text-center mb-8">
        A IA analisou cada opção com base no OWASP SAMM. Discuta com sua equipe e escolha a ameaça a ser priorizada.
      </p>

      <div className="space-y-4">
        {analyzedThreats.map((threat) => (
          <div
            key={threat.id}
            onClick={() => setSelectedThreat(threat)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedThreat?.id === threat.id
                ? 'bg-indigo-900/50 border-indigo-500 scale-[1.02] shadow-lg'
                : 'bg-slate-800 border-slate-700 hover:border-indigo-600 hover:bg-slate-700/50'
            }`}
             role="radio"
             aria-checked={selectedThreat?.id === threat.id}
             tabIndex={0}
             onKeyPress={(e) => e.key === 'Enter' && setSelectedThreat(threat)}
          >
            <div className="flex justify-between items-start mb-3">
                <p className="text-slate-300 flex-1 pr-4">
                    <span className="font-bold text-lg text-indigo-400 mr-2">Opção {threat.id}:</span>
                    {threat.description}
                </p>
                <div className="flex flex-col gap-3 ml-4 flex-shrink-0">
                    <div>
                        <h4 className="text-xs font-medium text-slate-400 mb-1">Nível de Risco</h4>
                        <RiskBadge risk={threat.risk} />
                    </div>
                    <div>
                        <h4 className="text-xs font-medium text-slate-400 mb-1">Esforço de Mitigação</h4>
                        <EffortBadge effort={threat.mitigationEffort} />
                    </div>
                </div>
            </div>
            <div className="mt-2 p-3 bg-slate-900/70 rounded-md">
                 <p className="text-sm text-slate-400">{threat.analysis}</p>
                 <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-700/50">
                    <strong>Prática OWASP SAMM:</strong> {threat.sammPractice}
                 </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedThreat}
        className="mt-8 w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
      >
        Confirmar Decisão e Gerar Gamecard
      </button>
    </div>
  );
};

export default DecisionScreen;