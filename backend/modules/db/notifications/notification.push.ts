import {Expo, ExpoPushMessage, ExpoPushTicket} from "expo-server-sdk";


const expo = new Expo();

export async function sendPushNotification(
    pushToken: string | null,
    title: string,
    body: string,
    data?: Record<string, any>,
): Promise<void> {
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.error(`Token Expo invalide ou manquant : ${pushToken}`);
        return;
    }

    const messages: ExpoPushMessage[] = [
        {
            to: pushToken,
            sound: "default",
            title: title,
            body: body,
            data: data,
        },
    ];

    try {
        const chunks: ExpoPushMessage[][] = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            const ticketChunk: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification Push:", error);
    }
}

export async function broadcastPushNotifications(
    pushTokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
): Promise<void> {
    const validTokens: string[] = pushTokens.filter((token: string): boolean => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) return;

    const messages: ExpoPushMessage[] = validTokens.map((token: string) => ({
        to: token,
        sound: "default",
        title,
        body,
        data,
    }));

    const chunks: ExpoPushMessage[][] = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
        try {
            await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
            console.error("Erreur lors du broadcast push:", error);
        }
    }
}
