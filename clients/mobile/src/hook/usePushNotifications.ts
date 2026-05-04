
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiClient from '../api/client';

export const usePushNotifications = (userId: string | null) => {
    useEffect(() => {
        if (!userId) return;

        const register = async () => {
            if (!Device.isDevice) return; // Les notifs ne marchent pas sur simulateur

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') return;

            const token = (await Notifications.getExpoPushTokenAsync({
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