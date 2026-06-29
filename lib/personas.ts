// Personas cyberpunk para entrada anônima nas salas (sem login).
export interface Persona {
  name: string;
  icon: string;
}

export const PERSONAS: Persona[] = [
  { name: 'Ghost//Runner', icon: '🕶️' },
  { name: 'NeonByte', icon: '🦾' },
  { name: 'Zer0Cool', icon: '💾' },
  { name: 'Glitch', icon: '👾' },
  { name: 'Vyper', icon: '🐍' },
  { name: 'Rootkit', icon: '🔓' },
  { name: 'Daemon', icon: '😈' },
  { name: 'Synth', icon: '🎛️' },
  { name: 'Chrome', icon: '🤖' },
  { name: 'Carcará', icon: '🦅' },
  { name: 'Pulse', icon: '📡' },
  { name: 'Nyx', icon: '🌃' },
];

export const randomPersona = (): Persona =>
  PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
