import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { randomBytes } from 'crypto';
import { createRoom, getRoom, saveRoom, deleteRoom, toSnapshot } from './roomStore';
import { generateThreatOptions, analyzeThreats } from '../services';
import { ClientMessage, ServerMessage, Room, Participant, PlayerResponse } from '../types';

// Estado de conexão por socket (em memória, válido para instância única).
interface ConnInfo { participantId: string; code?: string; }
const conns = new Map<WebSocket, ConnInfo>();
// Registro de sockets por sala para broadcast.
const roomSockets = new Map<string, Set<WebSocket>>();

const send = (ws: WebSocket, msg: ServerMessage) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
};

const sendError = (ws: WebSocket, message: string) => send(ws, { type: 'error', message });

// Envia o snapshot da sala para todos os sockets conectados a ela (youId por destinatário).
const broadcastRoom = async (code: string) => {
    const room = await getRoom(code);
    const sockets = roomSockets.get(code.toUpperCase());
    if (!room || !sockets) return;
    for (const ws of sockets) {
        const info = conns.get(ws);
        if (!info) continue;
        send(ws, { type: 'room_state', room: toSnapshot(room, info.participantId) });
    }
};

const registerSocket = (code: string, ws: WebSocket) => {
    const c = code.toUpperCase();
    if (!roomSockets.has(c)) roomSockets.set(c, new Set());
    roomSockets.get(c)!.add(ws);
};

const newParticipant = (id: string, persona: { name: string; icon: string }): Participant => ({
    id,
    name: persona?.name || 'Anônimo',
    icon: persona?.icon || '🕶️',
    isHost: false,
    connected: true,
});

