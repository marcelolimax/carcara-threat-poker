import React, { useState } from 'react';
import { ThreatOption, UserStoryInput } from '../types';

interface V2VotingData {
  storyId: string;
  selectedOptionId: string;
  quickJustification: string;
}

interface V2VotingScreenProps {
  stories: UserStoryInput[];
  threatOptionsByStory: { [storyId: string]: ThreatOption[] };
  onVotingComplete: (votingData: V2VotingData[]) => void;
}

const V2VotingScreen: React.FC<V2VotingScreenProps> = ({
  stories,
  threatOptionsByStory,
  onVotingComplete
}) => {
  const [votes, setVotes] = useState<{ [storyId: string]: V2VotingData }>({});
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const currentStory = stories[currentStoryIndex];
  const currentOptions = threatOptionsByStory[currentStory.id] || [];
  const isLastStory = currentStoryIndex === stories.length - 1;
  
  const currentVote = votes[currentStory.id];

  const handleVote = (optionId: string) => {
    setVotes(prev => ({
      ...prev,
      [currentStory.id]: {
        ...prev[currentStory.id],
        storyId: currentStory.id,
        selectedOptionId: optionId,
        quickJustification: prev[currentStory.id]?.quickJustification || ''
      }
    }));
  };

  const handleJustificationChange = (justification: string) => {
    setVotes(prev => ({
      ...prev,
      [currentStory.id]: {
        ...prev[currentStory.id],
        storyId: currentStory.id,
        selectedOptionId: prev[currentStory.id]?.selectedOptionId || '',
        quickJustification: justification
      }
    }));
  };

  const handleNext = () => {
    if (isLastStory) {
      // Complete voting process
      const votingData = Object.values(votes).filter(vote => 
        vote.selectedOptionId && vote.quickJustification.trim()
      );
      onVotingComplete(votingData);
    } else {
      setCurrentStoryIndex(prev => prev + 1);
    }
  };

  const canProceed = currentVote?.selectedOptionId && currentVote?.quickJustification.trim();
  const completedCount = Object.values(votes).filter(vote => 
    vote.selectedOptionId && vote.quickJustification.trim()
  ).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          🗳️ Votação Colaborativa Rápida
        </h2>
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <span>História {currentStoryIndex + 1} de {stories.length}</span>
          <span>•</span>
          <span>{completedCount}/{stories.length} concluídas</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / stories.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Story */}
      <div className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
          📌 História em Análise
        </h3>
        <p className="text-slate-200 text-lg italic">"{currentStory.content}"</p>
      </div>

      {/* Threat Options */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-100 mb-4">
          Qual ameaça você considera mais crítica?
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {currentOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleVote(option.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                currentVote?.selectedOptionId === option.id
                  ? 'bg-indigo-900/50 border-indigo-500 scale-[1.02] shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 border-slate-700 hover:border-indigo-600 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    currentVote?.selectedOptionId === option.id
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-slate-400'
                  }`}>
                    {currentVote?.selectedOptionId === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-lg text-indigo-400 mr-2">
                    Opção {option.id}:
                  </span>
                  <span className="text-slate-300">{option.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Justification */}
      {currentVote?.selectedOptionId && (
        <div className="mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-100 mb-3">
            💭 Justificativa Rápida
          </h3>
          <textarea
            value={currentVote.quickJustification}
            onChange={(e) => handleJustificationChange(e.target.value)}
            placeholder="Por que esta opção é mais crítica? (1-2 frases)"
            className="w-full h-20 p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            maxLength={200}
          />
          <div className="text-right text-xs text-slate-500 mt-1">
            {currentVote.quickJustification.length}/200
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentStoryIndex(prev => Math.max(0, prev - 1))}
          disabled={currentStoryIndex === 0}
          className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div className="text-center">
          <p className="text-sm text-slate-400 mb-2">
            {isLastStory ? 'Finalize a votação' : 'Continue para a próxima história'}
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`px-6 py-3 font-bold rounded-lg transition-all ${
            isLastStory
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          } disabled:bg-slate-600 disabled:cursor-not-allowed`}
        >
          {isLastStory ? '🚀 Gerar Cards de Segurança' : 'Próxima →'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-400 mb-2">💡 Dica</h4>
        <p className="text-sm text-slate-300">
          Esta votação rápida fornece contexto adicional para a IA gerar cards mais precisos. 
          As classificações técnicas (OWASP Top 10, CWE, CVSS) serão geradas automaticamente pela IA.
        </p>
      </div>
    </div>
  );
};

export default V2VotingScreen;