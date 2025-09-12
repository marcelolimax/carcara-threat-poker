import React, { useState, useCallback } from 'react';
import { GameState, ThreatOption, Gamecard, PlayerResponse, AnalyzedThreat } from './types';
import { generateThreatOptions, analyzeThreats } from './services/geminiService';

import Header from './components/Header';
import GameSetup from './components/ThemeInput';
import OptionsSelector from './components/OptionsSelector';
import DecisionScreen from './components/DecisionScreen';
import GamecardDisplay from './components/GamecardDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

type GameMode = 'solo' | 'group';

const App: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [error, setError] = useState<string | null>(null);

  // Game setup data
  const [userStory, setUserStory] = useState<string>('');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [threatOptions, setThreatOptions] = useState<ThreatOption[]>([]);
  
  // Turn-based data
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [playerResponses, setPlayerResponses] = useState<PlayerResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<ThreatOption | null>(null);
  const [justification, setJustification] = useState<string>('');

  // Analysis & Results data
  const [analyzedThreats, setAnalyzedThreats] = useState<AnalyzedThreat[]>([]);
  const [gamecardData, setGamecardData] = useState<Gamecard | null>(null);

  const handleStartGame = useCallback(async (mode: GameMode, story: string, pCount: number) => {
    setError(null);
    setGameState(GameState.GENERATING_OPTIONS);
    setGameMode(mode);
    setUserStory(story);
    setPlayerCount(pCount);
    
    try {
      const options = await generateThreatOptions(story);
      setThreatOptions(options);
      setGameState(GameState.VOTING);
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar opções de ameaça. Verifique a chave da API e tente novamente.');
      setGameState(GameState.SETUP);
    }
  }, []);
  
  const handlePlayerSubmit = useCallback(async () => {
    if (!selectedOption || !justification.trim()) {
      setError('Por favor, selecione uma opção e forneça uma justificativa.');
      return;
    }
    setError(null);

    const newResponse: PlayerResponse = {
      playerId: currentPlayerIndex,
      selectedOption,
      justification,
    };
    const updatedResponses = [...playerResponses, newResponse];
    setPlayerResponses(updatedResponses);

    // Clear inputs for the next player
    setSelectedOption(null);
    setJustification('');

    const isLastPlayer = currentPlayerIndex === playerCount - 1;

    if (isLastPlayer) {
      setGameState(GameState.ANALYZING);
      try {
        const analysis = await analyzeThreats(userStory, threatOptions, updatedResponses);
        setAnalyzedThreats(analysis);
        setGameState(GameState.DECISION);
      } catch (err) {
        console.error(err);
        setError('Falha ao analisar as ameaças. Tente novamente.');
        setGameState(GameState.VOTING); // Go back to the voting state if analysis fails
      }
    } else {
      // Move to the next player
      setCurrentPlayerIndex(prev => prev + 1);
    }
  }, [selectedOption, justification, currentPlayerIndex, playerCount, playerResponses, userStory, threatOptions]);

  const handleFinalDecision = (chosenThreat: AnalyzedThreat) => {
    // Construct the final gamecard based on the team's choice
    const finalCard: Gamecard = {
      task: userStory,
      chosenThreat: chosenThreat.description,
      risk: chosenThreat.risk,
      mitigationEffort: chosenThreat.mitigationEffort,
      consolidatedExplanation: chosenThreat.analysis,
      suggestedAction: `Implementar a mitigação para a ameaça: "${chosenThreat.description}".`,
      sammPractice: chosenThreat.sammPractice,
    };
    setGamecardData(finalCard);
    setGameState(GameState.RESULTS_READY);
  };


  const handlePlayAgain = () => {
    // Reset all state to initial values
    setGameState(GameState.SETUP);
    setError(null);
    setUserStory('');
    setGameMode('solo');
    setPlayerCount(1);
    setThreatOptions([]);
    setCurrentPlayerIndex(0);
    setPlayerResponses([]);
    setSelectedOption(null);
    setJustification('');
    setAnalyzedThreats([]);
    setGamecardData(null);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.SETUP:
        return <GameSetup onStartGame={handleStartGame} />;
      
      case GameState.GENERATING_OPTIONS:
        return <LoadingSpinner text="Gerando rodada..." />;
      
      case GameState.ANALYZING:
        return <LoadingSpinner text="Consultando especialista para análise..." />;
        
      case GameState.VOTING:
        return (
          <OptionsSelector
            userStory={userStory}
            options={threatOptions}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            justification={justification}
            onJustificationChange={setJustification}
            onSubmit={handlePlayerSubmit}
            gameMode={gameMode}
            playerCount={playerCount}
            currentPlayerIndex={currentPlayerIndex}
          />
        );

      case GameState.DECISION:
        return <DecisionScreen analyzedThreats={analyzedThreats} onSubmitDecision={handleFinalDecision} />;

      case GameState.RESULTS_READY:
        return gamecardData && <GamecardDisplay card={gamecardData} onPlayAgain={handlePlayAgain} />;
        
      default:
        return <GameSetup onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <Header />
      <main className="w-full max-w-4xl mt-8">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
        <div className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm">
          {renderContent()}
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Gemini API. Criado para análise de risco ágil.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;