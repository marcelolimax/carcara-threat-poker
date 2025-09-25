import React, { useState, useCallback } from 'react';
import { GameState, ThreatOption, Gamecard, PlayerResponse, AnalyzedThreat, SecurityCard, UserStoryInput, V2VotingData } from './types';

import Header from './components/Header';
import GameSetup from './components/ThemeInput';
import MultiStorySetup from './components/MultiStorySetup';
import V2VotingScreen from './components/V2VotingScreen';
import OptionsSelector from './components/OptionsSelector';
import DecisionScreen from './components/DecisionScreen';
import GamecardDisplay from './components/GamecardDisplay';
import SecurityCardsDisplay from './components/SecurityCardsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

type GameMode = 'solo' | 'group';
type AppMode = 'v1' | 'v2'; // v1 = original poker, v2 = security cards

const App: React.FC = () => {
  // App mode selection
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [error, setError] = useState<string | null>(null);

  // v1 Game setup data (original poker)
  const [userStory, setUserStory] = useState<string>('');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [threatOptions, setThreatOptions] = useState<ThreatOption[]>([]);
  
  // v1 Turn-based data
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [playerResponses, setPlayerResponses] = useState<PlayerResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<ThreatOption | null>(null);
  const [justification, setJustification] = useState<string>('');

  // v1 Analysis & Results data
  const [analyzedThreats, setAnalyzedThreats] = useState<AnalyzedThreat[]>([]);
  const [gamecardData, setGamecardData] = useState<Gamecard | null>(null);
  
  // v2 Security Cards data
  const [securityCards, setSecurityCards] = useState<SecurityCard[]>([]);
  const [v2IncludeVoting, setV2IncludeVoting] = useState(false);
  const [v2Stories, setV2Stories] = useState<UserStoryInput[]>([]);
  const [v2ContextoOpcional, setV2ContextoOpcional] = useState<string>();
  const [v2ThreatOptionsByStory, setV2ThreatOptionsByStory] = useState<{[storyId: string]: ThreatOption[]}>({});
  const [v2VotingData, setV2VotingData] = useState<V2VotingData[]>([]);

  const handleStartGame = useCallback(async (mode: GameMode, story: string, pCount: number) => {
    setError(null);
    setGameState(GameState.GENERATING_OPTIONS);
    setGameMode(mode);
    setUserStory(story);
    setPlayerCount(pCount);
    
    try {
      const response = await fetch('/api/generate-threat-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userStory: story }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate threat options');
      }

      const data = await response.json();
      setThreatOptions(data.options);
      setGameState(GameState.VOTING);
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar opções de ameaça. Verifique o backend e tente novamente.');
      setGameState(GameState.SETUP);
    }
  }, []);
  
  const handlePlayerSubmit = useCallback(() => {
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

    // Use the functional form of setState to get the latest state
    setPlayerResponses(prevResponses => {
      const updatedResponses = [...prevResponses, newResponse];
      const isLastPlayer = currentPlayerIndex === playerCount - 1;

      if (isLastPlayer) {
        setGameState(GameState.ANALYZING);
        fetch('/api/analyze-threats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userStory, allOptions: threatOptions, playerResponses: updatedResponses }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to analyze threats');
          }
          return response.json();
        })
        .then(data => {
          setAnalyzedThreats(data.analyzedOptions);
          setGameState(GameState.DECISION);
        })
        .catch(err => {
          console.error(err);
          setError('Falha ao analisar as ameaças. Tente novamente.');
          setGameState(GameState.VOTING);
        });
      } else {
        setCurrentPlayerIndex(prev => prev + 1);
      }
      
      return updatedResponses;
    });

    // Clear inputs for the next turn
    setSelectedOption(null);
    setJustification('');

  }, [selectedOption, justification, currentPlayerIndex, playerCount, userStory, threatOptions]);

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


  // v2 handlers
  const handleStartSecurityAnalysis = useCallback(async (stories: UserStoryInput[], contextoOpcional?: string, includeVoting?: boolean) => {
    setError(null);
    setV2Stories(stories);
    setV2ContextoOpcional(contextoOpcional);
    setV2IncludeVoting(includeVoting || false);
    
    if (includeVoting) {
      // Generate threat options for voting first
      setGameState(GameState.GENERATING_OPTIONS);
      
      try {
        const threatOptionsByStory: {[storyId: string]: ThreatOption[]} = {};
        
        for (const story of stories.filter(s => s.selected)) {
          const response = await fetch('/api/generate-threat-options', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userStory: story.content }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate threat options');
          }

          const data = await response.json();
          threatOptionsByStory[story.id] = data.options;
        }
        
        setV2ThreatOptionsByStory(threatOptionsByStory);
        setGameState(GameState.VOTING);
      } catch (err) {
        console.error(err);
        setError('Falha ao gerar opções de ameaças. Verifique o backend e tente novamente.');
        setGameState(GameState.SETUP);
      }
    } else {
      // Direct analysis without voting
      await handleGenerateSecurityCards(stories, contextoOpcional);
    }
  }, []);
  
  const handleV2VotingComplete = useCallback(async (votingData: V2VotingData[]) => {
    setV2VotingData(votingData);
    await handleGenerateSecurityCards(v2Stories, v2ContextoOpcional, votingData);
  }, [v2Stories, v2ContextoOpcional]);
  
  const handleGenerateSecurityCards = useCallback(async (stories: UserStoryInput[], contextoOpcional?: string, votingData?: V2VotingData[]) => {
    setGameState(GameState.ANALYZING);
    
    try {
      const response = await fetch('/api/v2/generate-security-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userStories: stories, 
          contextoOpcional,
          votingData,
          includeVoting: !!votingData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate security cards');
      }

      const data = await response.json();
      setSecurityCards(data.cards);
      setGameState(GameState.RESULTS_READY);
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar Cards de Segurança. Verifique o backend e tente novamente.');
      setGameState(GameState.SETUP);
    }
  }, []);
  
  const handleSelectCardsForBacklog = useCallback((selectedCards: SecurityCard[]) => {
    // Here you could integrate with external tools like Jira, Trello, etc.
    const cardIds = selectedCards.map(card => card.card_id).join(', ');
    
    // Create comprehensive cards text for backlog export
    const allCardsText = selectedCards.map((card, index) => {
      return `═══════════════════════════════════════════════════
🎴 CARD DE SEGURANÇA ${index + 1}/${selectedCards.length} - Carcará Threat Poker v2
═══════════════════════════════════════════════════

📌 CARD ID: ${card.card_id}
📝 USER STORY: ${card.user_story}
⚠️ AMEAÇA: ${card.ameaca_titulo}
📖 DESCRIÇÃO: ${card.descricao_ameaca}

🏷️ CLASSIFICAÇÕES TÉCNICAS:
• OWASP Top 10: ${card.classificacoes.owasp_top10.categoria} (📊${Math.round(card.classificacoes.owasp_top10.confianca * 100)}% confiança IA)
• CWE: ${card.classificacoes.cwe.id} - ${card.classificacoes.cwe.nome} (📊${Math.round(card.classificacoes.cwe.confianca * 100)}% confiança IA)
• CVSS 4.0: ${card.classificacoes.cvss.severidade} (${card.classificacoes.cvss.pontuacao_base.toFixed(1)}) - ${card.classificacoes.cvss.vetor} (📊${Math.round(card.classificacoes.cvss.confianca * 100)}% confiança IA)

📊 PRIORIZAÇÃO ASP:
• Score ASP: ${card.asp_score || 0}/100
• Risco: ${card.insumos_asp.risco.valor}/10
• Esforço: ${card.insumos_asp.esforco.valor}/10
• Decisão Sprint: ${card.decisao_sprint_sugerida}

✅ SUBTAREFAS DE IMPLEMENTAÇÃO:
${card.subtarefas_sugeridas.map(task => `• ${task}`).join('\n')}

🔒 DEFINITION OF DONE - SEGURANÇA:
${card.dod_seguranca.map(dod => `• ${dod}`).join('\n')}

📚 RECURSOS OWASP:
${card.cheat_sheets.map(sheet => `• ${sheet.titulo}: ${sheet.url}`).join('\n')}

💡 OBSERVAÇÕES:
${card.observacoes}

🔖 METADADOS:
• Versão do Esquema: ${card.versao_esquema}
• Gerado por: Carcará Threat Poker v2
• IA: Google Gemini`;
    }).join('\n\n');
    
    const summaryText = `

═══════════════════════════════════════════════════
📋 RESUMO DA SELEÇÃO PARA BACKLOG
═══════════════════════════════════════════════════

📊 Total de cards selecionados: ${selectedCards.length}
🔗 IDs dos cards: ${cardIds}
⏰ Data/Hora: ${new Date().toLocaleString('pt-BR')}
🤖 Ferramenta: Carcará Threat Poker v2

🎯 Cards ordenados por prioridade ASP (maior = mais crítico):
${selectedCards.map((card, i) => `${i+1}. ${card.card_id} - ASP: ${card.asp_score}/100 - ${card.ameaca_titulo}`).join('\n')}
`;
    
    const finalText = allCardsText + summaryText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(finalText).then(() => {
      alert(`✅ ${selectedCards.length} cards copiados para área de transferência!\n\n📋 Conteúdo inclui:\n• Informações completas dos cards\n• Classificações técnicas (OWASP/CWE/CVSS)\n• Subtarefas e DoD de segurança\n• Links para Cheat Sheets\n• Resumo da seleção\n\nPronto para colar no seu backlog! 🚀`);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`✅ ${selectedCards.length} cards copiados! (método alternativo)`);
    });
  }, []);

  const handlePlayAgain = () => {
    // Reset all state to initial values
    setAppMode(null);
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
    setSecurityCards([]);
    setV2IncludeVoting(false);
    setV2Stories([]);
    setV2ContextoOpcional(undefined);
    setV2ThreatOptionsByStory({});
    setV2VotingData([]);
  };

  const renderModeSelection = () => (
    <div className="animate-fade-in text-center">
      <h2 className="text-4xl font-bold text-slate-100 mb-4">
        🎦 Carcará Threat Poker
      </h2>
      <p className="text-slate-400 mb-8 text-lg">
        Escolha o modo de análise de segurança para sua equipe
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div 
          onClick={() => setAppMode('v1')}
          className="p-8 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500 cursor-pointer transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-4xl mb-4">🏃</div>
          <h3 className="text-xl font-bold text-slate-100 mb-3">Modo Clássico (v1)</h3>
          <p className="text-slate-300 text-sm mb-4">
            Jogo de poker tradicional com votação em equipe, justificativas e análise colaborativa. 
            Ideal para workshops e dinâmicas de equipe.
          </p>
          <ul className="text-xs text-slate-400 text-left space-y-1">
            <li>• Votação interativa</li>
            <li>• Justificativas da equipe</li>
            <li>• Decisão colaborativa</li>
            <li>• 1 gamecard por rodada</li>
          </ul>
        </div>
        
        <div 
          onClick={() => setAppMode('v2')}
          className="p-8 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500 cursor-pointer transition-all duration-300 transform hover:scale-105 relative"
        >
          <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            NOVO
          </div>
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-slate-100 mb-3">Cards de Segurança (v2)</h3>
          <p className="text-slate-300 text-sm mb-4">
            Análise rápida e abrangente com IA. Gera cards técnicos completos com OWASP Top 10, 
            CWE, CVSS 4.0 e priorização ASP. Ideal para plannings ágeis.
          </p>
          <ul className="text-xs text-slate-400 text-left space-y-1">
            <li>• Múltiplas histórias simultâneas</li>
            <li>• Classificações técnicas automáticas</li>
            <li>• Priorização ASP (Risco × Esforço)</li>
            <li>• Subtarefas e DoD pré-definidos</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    // Mode selection screen
    if (!appMode) {
      return renderModeSelection();
    }
    
    // v2 Security Cards workflow
    if (appMode === 'v2') {
      switch (gameState) {
        case GameState.SETUP:
          return <MultiStorySetup onStartAnalysis={handleStartSecurityAnalysis} />;
        
        case GameState.GENERATING_OPTIONS:
          return <LoadingSpinner text={v2IncludeVoting ? "Gerando opções para votação..." : "Gerando Cards de Segurança com IA..."} />;
        
        case GameState.VOTING:
          return (
            <V2VotingScreen 
              stories={v2Stories.filter(s => s.selected)}
              threatOptionsByStory={v2ThreatOptionsByStory}
              onVotingComplete={handleV2VotingComplete}
            />
          );
        
        case GameState.ANALYZING:
          return <LoadingSpinner text="Analisando votações e gerando Cards de Segurança..." />;
        
        case GameState.RESULTS_READY:
          return (
            <SecurityCardsDisplay 
              cards={securityCards}
              onSelectCards={handleSelectCardsForBacklog}
              onPlayAgain={handlePlayAgain}
            />
          );
        
        default:
          return <MultiStorySetup onStartAnalysis={handleStartSecurityAnalysis} />;
      }
    }
    
    // v1 Classic poker workflow
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