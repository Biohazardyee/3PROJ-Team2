import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AutGuard from '../components/AuthGuard';


export const AuthGuardWrapper = ({children}: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect((): void => {
        checkAuth();
    }, []);

    const checkAuth: () => Promise<void> = async (): Promise<void> => {
        try {
            const token: string | null = await SecureStore.getItemAsync("userToken");
            setIsAuthenticated(!!token);
        } catch (e) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', backgroundColor: '#1C1C28'}}>
                <ActivityIndicator color="#ec4899" size="large"/>
            </View>
        );
    }

    if (!isAuthenticated) {
        return <AutGuard/>;
    }

    return <>{children}</>;
};