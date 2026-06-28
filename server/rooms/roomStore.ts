import { getRedis } from '../redisClient';
import { Room, RoomSnapshot, Participant } from '../types';

const ROOM_TTL_SECONDS = 60 * 60 * 4; // salas expiram após 4h de inatividade
const keyOf = (code: string) => `room:${code.toUpperCase()}`;

// Gera um código de sala legível e difícil de adivinhar (ex.: CARCARA-7F3K).
const randomCode = (): string => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem caracteres ambíguos
    let s = '';
    for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return `CARCARA-${s}`;
};

export const createRoom = async (
    mode: 'v1' | 'v2',
    host: Participant
): Promise<Room> => {
    const redis = await getRedis();
    let code = randomCode();
    // evita colisão de código
    while (await redis.exists(keyOf(code))) code = randomCode();

    const now = Date.now();
    const room: Room = {
        code,
        mode,
        phase: 'lobby',
        hostId: host.id,
        participants: { [host.id]: { ...host, isHost: true } },
        votes: {},
        createdAt: now,
        updatedAt: now,
    };
    await saveRoom(room);
    return room;
};

export const getRoom = async (code: string): Promise<Room | null> => {
    const redis = await getRedis();
    const raw = await redis.get(keyOf(code));
    return raw ? (JSON.parse(raw) as Room) : null;
};

export const saveRoom = async (room: Room): Promise<void> => {
    const redis = await getRedis();
    room.updatedAt = Date.now();
    await redis.set(keyOf(room.code), JSON.stringify(room), { EX: ROOM_TTL_SECONDS });
};

export const deleteRoom = async (code: string): Promise<void> => {
    const redis = await getRedis();
    await redis.del(keyOf(code));
};

// Monta o snapshot público (oculta o conteúdo dos votos até a revelação).
export const toSnapshot = (room: Room, youId: string): RoomSnapshot => {
    const revealed = room.phase === 'revealed' || room.phase === 'decision' || room.phase === 'finished';
    return {
        code: room.code,
        mode: room.mode,
        phase: room.phase,
        hostId: room.hostId,
        youId,
        participants: Object.values(room.participants),
        userStory: room.userStory,
        options: room.options,
        votedParticipantIds: Object.keys(room.votes),
        votes: revealed ? Object.values(room.votes) : undefined,
        analysis: revealed ? room.analysis : undefined,
        chosenOptionId: room.chosenOptionId,
    };
};
