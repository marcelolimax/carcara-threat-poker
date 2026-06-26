import React, { useEffect } from 'react';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

type IconProps = { className?: string };

const ShieldIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CloseIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const BirdIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 7h.01" /><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L3.4 18Z" /><path d="m20 7 2 .5-2 .5" /><path d="M10 18v3" /><path d="M14 17.75V21" /><path d="M7 18a6 6 0 0 1 3.84-5.6" />
  </svg>
);

const STEPS = [
  { n: '1', title: 'Identificar ameaças', desc: 'A partir de cada história de usuário, a IA propõe ameaças plausíveis (sem sugerir mitigação ainda).' },
  { n: '2', title: 'Classificar', desc: 'Cada ameaça é classificada por STRIDE e referenciada em OWASP Top 10, CWE, Cheat Sheets e CVSS (informativos).' },
  { n: '3', title: 'Priorizar (ASP)', desc: 'Risco × Esforço gera um score que ordena as ações no backlog. A decisão final é sempre da equipe.' },
];

const GLOSSARY = [
  { term: 'CATM', full: 'Carcará Agile Threat Modeling', desc: 'Adaptação leve do Scrum que integra modelagem de ameaças ao planejamento, sem criar novos papéis ou cerimônias.' },
  { term: 'ASP', full: 'Atividade de Segurança Proativa', desc: 'Unidade mínima de trabalho de segurança no backlog, priorizada por Risco × Esforço.' },
  { term: 'CTP', full: 'Carcará Threat Poker', desc: 'Instrumento colaborativo, apoiado por IA consultiva, para identificar e priorizar ameaças por história de usuário.' },
  { term: 'STRIDE', full: 'Técnica de modelagem de ameaças', desc: 'Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service e Elevation of Privilege.' },
];

const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sobre o Carcará"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-slate-900/95 backdrop-blur border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <ShieldIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-100">
              Sobre o <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Carcará</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* O que é */}
          <section>
            <p className="text-slate-300 leading-relaxed">
              O <strong className="text-slate-100">Carcará Threat Poker</strong> operacionaliza o método{' '}
              <strong className="text-slate-100">CATM (Carcará Agile Threat Modeling)</strong>: uma forma leve de
              integrar a <span className="text-indigo-300">modelagem de ameaças</span> ao planejamento ágil,
              preservando o Scrum e sem criar novos papéis ou cerimônias. A IA atua como{' '}
              <span className="text-indigo-300">especialista consultiva</span> — propõe e classifica riscos, mas a
              decisão final é sempre da equipe.
            </p>
            <div className="mt-3 flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <span className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                <BirdIcon className="w-5 h-5" />
              </span>
              <p className="text-sm text-slate-400">
                O nome faz referência ao <strong className="text-slate-300">carcará</strong>, ave do Nordeste brasileiro
                conhecida pela observação estratégica — uma metáfora para a postura vigilante e antecipatória sobre
                riscos, tratados antes de virarem vulnerabilidades.
              </p>
            </div>
          </section>

          {/* Como funciona */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Como funciona</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm font-bold flex items-center justify-center mb-2">
                    {s.n}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Glossário */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Glossário rápido</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-indigo-300 font-bold">{g.term}</span>
                    <span className="text-xs text-slate-500">{g.full}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Nota */}
          <section className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
            <p className="text-sm text-slate-300">
              💡 As classificações <strong className="text-slate-100">CVSS / CWE / OWASP Top 10</strong> são
              informativas. O <strong className="text-slate-100">ASP</strong> (Risco × Esforço) é o que ordena a
              priorização — e o aceite permanece com a equipe. Baseado na dissertação
              <em> "Carcará: uma abordagem leve para modelagem de ameaças em contextos ágeis"</em>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
