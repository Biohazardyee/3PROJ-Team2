import { Expo, ExpoPushMessage } from "expo-server-sdk";


const expo = new Expo();

export async function sendPushNotification(
  pushToken: string | null,
  title: string,
  body: string,
  data?: Record<string, any>,
) {
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
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Ticket notification envoyé:", ticketChunk);
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
) {
  const validTokens = pushTokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) return;

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Erreur lors du broadcast push:", error);
    }
  }
}
