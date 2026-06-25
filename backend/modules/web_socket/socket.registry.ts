import type {Server} from "socket.io";

/**
 * Petit registre pour partager l'instance Socket.IO avec les services
 * (qui n'ont pas accès au serveur HTTP). Permet d'émettre des événements
 * temps réel (ex: notifications) depuis n'importe quel module.
 */
let ioInstance: Server | null = null;

export function setIO(io: Server): void {
    ioInstance = io;
}

export function getIO(): Server | null {
    return ioInstance;
}

/**
 * Émet un événement vers la "room" personnelle d'un utilisateur (`user_<id>`).
 */
export function emitToUser(userId: string, event: string, payload: unknown): void {
    if (!ioInstance) return;
    ioInstance.to(`user_${userId}`).emit(event, payload);
}
