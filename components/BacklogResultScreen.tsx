import React, { useState } from 'react';
import { SecurityCard } from '../types';

interface BacklogResultScreenProps {
  selectedCards: SecurityCard[];
  onBack: () => void;
  onNewAnalysis: () => void;
}

const BacklogResultScreen: React.FC<BacklogResultScreenProps> = ({
  selectedCards,
  onBack,
  onNewAnalysis
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const generateBacklogText = () => {
    const header = `# 🛡️ Cards de Segurança - Carcará Threat Poker v2
Generated: ${new Date().toLocaleString('pt-BR')}
Total Cards: ${selectedCards.length}
ASP Range: ${Math.min(...selectedCards.map(c => c.asp_score || 0))} - ${Math.max(...selectedCards.map(c => c.asp_score || 0))}

---
`;

    const cardsText = selectedCards
      .sort((a, b) => (b.asp_score || 0) - (a.asp_score || 0))
      .map((card, index) => `
## ${index + 1}. ${card.ameaca_titulo}
**ID:** ${card.card_id}  
**ASP Score:** ${card.asp_score} (Risco: ${card.insumos_asp.risco.valor} × Esforço: ${card.insumos_asp.esforco.valor})  
**Prioridade Sprint:** ${card.decisao_sprint_sugerida}

### 📌 User Story
${card.user_story}

### ⚠️ Descrição da Ameaça
${card.descricao_ameaca}

### 🏷️ Classificações Técnicas
- **OWASP Top 10:** ${card.classificacoes.owasp_top10.categoria} (${Math.round(card.classificacoes.owasp_top10.confianca * 100)}% confiança)
- **CWE:** ${card.classificacoes.cwe.id} - ${card.classificacoes.cwe.nome} (${Math.round(card.classificacoes.cwe.confianca * 100)}% confiança)  
- **CVSS 4.0:** ${card.classificacoes.cvss.severidade} (${card.classificacoes.cvss.pontuacao_base}) (${Math.round(card.classificacoes.cvss.confianca * 100)}% confiança)
- **Vetor CVSS:** ${card.classificacoes.cvss.vetor}

### ✅ Subtarefas para Implementação
${card.subtarefas_sugeridas.map(task => `- [ ] ${task}`).join('\n')}

### 🔒 Definition of Done - Segurança
${card.dod_seguranca.map(dod => `- [ ] ${dod}`).join('\n')}

### 📚 Recursos de Referência
${card.cheat_sheets.map(sheet => `- [${sheet.titulo}](${sheet.url})`).join('\n')}

### 💡 Observações
${card.observacoes}

---
`).join('\n');

    return header + cardsText;
  };

  const handleCopyToBacklog = async () => {
    const backlogText = generateBacklogText();
    
    try {
      await navigator.clipboard.writeText(backlogText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = backlogText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Cards copiados para a área de transferência!');
    }
  };

  const totalASP = selectedCards.reduce((sum, card) => sum + (card.asp_score || 0), 0);
  const avgASP = Math.round(totalASP / selectedCards.length);
  const highPriorityCount = selectedCards.filter(card => card.decisao_sprint_sugerida === 'Selecionar').length;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          📋 Cards Selecionados para Backlog
        </h2>
        <div className="flex justify-center gap-6 text-sm text-slate-400">
          <span>📊 {selectedCards.length} cards</span>
          <span>🎯 ASP médio: {avgASP}</span>
          <span>⚡ Alta prioridade: {highPriorityCount}</span>
        </div>
      </div>

      {/* Preview dos Cards */}
      <div className="bg-slate-800/30 rounded-xl p-6 mb-8 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          👀 Preview do Conteúdo
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
            Formato Markdown
          </span>
        </h3>
        <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
          <pre className="text-slate-300 whitespace-pre-wrap">
            {generateBacklogText().substring(0, 1000)}
            {generateBacklogText().length > 1000 && '\n...\n[conteúdo truncado para preview]'}
          </pre>
        </div>
      </div>

      {/* Resumo por Prioridade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {['Selecionar', 'Avaliar', 'Adiar'].map(priority => {
          const cards = selectedCards.filter(card => card.decisao_sprint_sugerida === priority);
          const color = priority === 'Selecionar' ? 'emerald' : priority === 'Avaliar' ? 'blue' : 'orange';
          
          return (
            <div key={priority} className={`bg-${color}-900/20 border border-${color}-700/30 rounded-lg p-4`}>
              <div className={`text-${color}-300 font-semibold text-lg`}>
                {priority}
              </div>
              <div className={`text-${color}-400 text-sm`}>
                {cards.length} cards
              </div>
              <div className={`text-${color}-500 text-xs`}>
                ASP médio: {cards.length > 0 ? Math.round(cards.reduce((sum, c) => sum + (c.asp_score || 0), 0) / cards.length) : 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista Resumida */}
      <div className="bg-slate-800/30 rounded-xl p-6 mb-8 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">📝 Resumo dos Cards</h3>
        <div className="space-y-3">
          {selectedCards
            .sort((a, b) => (b.asp_score || 0) - (a.asp_score || 0))
            .map((card, index) => (
              <div key={card.card_id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">#{index + 1}</span>
                    <span className="font-medium text-slate-200">{card.ameaca_titulo}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      card.decisao_sprint_sugerida === 'Selecionar' 
                        ? 'bg-emerald-600/20 text-emerald-300'
                        : card.decisao_sprint_sugerida === 'Avaliar'
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'bg-orange-600/20 text-orange-300'
                    }`}>
                      {card.decisao_sprint_sugerida}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {card.user_story.substring(0, 80)}...
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-400">ASP: {card.asp_score}</div>
                  <div className="text-xs text-slate-500">
                    R:{card.insumos_asp.risco.valor} × E:{card.insumos_asp.esforco.valor}
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleCopyToBacklog}
          className={`px-8 py-4 font-bold rounded-xl transition-all ${
            copySuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {copySuccess ? '✅ Copiado!' : '📋 Copiar para Backlog'}
        </button>
        
        <button
          onClick={onBack}
          className="px-6 py-4 bg-slate-700 text-slate-200 font-bold rounded-xl hover:bg-slate-600 transition-all"
        >
          ← Voltar aos Cards
        </button>
        
        <button
          onClick={onNewAnalysis}
          className="px-6 py-4 bg-slate-600 text-slate-200 font-bold rounded-xl hover:bg-slate-500 transition-all"
        >
          🔄 Nova Análise
        </button>
      </div>

      <div className="mt-8 text-center">
        <div className="bg-slate-800/30 rounded-lg p-4 max-w-3xl mx-auto">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">💡 Como usar</h4>
          <p className="text-xs text-slate-400">
            O conteúdo copiado está formatado em Markdown e pode ser colado diretamente em:
            <strong> Jira, Confluence, GitHub Issues, Notion, Trello (descrições), Azure DevOps</strong> e outras ferramentas que suportam Markdown.
            As subtarefas e DoD já vêm como checklists prontas para usar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BacklogResultScreen;