import React, { useState } from 'react';
import { UserStoryInput } from '../types';

interface MultiStorySetupProps {
  onStartAnalysis: (stories: UserStoryInput[], contexto?: string, includeVoting?: boolean) => void;
}

const MultiStorySetup: React.FC<MultiStorySetupProps> = ({ onStartAnalysis }) => {
  const [stories, setStories] = useState<UserStoryInput[]>([
    { id: '1', content: '', selected: false }
  ]);
  const [contextoOpcional, setContextoOpcional] = useState('');
  const [includeVoting, setIncludeVoting] = useState(false);

  const addStory = () => {
    const newStory: UserStoryInput = {
      id: Date.now().toString(),
      content: '',
      selected: false
    };
    setStories([...stories, newStory]);
  };

  const removeStory = (id: string) => {
    if (stories.length > 1) {
      setStories(stories.filter(story => story.id !== id));
    }
  };

  const updateStoryContent = (id: string, content: string) => {
    setStories(stories.map(story => 
      story.id === id ? { ...story, content } : story
    ));
  };

  const toggleStorySelection = (id: string) => {
    setStories(stories.map(story => 
      story.id === id ? { ...story, selected: !story.selected } : story
    ));
  };

  const handleStartAnalysis = () => {
    const validStories = stories.filter(story => story.content.trim() !== '');
    const selectedValidStories = validStories.filter(story => story.selected);
    
    if (selectedValidStories.length === 0) {
      alert('Selecione pelo menos uma história válida para análise.');
      return;
    }

    onStartAnalysis(validStories, contextoOpcional.trim() || undefined, includeVoting);
  };

  const selectedCount = stories.filter(story => story.selected && story.content.trim()).length;
  const validStoriesCount = stories.filter(story => story.content.trim()).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          🎯 Carcará Threat Poker v2
        </h2>
        <p className="text-slate-400 text-lg">
          Selecione 1-N histórias para análise simultânea com Cards de Segurança
        </p>
      </div>

      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center">
          📝 User Stories para Análise
          <span className="ml-2 text-sm bg-indigo-600 px-2 py-1 rounded-full">
            {selectedCount}/{validStoriesCount} selecionadas
          </span>
        </h3>
        
        <div className="space-y-4">
          {stories.map((story, index) => (
            <div key={story.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    checked={story.selected}
                    onChange={() => toggleStorySelection(story.id)}
                    disabled={!story.content.trim()}
                    className="w-5 h-5 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      História #{index + 1}
                    </label>
                    {stories.length > 1 && (
                      <button
                        onClick={() => removeStory(story.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                        title="Remover história"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>
                  
                  <textarea
                    value={story.content}
                    onChange={(e) => updateStoryContent(story.id, e.target.value)}
                    placeholder="Ex: Como um usuário, quero poder redefinir minha senha através de um link enviado para meu e-mail..."
                    className="w-full h-24 p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addStory}
          className="mt-4 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
        >
          ➕ Adicionar História
        </button>
      </div>

      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">
          🎯 Contexto Adicional (Opcional)
        </h3>
        <textarea
          value={contextoOpcional}
          onChange={(e) => setContextoOpcional(e.target.value)}
          placeholder="Contexto técnico, arquitetura, tecnologias utilizadas, restrições específicas..."
          className="w-full h-20 p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          🗳️ Modo de Análise
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="include-voting"
              checked={includeVoting}
              onChange={(e) => setIncludeVoting(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2 mt-1"
            />
            <div>
              <label htmlFor="include-voting" className="text-slate-200 font-medium cursor-pointer">
                Incluir votação colaborativa (sala multiplayer)
              </label>
              <p className="text-sm text-slate-400 mt-1">
                {includeVoting 
                  ? "🏃 Modo Colaborativo: abre uma sala onde cada participante entra pelo próprio dispositivo e vota por história, antes da IA gerar os cards"
                  : "⚡ Modo Rápido: A IA gerará diretamente os cards de segurança (recomendado para plannings)"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleStartAnalysis}
          disabled={selectedCount === 0}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100 disabled:from-slate-600 disabled:to-slate-600"
        >
          🚀 Gerar Cards de Segurança ({selectedCount} {selectedCount === 1 ? 'história' : 'histórias'})
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        <p>
          🔍 A IA gerará opções de ameaças e Cards de Segurança completos com OWASP Top 10, CWE, CVSS 4.0, Cheat Sheets e priorização ASP
        </p>
      </div>
    </div>
  );
};

export default MultiStorySetup;