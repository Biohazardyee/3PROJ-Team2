import { Expo } from 'expo-server-sdk';
import { PrismaDb } from '../../../config/database.js';

const expo = new Expo();

export const sendPushNotification = async (userId: string, title: string, body: string, data: any = {}) => {
    const user = await PrismaDb.users.findUnique({ where: { id: userId } });
    if (!user || !user.expo_push_token) return;

    if (!Expo.isExpoPushToken(user.expo_push_token)) return;

    const message = {
        to: user.expo_push_token,
        sound: 'default',
        title,
        body,
        data,
    };

    await expo.sendPushNotificationsAsync([message]);
};