const handleMessage = async (ws: WebSocket, raw: string) => {
    let msg: ClientMessage;
    try {
        msg = JSON.parse(raw);
    } catch {
        return sendError(ws, 'Mensagem inválida');
    }

    const info = conns.get(ws);
    if (!info) return;

    switch (msg.type) {
        case 'create_room': {
            const host = { ...newParticipant(info.participantId, msg.persona), isHost: true };
            const room = await createRoom(msg.mode, host);
            info.code = room.code;
            registerSocket(room.code, ws);
            await broadcastRoom(room.code);
            break;
        }
        case 'join_room': {
            const room = await getRoom(msg.code);
            if (!room) return sendError(ws, 'Sala não encontrada');
            if (room.phase !== 'lobby') return sendError(ws, 'A sala já iniciou a rodada');
            room.participants[info.participantId] = newParticipant(info.participantId, msg.persona);
            await saveRoom(room);
            info.code = room.code;
            registerSocket(room.code, ws);
            await broadcastRoom(room.code);
            break;
        }
        case 'start_round': {
            if (!info.code) return sendError(ws, 'Você não está em uma sala');
            const room = await getRoom(info.code);
            if (!room) return sendError(ws, 'Sala não encontrada');
            if (room.hostId !== info.participantId) return sendError(ws, 'Apenas o host inicia a rodada');
            // Idempotência: só inicia a partir do lobby. Bloqueia cliques repetidos
            // (a fase muda para 'generating' antes da chamada à IA).
            if (room.phase !== 'lobby') return sendError(ws, 'A rodada já foi iniciada');

            room.phase = 'generating';
            room.userStory = msg.userStory;
            room.votes = {};
            room.options = undefined;
            await saveRoom(room);
            await broadcastRoom(room.code);

            try {
                const options = await generateThreatOptions(msg.userStory);
                const fresh = await getRoom(info.code);
                if (!fresh || fresh.phase !== 'generating') return; // sala mudou/saiu nesse meio-tempo
                fresh.options = options;
                fresh.phase = 'voting';
                await saveRoom(fresh);
                await broadcastRoom(fresh.code);
            } catch (e) {
                console.error('[room] erro ao gerar opções:', e);
                const fresh = await getRoom(info.code);
                if (fresh) {
                    fresh.phase = 'lobby';
                    await saveRoom(fresh);
                    await broadcastRoom(fresh.code);
                }
                sendError(ws, 'Falha ao gerar as opções de ameaça');
            }
            break;
        }
        case 'submit_vote': {
            if (!info.code) return sendError(ws, 'Você não está em uma sala');
            const room = await getRoom(info.code);
            if (!room || room.phase !== 'voting') return sendError(ws, 'Votação não está aberta');
            room.votes[info.participantId] = {
                participantId: info.participantId,
                selectedOptionId: msg.selectedOptionId,
                justification: msg.justification,
            };
            await saveRoom(room);
            await broadcastRoom(room.code);
            break;
        }
        case 'reveal': {
            if (!info.code) return sendError(ws, 'Você não está em uma sala');
            const room = await getRoom(info.code);
            if (!room) return sendError(ws, 'Sala não encontrada');
            if (room.hostId !== info.participantId) return sendError(ws, 'Apenas o host revela');
            if (room.phase !== 'voting') return sendError(ws, 'Não há votação para revelar');

            // Revela os votos imediatamente (as opções permanecem visíveis para discussão).
            room.phase = 'revealed';
            await saveRoom(room);
            await broadcastRoom(room.code);

            // Em segundo plano, gera a análise da IA por opção (Risco/Esforço/STRIDE) para apoiar a decisão.
            try {
                const options = room.options || [];
                const playerResponses: PlayerResponse[] = Object.values(room.votes)
                    .map((v, idx) => {
                        const opt = options.find((o) => o.id === v.selectedOptionId);
                        return opt ? { playerId: idx, selectedOption: opt, justification: v.justification } : null;
                    })
                    .filter((x): x is PlayerResponse => x !== null);
                if (room.userStory && options.length) {
                    const analysis = await analyzeThreats(room.userStory, options, playerResponses);
                    const fresh = await getRoom(info.code);
                    if (fresh && fresh.phase === 'revealed') {
                        fresh.analysis = analysis;
                        await saveRoom(fresh);
                        await broadcastRoom(fresh.code);
                    }
                }
            } catch (e) {
                console.error('[room] erro ao analisar (segue sem análise):', e);
            }
            break;
        }
        case 'decide': {
            if (!info.code) return sendError(ws, 'Você não está em uma sala');
            const room = await getRoom(info.code);
            if (!room) return sendError(ws, 'Sala não encontrada');
            if (room.hostId !== info.participantId) return sendError(ws, 'Apenas o host define a decisão');
            if (room.phase !== 'revealed' && room.phase !== 'decision') return sendError(ws, 'A decisão só ocorre após revelar');
            const exists = (room.options || []).some((o) => o.id === msg.optionId);
            if (!exists) return sendError(ws, 'Opção inválida');
            room.chosenOptionId = msg.optionId;
            room.phase = 'decision';
            await saveRoom(room);
            await broadcastRoom(room.code);
            break;
        }
        case 'update_persona': {
            if (!info.code) return sendError(ws, 'Você não está em uma sala');
            const room = await getRoom(info.code);
            if (!room) return sendError(ws, 'Sala não encontrada');
            const p = room.participants[info.participantId];
            if (p) {
                p.name = (msg.persona?.name || p.name).slice(0, 24);
                p.icon = msg.persona?.icon || p.icon;
                await saveRoom(room);
                await broadcastRoom(room.code);
            }
            break;
        }
        case 'leave_room': {
            await handleLeave(ws);
            break;
        }
    }
};

const handleLeave = async (ws: WebSocket) => {
    const info = conns.get(ws);
    if (!info?.code) return;
    const code = info.code;
    const sockets = roomSockets.get(code.toUpperCase());
    sockets?.delete(ws);

    const room = await getRoom(code);
    if (room) {
        delete room.participants[info.participantId];
        delete room.votes[info.participantId];
        const remaining = Object.values(room.participants);
        if (remaining.length === 0) {
            await deleteRoom(code);
            roomSockets.delete(code.toUpperCase());
        } else {
            // promove novo host se o host saiu
            if (room.hostId === info.participantId) {
                room.hostId = remaining[0].id;
                remaining[0].isHost = true;
            }
            await saveRoom(room);
            await broadcastRoom(code);
        }
    }
    info.code = undefined;
};

export const attachRoomServer = (server: HttpServer) => {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        // só trata o caminho do WS das salas
        if (!req.url || !req.url.startsWith('/api/ws')) return;
        wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
    });

    wss.on('connection', (ws: WebSocket) => {
        const participantId = randomBytes(8).toString('hex');
        conns.set(ws, { participantId });

        ws.on('message', (data) => handleMessage(ws, data.toString()));
        ws.on('close', async () => {
            await handleLeave(ws);
            conns.delete(ws);
        });
        ws.on('error', () => { /* ignora; close cuida da limpeza */ });
    });

    console.log('[WS] servidor de salas anexado em /api/ws');
};
