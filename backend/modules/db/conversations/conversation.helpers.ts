import {PrismaDb} from "../../../config/database.js";
import {Prisma} from "../../../generated/prisma/client.js";
import {TransactionClient} from "../../../generated/prisma/internal/prismaNamespace";

export async function findByParticipants(
    u1: string,
    u2: string,
    tx?: Prisma.TransactionClient,
) {
    const client: TransactionClient = tx || PrismaDb;
    const [user1_id, user2_id] = [u1, u2].sort();

    return client.conversations.findUnique({
        where: {
            user1_id_user2_id: {user1_id, user2_id},
        },
    });
}

export async function ensureConversation(
    u1: string,
    u2: string,
    tx?: Prisma.TransactionClient,
): Promise<void> {
    const client: TransactionClient = tx || PrismaDb;
    const [user1_id, user2_id] = [u1, u2].sort();
    const exists = await findByParticipants(u1, u2, client);

    if (!exists) {
        await client.conversations.create({
            data: {user1_id, user2_id},
        });
    }
}

export async function deleteByParticipants(
    u1: string,
    u2: string,
    tx?: Prisma.TransactionClient,
): Promise<void> {
    const client: TransactionClient = tx || PrismaDb;

    const conversation = await findByParticipants(u1, u2, client);

    if (conversation) {
        await client.conversations.delete({
            where: {id: conversation.id},
        });
    }
}
