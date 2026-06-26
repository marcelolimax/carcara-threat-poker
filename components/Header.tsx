import React, { useState } from 'react';
import AboutModal from './AboutModal';

const InfoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const Header: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
        Carcará Threat Poker
      </h1>
      <p className="mt-2 text-lg text-slate-400">
        Análise de ameaças de forma simplificada.
      </p>
      <button
        onClick={() => setShowAbout(true)}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors"
      >
        <InfoIcon className="w-4 h-4" />
        Sobre o Carcará
      </button>

      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
    </header>
  );
};

export default Header;
