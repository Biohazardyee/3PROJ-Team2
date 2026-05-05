import {useEffect} from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import apiClient from '../api/client';

export const usePushNotifications: (userId: string | null) => void = (userId: string | null): void => {
    useEffect((): void => {
        if (!userId) return;

        const register: () => Promise<void> = async (): Promise<void> => {
            if (!Device.isDevice) return;

            const {status: existingStatus} = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const {status} = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') return;

            const token: string = (await Notifications.getExpoPushTokenAsync({
                projectId: 'a961ba89-48ee-4ea9-b8da-8772ef87999f'
            })).data;

            try {
                await apiClient.post('/users/update-push-token', {
                    user_id: userId,
                    token
                });
            } catch (e) {
                console.error("Erreur enregistrement token:", e);
            }
        };

        register();
    }, [userId]);
};