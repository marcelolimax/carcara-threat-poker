
import React from 'react';
import { ThreatOption } from '../types';

interface OptionsSelectorProps {
  userStory: string;
  options: ThreatOption[];
  selectedOption: ThreatOption | null;
  onSelectOption: (option: ThreatOption) => void;
  justification: string;
  onJustificationChange: (justification: string) => void;
  onSubmit: () => void;
  gameMode: 'solo' | 'group';
  playerCount: number;
  currentPlayerIndex: number;
}

const OptionsSelector: React.FC<OptionsSelectorProps> = ({
  userStory,
  options,
  selectedOption,
  onSelectOption,
  justification,
  onJustificationChange,
  onSubmit,
  gameMode,
  playerCount,
  currentPlayerIndex,
}) => {
  const isLastPlayer = currentPlayerIndex === playerCount - 1;
  const submitButtonText = gameMode === 'solo'
    ? 'Analisar Resposta'
    : isLastPlayer
      ? 'Finalizar Rodada e Analisar'
      : `Próximo Jogador (${currentPlayerIndex + 2}/${playerCount})`;

  return (
    <div className="animate-fade-in">
      <div className="mb-8 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tema em Análise</h3>
        <p className="text-slate-200 mt-2 italic">"{userStory}"</p>
      </div>

      {gameMode === 'group' && (
        <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-indigo-400">
                Vez do Jogador {currentPlayerIndex + 1}
            </h2>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Escolha a Ameaça Principal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelectOption(option)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedOption?.id === option.id
                ? 'bg-indigo-900/50 border-indigo-500 scale-105 shadow-lg'
                : 'bg-slate-800 border-slate-700 hover:border-indigo-600 hover:bg-slate-700/50'
            }`}
            role="radio"
            aria-checked={selectedOption?.id === option.id}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectOption(option)}
          >
            <span className="font-bold text-lg text-indigo-400 mr-2">Opção {option.id}:</span>
            <span className="text-slate-300">{option.description}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Justifique a Escolha {gameMode === 'group' ? `do Jogador ${currentPlayerIndex + 1}` : ''}</h2>
        <textarea
          value={justification}
          onChange={(e) => onJustificationChange(e.target.value)}
          placeholder="Descreva por que você escolheu esta opção. Quais são os riscos e como você começaria a pensar em uma mitigação?"
          className="w-full h-32 p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          aria-label="Justification Input"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!selectedOption || !justification.trim()}
        className="mt-6 w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
      >
        {submitButtonText}
      </button>
    </div>
  );
};

export default OptionsSelector;