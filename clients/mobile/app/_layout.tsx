import {useEffect, useState} from "react";
import {Stack} from "expo-router";
import {StyleSheet, View} from "react-native";
import * as SecureStore from "expo-secure-store";
import {
    useSafeAreaInsets,
    SafeAreaProvider, EdgeInsets,
} from "react-native-safe-area-context";
import Footer from "@/src/components/Footer";
import {ThemeProvider, useTheme} from "../src/context/ThemeContext";
import {usePushNotifications} from "../src/hook/usePushNotifications";
import * as Notifications from "expo-notifications";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <LayoutContent/>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function LayoutContent() {
    const insets: EdgeInsets = useSafeAreaInsets();
    const {theme} = useTheme();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect((): void => {
        const checkUser: () => Promise<void> = async (): Promise<void> => {
            const storedId: string | null = await SecureStore.getItemAsync("userId");
            if (storedId) {
                setUserId(storedId);
            }
        };
        checkUser();
    }, []);

    usePushNotifications(userId);

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    backgroundColor: theme.background,
                },
            ]}
        >
            <View style={{flex: 1}}>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="index"/>
                </Stack>
            </View>
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
