import React, { useState } from 'react';
import { SecurityCard } from '../types';

interface SecurityCardsDisplayProps {
  cards: SecurityCard[];
  onSelectCards: (selectedCards: SecurityCard[]) => void;
  onPlayAgain: () => void;
}

type ViewMode = 'list' | 'grid' | 'carousel';

/* ───────────────────────── Ícones (SVG inline, sem dependências) ───────────────────────── */
type IconProps = { className?: string };

const ChartIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
  </svg>
);
const UsersIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const WarningIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ShieldIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const FolderIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" />
  </svg>
);
const LinkIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const BarsIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const CheckCircleIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
  </svg>
);
const ClipboardIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const ChevronRightIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ListIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const GridIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const SlidersIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="9" cy="6" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="8" cy="18" r="2" fill="currentColor" />
  </svg>
);
const StackIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const TargetIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
  </svg>
);
const BulbIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
  </svg>
);
const InfoIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const SearchIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const HelpIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Anel decorativo colorido com um ícone ao centro (usado na legenda de confiança).
const LevelRing: React.FC<{ stroke: string; pct: number; children: React.ReactNode }> = ({ stroke, pct, children }) => {
  const radius = 14;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  return (
    <div className="relative w-10 h-10 shrink-0">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#334155" strokeWidth="3" />
        <circle cx="18" cy="18" r={radius} fill="none" stroke={stroke} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center" style={{ color: stroke }}>{children}</span>
    </div>
  );
};

// Níveis de confiança exibidos na legenda inferior.
const CONFIDENCE_LEVELS = [
  { label: '80%+', desc: 'Alta confiança', text: 'text-emerald-300', stroke: '#10b981', tint: 'border-emerald-500/30 bg-emerald-500/10', pct: 0.9, icon: <ShieldIcon className="w-4 h-4" /> },
  { label: '60-79%', desc: 'Média confiança', text: 'text-blue-300', stroke: '#3b82f6', tint: 'border-blue-500/30 bg-blue-500/10', pct: 0.7, icon: <BarsIcon className="w-4 h-4" /> },
  { label: '40-59%', desc: 'Baixa confiança', text: 'text-amber-300', stroke: '#f59e0b', tint: 'border-amber-500/30 bg-amber-500/10', pct: 0.5, icon: <SearchIcon className="w-4 h-4" /> },
  { label: '<40%', desc: 'Muito baixa', text: 'text-slate-300', stroke: '#94a3b8', tint: 'border-slate-500/30 bg-slate-500/10', pct: 0.25, icon: <WarningIcon className="w-4 h-4" /> },
  { label: 'N/A', desc: 'Não aplicável', text: 'text-purple-300', stroke: '#a855f7', tint: 'border-purple-500/30 bg-purple-500/10', pct: 0.6, icon: <HelpIcon className="w-4 h-4" /> },
];

// Mapeia o score ASP (0-100) para um nível de prioridade com estilos associados.
const getAspPriority = (score: number) => {
  if (score >= 81) return { label: 'Crítica', text: 'text-red-300', bar: 'bg-red-500', ring: 'border-red-500/40 bg-red-500/10', stroke: '#f87171' };
  if (score >= 61) return { label: 'Alta', text: 'text-orange-300', bar: 'bg-orange-500', ring: 'border-orange-500/40 bg-orange-500/10', stroke: '#fb923c' };
  if (score >= 41) return { label: 'Média', text: 'text-yellow-300', bar: 'bg-yellow-500', ring: 'border-yellow-500/40 bg-yellow-500/10', stroke: '#facc15' };
  return { label: 'Baixa', text: 'text-green-300', bar: 'bg-green-500', ring: 'border-green-500/40 bg-green-500/10', stroke: '#4ade80' };
};

const AspScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const prio = getAspPriority(score);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border shrink-0 whitespace-nowrap ${prio.ring} ${prio.text}`}>
      <ChartIcon className="w-4 h-4" />
      ASP: {score}
    </span>
  );
};

// Anel circular de confiança da IA (0-100%), com tooltip próprio no hover.
const ConfidenceRing: React.FC<{ confidence: number }> = ({ confidence }) => {
  const pct = Math.round(confidence * 100);
  const radius = 16;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - Math.max(0, Math.min(1, confidence)));

  let stroke = '#10b981'; // alta (>=80)
  if (confidence < 0.4) stroke = '#94a3b8';
  else if (confidence < 0.6) stroke = '#f59e0b';
  else if (confidence < 0.8) stroke = '#3b82f6';

  return (
    <div className="relative shrink-0 group">
      <div className="relative w-12 h-12 cursor-help">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={radius} fill="none" stroke="#334155" strokeWidth="4" />
          <circle
            cx="20" cy="20" r={radius} fill="none" stroke={stroke} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-200">
          {pct}%
        </span>
      </div>
      <div
        role="tooltip"
        className="pointer-events-none absolute z-30 right-0 top-full mt-2 w-56 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        <span className="font-semibold text-slate-100">Confiança da IA: {pct}%</span> — nível de certeza da IA nesta classificação. Valores baixos podem necessitar revisão manual.
      </div>
    </div>
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
  const [detailsCardId, setDetailsCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeIndex = cards.length > 0 ? Math.min(currentIndex, cards.length - 1) : 0;

  const goPrev = () => setCurrentIndex(i => (i - 1 + cards.length) % cards.length);
  const goNext = () => setCurrentIndex(i => (i + 1) % cards.length);

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
      setSelectedCardIds(new Set());
    } else {
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
🎯 STRIDE: ${card.classificacoes.stride?.join(', ') || 'N/A'}
🏷️ OWASP Top 10: ${card.classificacoes.owasp_top10.categoria} (📊${Math.round(card.classificacoes.owasp_top10.confianca * 100)}% confiança IA)
🐛 CWE: ${card.classificacoes.cwe.id} - ${card.classificacoes.cwe.nome} (📊${Math.round(card.classificacoes.cwe.confianca * 100)}% confiança IA)
📊 CVSS 4.0: ${card.classificacoes.cvss.severidade} (${card.classificacoes.cvss.pontuacao_base.toFixed(1)}) - ${card.classificacoes.cvss.vetor} (📊${Math.round(card.classificacoes.cvss.confianca * 100)}% confiança IA)

═══ PRIORIZAÇÃO ASP ═══
📊 Score ASP: ${card.asp_score || 0}/100
📈 Risco: ${card.insumos_asp.risco.nivel} (R=${card.insumos_asp.risco.valor})
⚡ Esforço: ${card.insumos_asp.esforco.nivel} (EM=${card.insumos_asp.esforco.valor}, menor = melhor)
🚦 Decisão Sprint: ${card.decisao_sprint_sugerida}

═══ IMPLEMENTAÇÃO ═══
✅ SUBTAREFAS:
${card.subtarefas_sugeridas?.map(task => `  • ${task}`)?.join('\n') || 'Nenhuma subtarefa disponível'}

🔒 DEFINITION OF DONE - SEGURANÇA:
${card.dod_seguranca?.map(dod => `  • ${dod}`)?.join('\n') || 'Nenhum DoD disponível'}

═══ RECURSOS E REFERÊNCIAS ═══
📚 CHEAT SHEETS OWASP:
${card.cheat_sheets?.map(sheet => `  • ${sheet.titulo}: ${sheet.url}`)?.join('\n') || 'Nenhum cheat sheet disponível'}

💡 OBSERVAÇÕES:
${card.observacoes || 'Nenhuma observação'}

═══ METADADOS ═══
🔖 Versão do Esquema: ${card.versao_esquema || 'N/A'}
⏰ Gerado via Carcará Threat Poker v2
🤖 Análise baseada em IA (Google Gemini)`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cardText);
        alert(`✅ Card ${card.card_id} copiado com sucesso!`);
        return;
      }
    } catch (err) {
      console.error('Erro ao copiar com navigator.clipboard:', err);
    }

    // Fallback para método antigo
    try {
      const textArea = document.createElement('textarea');
      textArea.value = cardText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        alert(`✅ Card ${card.card_id} copiado com sucesso! (método alternativo)`);
      } else {
        throw new Error('execCommand falhou');
      }
    } catch (fallbackErr) {
      console.error('Erro no fallback:', fallbackErr);
      alert(`❌ Erro ao copiar card. Tente novamente ou copie manualmente.\n\nCard ID: ${card.card_id}`);
    }
  };

  // Renderiza um card. No modo lista, exibe recolhido (só cabeçalho + ASP) e
  // expande o detalhe ao clicar. No modo acordeão, sempre mostra o card completo.
  const renderCard = (card: SecurityCard, index: number) => {
    const score = card.asp_score || 0;
    const prio = getAspPriority(score);
    const riscoNivel = card.insumos_asp.risco.nivel;
    const esforcoNivel = card.insumos_asp.esforco.nivel;
    const risco = card.insumos_asp.risco.valor;
    const esforco = card.insumos_asp.esforco.valor;
    const expanded = viewMode === 'carousel' || expandedCardId === card.card_id;
    const showDetails = detailsCardId === card.card_id;
    const collapsible = viewMode !== 'carousel';

    const checkbox = (
      <label
        className="relative flex items-center cursor-pointer mt-1"
        onClick={(e) => e.stopPropagation()}
      >
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
    );

    const headerContent = (
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {checkbox}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-100 leading-snug">
              #{index + 1} {card.ameaca_titulo}
            </h3>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs font-mono">
              ID: {card.card_id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AspScoreBadge score={score} />
          {collapsible && (
            <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          )}
        </div>
      </div>
    );

    // Modo lista recolhido: só o cabeçalho, clicável para expandir o detalhe.
    if (!expanded) {
      return (
        <div
          key={`${card.card_id}-${index}`}
          onClick={() => setExpandedCardId(card.card_id)}
          className={`bg-slate-800/50 rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
            selectedCardIds.has(card.card_id)
              ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          {headerContent}
        </div>
      );
    }

    return (
      <div 
        key={`${card.card_id}-${index}`} 
        className={`bg-slate-800/50 rounded-xl border transition-all duration-200 ${
          viewMode === 'grid' ? 'md:col-span-2' : ''
        } ${
          selectedCardIds.has(card.card_id)
            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
            : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <div className="p-6">
          {/* Header (clicável para recolher no modo lista) */}
          <div
            className={`mb-5 ${collapsible ? 'cursor-pointer' : ''}`}
            onClick={collapsible ? () => setExpandedCardId(null) : undefined}
          >
            {headerContent}
          </div>

          {/* User Story + Descrição da Ameaça (lado a lado) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-300">
                <UsersIcon className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-slate-300">User Story</h4>
              </div>
              <p className="text-slate-300 italic text-sm">"{card.user_story}"</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-300">
                <WarningIcon className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-slate-300">Descrição da Ameaça</h4>
              </div>
              <p className="text-slate-300 text-sm">{card.descricao_ameaca}</p>
            </div>
          </div>

          {/* ASP - destaque principal de priorização */}
          <div className={`relative overflow-hidden mb-4 rounded-xl border p-4 ${prio.ring}`}>
            {/* Brilho lateral sutil na cor da prioridade */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `linear-gradient(90deg, ${prio.stroke}1f, transparent 55%)` }}
            />
            {/* Escudo translúcido ao fundo */}
            <ShieldIcon className="pointer-events-none absolute top-1/2 left-[30%] -translate-y-1/2 w-40 h-40 text-slate-100/5" />

            <div className="relative flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <ChartIcon className="w-4 h-4" />
                </span>
                Priorização ASP (Risco × Esforço)
              </h4>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${prio.ring} ${prio.text}`}>
                Prioridade {prio.label}
              </span>
            </div>

            <div className="relative flex items-center gap-6">
              <div className="text-center shrink-0">
                <div className={`text-6xl font-extrabold leading-none ${prio.text}`}>{score}</div>
                <div className="text-xs text-slate-400 mt-1">Score ASP / 100</div>
              </div>
              <div className="flex-1">
                {/* Escala em gradiente com marcador na posição do score */}
                <div
                  className="relative h-2.5 rounded-full mb-4"
                  style={{ background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f59e0b, #ef4444)' }}
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={score}
                  aria-label="Escala de prioridade ASP"
                >
                  <div
                    className="absolute top-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-800 shadow-md -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
                    style={{ left: `${Math.max(0, Math.min(100, score))}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/40 rounded-lg py-2">
                    <div className="text-base font-bold text-red-400 capitalize">{riscoNivel}</div>
                    <div className="text-[11px] text-slate-400">Risco · R={risco}</div>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg py-2">
                    <div className="text-base font-bold text-blue-400 capitalize">{esforcoNivel}</div>
                    <div className="text-[11px] text-slate-400">Esforço · EM={esforco} <span className="text-slate-500">(menor = melhor)</span></div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Cálculo do ASP: R × EM = {risco} × {esforco} = {score}</p>
              </div>
            </div>
          </div>

          {/* STRIDE */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-700/60 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <ShieldIcon className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-semibold text-slate-200">STRIDE (Modelagem de Ameaças)</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.classificacoes.stride && card.classificacoes.stride.length > 0 ? (
                card.classificacoes.stride.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 text-xs font-medium rounded-lg border bg-indigo-500/15 text-indigo-200 border-indigo-500/30">
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 italic">N/A</span>
              )}
            </div>
          </div>

          {/* Classificações técnicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-slate-900/40 rounded-xl border border-slate-700/60 p-4">
              <div className="flex items-center gap-2 mb-3 text-amber-300">
                <FolderIcon className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-slate-200">OWASP Top 10</h4>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300 font-medium">
                  {card.classificacoes.owasp_top10.categoria}
                </span>
                <ConfidenceRing confidence={card.classificacoes.owasp_top10.confianca} />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl border border-slate-700/60 p-4">
              <div className="flex items-center gap-2 mb-3 text-sky-300">
                <LinkIcon className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-slate-200">CWE</h4>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-300 font-medium">{card.classificacoes.cwe.id}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{card.classificacoes.cwe.nome}</p>
                </div>
                <ConfidenceRing confidence={card.classificacoes.cwe.confianca} />
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl border border-slate-700/60 p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-300">
                <BarsIcon className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-slate-200">CVSS 4.0</h4>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <CVSSSeverityBadge 
                    severity={card.classificacoes.cvss.severidade} 
                    score={card.classificacoes.cvss.pontuacao_base} 
                  />
                  <p className="text-[11px] text-slate-400 font-mono break-all mt-1">
                    {card.classificacoes.cvss.vetor}
                  </p>
                </div>
                <ConfidenceRing confidence={card.classificacoes.cvss.confianca} />
              </div>
            </div>
          </div>

          {/* Footer: toggle de detalhes + copiar */}
          <div className="border-t border-slate-700 mt-4 pt-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setDetailsCardId(showDetails ? null : card.card_id)}
              className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
              aria-expanded={showDetails}
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Ver subtarefas, DoD e cheat sheets</span>
              <ChevronRightIcon className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
            <button
              onClick={() => copyCardToClipboard(card)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50 transition-colors text-sm"
            >
              <ClipboardIcon className="w-4 h-4" />
              Copiar card
            </button>
          </div>

          {/* Conteúdo expansível */}
          {showDetails && (
            <div className="mt-4 space-y-4 animate-fade-in bg-slate-900/50 rounded-lg p-4">
              {/* Subtarefas */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">✅ Subtarefas Sugeridas</h4>
                {card.subtarefas_sugeridas && card.subtarefas_sugeridas.length > 0 ? (
                  <ul className="space-y-1">
                    {card.subtarefas_sugeridas.map((task, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhuma subtarefa disponível</p>
                )}
              </div>

              {/* DoD de Segurança */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">🔒 Definition of Done - Segurança</h4>
                {card.dod_seguranca && card.dod_seguranca.length > 0 ? (
                  <ul className="space-y-1">
                    {card.dod_seguranca.map((dod, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{dod}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhum Definition of Done disponível</p>
                )}
              </div>

              {/* Cheat Sheets */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">📖 OWASP Cheat Sheets</h4>
                {card.cheat_sheets && card.cheat_sheets.length > 0 ? (
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
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhum cheat sheet disponível</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">💡 Observações</h4>
                <p className="text-sm text-slate-300 italic">
                  {card.observacoes || 'Nenhuma observação disponível'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <ShieldIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 leading-tight">
                Cards de{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Segurança</span>
                {' '}Gerados
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {cards.length} cards ordenados por prioridade ASP (Risco × Esforço)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700">
            <StackIcon className="w-5 h-5 text-indigo-300" />
            <div className="text-right leading-tight">
              <div className="text-sm font-bold text-slate-100">{selectedCardIds.size} de {cards.length}</div>
              <div className="text-[11px] text-slate-400">selecionados</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex items-center gap-3 flex-wrap bg-slate-900/40 border border-slate-700 rounded-xl p-2">
          <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300">
            <TargetIcon className="w-4 h-4 text-indigo-300" />
            {selectedCardIds.size} de {cards.length} selecionados
          </span>
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {selectedCardIds.size === cards.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
          </button>

          {/* Alternador de visualização */}
          <div className="ml-auto inline-flex rounded-lg border border-slate-600 overflow-hidden bg-slate-800/60">
            {([
              { mode: 'list' as ViewMode, label: 'Lista', icon: <ListIcon className="w-4 h-4" />, title: 'Lista (recolhível)' },
              { mode: 'grid' as ViewMode, label: 'Grade', icon: <GridIcon className="w-4 h-4" />, title: 'Grade (2 colunas)' },
              { mode: 'carousel' as ViewMode, label: 'Acordeão', icon: <SlidersIcon className="w-4 h-4" />, title: 'Um card por vez' },
            ]).map((opt, i) => (
              <button
                key={opt.mode}
                onClick={() => setViewMode(opt.mode)}
                title={opt.title}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${i > 0 ? 'border-l border-slate-600' : ''} ${
                  viewMode === opt.mode
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="space-y-6">
          {cards.map((card, index) => renderCard(card, index))}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {cards.map((card, index) => renderCard(card, index))}
        </div>
      )}

      {viewMode === 'carousel' && (
        <div>
          {/* Navegação do acordeão/carrossel */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goPrev}
              disabled={cards.length <= 1}
              className="px-4 py-2 bg-slate-700/50 text-slate-200 rounded-lg hover:bg-slate-600/50 transition-colors border border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Card anterior"
            >
              ◀ Anterior
            </button>
            <span className="text-sm font-medium text-slate-300">
              Card {safeIndex + 1} de {cards.length}
            </span>
            <button
              onClick={goNext}
              disabled={cards.length <= 1}
              className="px-4 py-2 bg-slate-700/50 text-slate-200 rounded-lg hover:bg-slate-600/50 transition-colors border border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Próximo card"
            >
              Próximo ▶
            </button>
          </div>

          {cards.length > 0 && renderCard(cards[safeIndex], safeIndex)}

          {/* Indicadores (dots) */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {cards.map((card, idx) => (
              <button
                key={`${card.card_id}-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === safeIndex ? 'w-6 bg-indigo-500' : 'w-2.5 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Ir para o card ${idx + 1}`}
                title={`Card ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

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

      <div className="mt-6 space-y-4">
        {/* Banner: classificações informativas */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
            <BulbIcon className="w-4 h-4" />
          </span>
          <p className="text-sm text-slate-300">
            CVSS / CWE / OWASP Top 10 são <span className="text-indigo-300 font-medium">informativos</span>. O ASP é calculado apenas com os <span className="text-indigo-300 font-medium">insumos definidos</span> pelo Carcará.
          </p>
        </div>

        {/* Painel: níveis de confiança */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <ShieldIcon className="w-4 h-4" />
            </span>
            <h4 className="text-lg font-bold text-slate-100">Sobre os Níveis de Confiança</h4>
          </div>
          <p className="text-sm text-slate-400 text-center mb-5">
            Os percentuais ao lado das classificações técnicas indicam o nível de confiança da IA (0-100%).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CONFIDENCE_LEVELS.map((lvl) => (
              <div key={lvl.label} className={`rounded-xl border p-4 ${lvl.tint}`}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <LevelRing stroke={lvl.stroke} pct={lvl.pct}>{lvl.icon}</LevelRing>
                  <span className={`text-lg font-bold ${lvl.text}`}>{lvl.label}</span>
                </div>
                <p className="text-xs text-slate-400 text-center">{lvl.desc}</p>
              </div>
            ))}
          </div>

          {/* Banner inferior: revisão manual */}
          <div className="mt-5 bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <InfoIcon className="w-4 h-4" />
            </span>
            <p className="text-sm text-slate-300">
              Níveis baixos de confiança podem indicar necessidade de <span className="text-indigo-300 font-medium">revisão manual</span> por especialista.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCardsDisplay;
