
import React, { useState } from 'react';

type GameMode = 'solo' | 'group';

interface GameSetupProps {
  onStartGame: (mode: GameMode, story: string, playerCount: number) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [story, setStory] = useState('');
  const [playerCount, setPlayerCount] = useState(2);

  const handleStart = () => {
    if (!mode || !story.trim()) return;
    const finalPlayerCount = mode === 'solo' ? 1 : playerCount;
    if (finalPlayerCount < 2 && mode === 'group') return;
    onStartGame(mode, story, finalPlayerCount);
  };
  
  const renderSetupForm = () => (
     <div className="w-full mt-6 animate-fade-in">
        <p className="text-slate-400 mb-6 text-center max-w-xl mx-auto">
            Insira uma task, user story ou funcionalidade para gerar as alternativas de ameaças e iniciar o jogo.
        </p>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Ex: Como um usuário, quero poder redefinir minha senha através de um link enviado para meu e-mail..."
          className="w-full h-32 p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          aria-label="User Story Input"
        />

        {mode === 'group' && (
            <div className="mt-4">
                <label htmlFor="player-count" className="block text-slate-300 font-medium mb-2">Número de Jogadores</label>
                <input
                    id="player-count"
                    type="number"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Math.max(2, parseInt(e.target.value, 10) || 2))}
                    min="2"
                    max="10"
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        )}

        <button
          onClick={handleStart}
          disabled={!story.trim()}
          className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          Analisar Ameaças
        </button>
     </div>
  );

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Começar uma nova rodada</h2>
      {!mode ? (
        <>
            <p className="text-slate-400 mb-6 text-center">Como você gostaria de jogar?</p>
            <div className="flex gap-4 w-full sm:w-auto">
                <button onClick={() => setMode('solo')} className="flex-1 bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors transform hover:scale-105">
                    🎮 Jogo Solo
                </button>
                <button onClick={() => setMode('group')} className="flex-1 bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors transform hover:scale-105">
                    👨‍👩‍👧‍👦 Jogo em Grupo
                </button>
            </div>
        </>
      ) : (
        renderSetupForm()
      )}
    </div>
  );
};

export default GameSetup;
