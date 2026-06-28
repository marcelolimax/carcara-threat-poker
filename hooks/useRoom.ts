import { useCallback, useEffect, useRef, useState } from 'react';
import { Persona } from '../lib/personas';

export type RoomPhase = 'lobby' | 'voting' | 'revealed' | 'decision' | 'finished';

export interface RoomParticipant {
  id: string;
  name: string;
  icon: string;
  isHost: boolean;
  connected: boolean;
}

export interface RoomVote {
  participantId: string;
  selectedOptionId: string;
  justification: string;
}

export interface RoomOption {
  id: string;
  description: string;
}

export interface RoomSnapshot {
  code: string;
  mode: 'v1' | 'v2';
  phase: RoomPhase;
  hostId: string;
  youId: string;
  participants: RoomParticipant[];
  userStory?: string;
  options?: RoomOption[];
  votedParticipantIds: string[];
  votes?: RoomVote[];
}

type ConnStatus = 'idle' | 'connecting' | 'open' | 'closed';

const wsUrl = (): string => {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/api/ws`;
};

export const useRoom = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnStatus>('idle');
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queueRef = useRef<string[]>([]);

  const flush = useCallback(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      queueRef.current.forEach((m) => ws.send(m));
      queueRef.current = [];
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (status === 'open' || status === 'connecting')) return;
    setStatus('connecting');
    const ws = new WebSocket(wsUrl());
    wsRef.current = ws;
    ws.onopen = () => { setStatus('open'); flush(); };
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setError('Falha na conexão com a sala');
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'room_state') { setRoom(msg.room); setError(null); }
        else if (msg.type === 'error') setError(msg.message);
      } catch { /* ignora frames inválidos */ }
    };
  }, [status, flush]);

  const send = useCallback((payload: object) => {
    const data = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(data);
    else { queueRef.current.push(data); connect(); }
  }, [connect]);

  useEffect(() => () => { wsRef.current?.close(); }, []);

  return {
    status,
    room,
    error,
    createRoom: (mode: 'v1' | 'v2', persona: Persona) => send({ type: 'create_room', mode, persona }),
    joinRoom: (code: string, persona: Persona) => send({ type: 'join_room', code, persona }),
    startRound: (userStory: string) => send({ type: 'start_round', userStory }),
    submitVote: (selectedOptionId: string, justification: string) =>
      send({ type: 'submit_vote', selectedOptionId, justification }),
    reveal: () => send({ type: 'reveal' }),
    leave: () => send({ type: 'leave_room' }),
  };
};
