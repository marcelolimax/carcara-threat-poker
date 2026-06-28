import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { randomBytes } from 'crypto';
import { createRoom, getRoom, saveRoom, deleteRoom, toSnapshot } from './roomStore';
import { generateThreatOptions } from '../services';
import { ClientMessage, ServerMessage, Room, Participant } from '../types';

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
            try {
                const options = await generateThreatOptions(msg.userStory);
                room.userStory = msg.userStory;
                room.options = options;
                room.votes = {};
                room.phase = 'voting';
                await saveRoom(room);
                await broadcastRoom(room.code);
            } catch (e) {
                console.error('[room] erro ao gerar opções:', e);
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
            room.phase = 'revealed';
            await saveRoom(room);
            await broadcastRoom(room.code);
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
