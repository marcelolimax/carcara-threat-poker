import { createClient, RedisClientType } from 'redis';

// Cliente Redis usado para persistir o estado das salas multiplayer.
// Configure via REDIS_URL (ex.: redis://redis:6379 no docker-compose).
const url = process.env.REDIS_URL || 'redis://localhost:6379';

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

export const getRedis = async (): Promise<RedisClientType> => {
    if (client && client.isOpen) return client;
    if (connecting) return connecting;

    const c: RedisClientType = createClient({ url });
    c.on('error', (err) => console.error('[Redis] erro:', err.message));

    connecting = c.connect().then(() => {
        client = c;
        connecting = null;
        console.log(`[Redis] conectado em ${url}`);
        return c;
    });

    return connecting;
};
