import React, { useState } from 'react';
import { SecurityCard } from '../types';

interface SecurityCardsDisplayProps {
  cards: SecurityCard[];
  onSelectCards: (selectedCards: SecurityCard[]) => void;
  onPlayAgain: () => void;
}

const AspScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = 'bg-green-500/20 text-green-300 border-green-500/30';
  if (score >= 81) colorClass = 'bg-red-500/20 text-red-300 border-red-500/30';
  else if (score >= 61) colorClass = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  else if (score >= 41) colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';

  return (
    <span className={`px-3 py-1 text-sm font-bold rounded-full border ${colorClass}`}>
      ASP: {score}
    </span>
  );
};

const ConfidenceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);
  let colorClass = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  if (confidence >= 0.8) colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  else if (confidence >= 0.6) colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  else if (confidence >= 0.4) colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

  return (
    <span 
      className={`px-2 py-1 text-xs font-medium rounded border ${colorClass} cursor-help`}
      title={`Confiança da IA: ${percentage}% - Indica o nível de certeza da IA nesta classificação técnica. Valores baixos podem necessitar revisão manual.`}
    >
      📊{percentage}%
    </span>
  );
};

const CVSSSeverityBadge: React.FC<{ severity: string; score: number }> = ({ severity, score }) => {
  const colorMap: { [key: string]: string } = {
    'Low': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${colorMap[severity] || 'bg-gray-500/20 text-gray-300'}`}>
      {severity} ({score.toFixed(1)})
    </span>
  );
};

const SecurityCardsDisplay: React.FC<SecurityCardsDisplayProps> = ({ 
  cards, 
  onSelectCards, 
  onPlayAgain 
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCardIds(newSelected);
  };

  const handleSelectForBacklog = () => {
    const selectedCards = cards.filter(card => selectedCardIds.has(card.card_id));
    onSelectCards(selectedCards);
  };
  
  const handleSelectAll = () => {
    if (selectedCardIds.size === cards.length) {
      // Deselect all
      setSelectedCardIds(new Set());
    } else {
      // Select all
      setSelectedCardIds(new Set(cards.map(card => card.card_id)));
    }
  };

  const copyCardToClipboard = async (card: SecurityCard) => {
    const cardText = `🎴 CARD DE SEGURANÇA - Carcará Threat Poker v2

═══ INFORMAÇÕES BÁSICAS ═══
📌 Card ID: ${card.card_id}
📝 User Story: ${card.user_story}
⚠️ Ameaça: ${card.ameaca_titulo}
📖 Descrição: ${card.descricao_ameaca}

═══ CLASSIFICAÇÕES TÉCNICAS ═══
🏷️ OWASP Top 10: ${card.classificacoes.owasp_top10.categoria} (📊${Math.round(card.classificacoes.owasp_top10.confianca * 100)}% confiança IA)
🐛 CWE: ${card.classificacoes.cwe.id} - ${card.classificacoes.cwe.nome} (📊${Math.round(card.classificacoes.cwe.confianca * 100)}% confiança IA)
📊 CVSS 4.0: ${card.classificacoes.cvss.severidade} (${card.classificacoes.cvss.pontuacao_base.toFixed(1)}) - ${card.classificacoes.cvss.vetor} (📊${Math.round(card.classificacoes.cvss.confianca * 100)}% confiança IA)

═══ PRIORIZAÇÃO ASP ═══
📊 Score ASP: ${card.asp_score || 0}/100
📈 Risco: ${card.insumos_asp.risco.valor}/10
⚡ Esforço: ${card.insumos_asp.esforco.valor}/10
🚦 Decisão Sprint: ${card.decisao_sprint_sugerida}

═══ IMPLEMENTAÇÃO ═══
✅ SUBTAREFAS:
${card.subtarefas_sugeridas.map(task => `  • ${task}`).join('\n')}

🔒 DEFINITION OF DONE - SEGURANÇA:
${card.dod_segurança.map(dod => `  • ${dod}`).join('\n')}

═══ RECURSOS E REFERÊNCIAS ═══
📚 CHEAT SHEETS OWASP:
${card.cheat_sheets.map(sheet => `  • ${sheet.titulo}: ${sheet.url}`).join('\n')}

💡 OBSERVAÇÕES:
${card.observacoes}

═══ METADADOS ═══
🔖 Versão do Esquema: ${card.versao_esquema}
⏰ Gerado via Carcará Threat Poker v2
🤖 Análise baseada em IA (Google Gemini)`;

    try {
      await navigator.clipboard.writeText(cardText);
      // Show success feedback with temporary toast
      const button = document.activeElement as HTMLElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = '✓ Copiado!';
        button.classList.add('bg-emerald-600');
        button.classList.remove('bg-sky-600/20');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-emerald-600');
          button.classList.add('bg-sky-600/20');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: create a textarea and copy manually
      const textArea = document.createElement('textarea');
      textArea.value = cardText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Card ${card.card_id} copiado para a área de transferência!`);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          🎴 Cards de Segurança Gerados
        </h2>
        <p className="text-slate-400 mb-4">
          {cards.length} cards ordenados por prioridade ASP (Risco × Esforço)
        </p>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-slate-400">
            {selectedCardIds.size} de {cards.length} selecionados
          </span>
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors border border-slate-600"
          >
            {selectedCardIds.size === cards.length ? '❌ Desselecionar Todos' : '✅ Selecionar Todos'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => (
          <div 
            key={card.card_id} 
            className={`bg-slate-800/50 rounded-xl border transition-all duration-200 ${
              selectedCardIds.has(card.card_id)
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCardIds.has(card.card_id)}
                      onChange={() => toggleCardSelection(card.card_id)}
                      className="sr-only peer"
                    />
                    <div className={`relative w-6 h-6 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                      selectedCardIds.has(card.card_id) 
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-500 bg-slate-800 hover:border-indigo-400'
                    }`}>
                      {selectedCardIds.has(card.card_id) && (
                        <span className="text-sm font-bold">✓</span>
                      )}
                    </div>
                  </label>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      #{index + 1} {card.ameaca_titulo}
                    </h3>
                    <p className="text-sm text-slate-400">ID: {card.card_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AspScoreBadge score={card.asp_score || 0} />
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    card.decisao_sprint_sugerida === 'Selecionar' 
                      ? 'bg-emerald-600/20 text-emerald-300'
                      : card.decisao_sprint_sugerida === 'Adiar'
                      ? 'bg-orange-600/20 text-orange-300'  
                      : 'bg-blue-600/20 text-blue-300'
                  }`}>
                    {card.decisao_sprint_sugerida}
                  </span>
                </div>
              </div>

              {/* User Story */}
              <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">📌 User Story</h4>
                <p className="text-slate-300 italic">"{card.user_story}"</p>
              </div>

              {/* Threat Description */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">⚠️ Descrição da Ameaça</h4>
                <p className="text-slate-300">{card.descricao_ameaca}</p>
              </div>

              {/* Classifications */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/30 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">🏷️ OWASP Top 10</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium">
                      {card.classificacoes.owasp_top10.categoria}
                    </span>
                    <ConfidenceBadge confidence={card.classificacoes.owasp_top10.confianca} />
                  </div>
                </div>

                <div className="bg-slate-900/30 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">🐛 CWE</h4>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 font-medium">
                      {card.classificacoes.cwe.id}
                    </span>
                    <ConfidenceBadge confidence={card.classificacoes.cwe.confianca} />
                  </div>
                  <p className="text-xs text-slate-400">{card.classificacoes.cwe.nome}</p>
                </div>

                <div className="bg-slate-900/30 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">📊 CVSS 4.0</h4>
                  <div className="flex items-center justify-between mb-1">
                    <CVSSSeverityBadge 
                      severity={card.classificacoes.cvss.severidade} 
                      score={card.classificacoes.cvss.pontuacao_base} 
                    />
                    <ConfidenceBadge confidence={card.classificacoes.cvss.confianca} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono break-all">
                    {card.classificacoes.cvss.vetor}
                  </p>
                </div>
              </div>

              {/* ASP Inputs */}
              <div className="mb-4 bg-slate-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-3">📊 Insumos ASP</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-xl font-bold text-red-400">{card.insumos_asp.risco.valor}</span>
                    <p className="text-xs text-slate-400">Risco (1-10)</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-blue-400">{card.insumos_asp.esforco.valor}</span>
                    <p className="text-xs text-slate-400">Esforço (1-10)</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-indigo-400">{card.asp_score || 0}</span>
                    <p className="text-xs text-slate-400">Score ASP</p>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => setExpandedCardId(expandedCardId === card.card_id ? null : card.card_id)}
                  className="w-full text-left text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
                >
                  <span>
                    {expandedCardId === card.card_id ? '🔽 Ocultar detalhes' : '🔼 Ver subtarefas, DoD e cheat sheets'}
                  </span>
                </button>

                {expandedCardId === card.card_id && (
                  <div className="mt-4 space-y-4 animate-fade-in">
                    {/* Subtasks */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">✅ Subtarefas Sugeridas</h4>
                      <ul className="space-y-1">
                        {card.subtarefas_sugeridas.map((task, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* DoD Security */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">🔒 Definition of Done - Segurança</h4>
                      <ul className="space-y-1">
                        {card.dod_segurança.map((dod, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{dod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cheat Sheets */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">📖 OWASP Cheat Sheets</h4>
                      <div className="space-y-2">
                        {card.cheat_sheets.map((sheet, idx) => (
                          <a
                            key={idx}
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            📄 {sheet.titulo}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Observations */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">💡 Observações</h4>
                      <p className="text-sm text-slate-300 italic">{card.observacoes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => copyCardToClipboard(card)}
                  className="px-3 py-2 bg-sky-600/20 text-sky-300 rounded-lg hover:bg-sky-600/30 transition-colors text-sm"
                >
                  📋 Copiar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSelectForBacklog}
          disabled={selectedCardIds.size === 0}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          🚀 Enviar para Backlog ({selectedCardIds.size} cards)
        </button>
        
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all"
        >
          🔄 Nova Análise
        </button>
      </div>

      <div className="mt-6 text-center space-y-3">
        <div className="text-sm text-slate-500">
          <p>
            💡 CVSS/CWE/OWASP Top 10 são informativos. O ASP é calculado apenas com os insumos definidos pelo Carcará.
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-4 max-w-4xl mx-auto">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">🎯 Sobre os Níveis de Confiança</h4>
          <p className="text-xs text-slate-400 text-left">
            Os percentuais ao lado das classificações técnicas indicam o <strong>nível de confiança da IA</strong> (0-100%):
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">80%+</span>
              <span className="text-slate-400">Alta confiança</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">60-79%</span>
              <span className="text-slate-400">Média confiança</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">40-59%</span>
              <span className="text-slate-400">Baixa confiança</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded">&lt;40%</span>
              <span className="text-slate-400">Muito baixa</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">
            Níveis baixos de confiança podem indicar necessidade de revisão manual por especialista.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityCardsDisplay;