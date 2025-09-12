import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
        Threat Poker AI
      </h1>
      <p className="mt-2 text-lg text-slate-400">
        Análise de risco ágil baseada no framework OWASP SAMM.
      </p>
    </header>
  );
};

export default Header;