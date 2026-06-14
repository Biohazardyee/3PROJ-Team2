import "@/src/i18n"; 
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
  EdgeInsets,
} from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import Footer from "@/src/components/Footer";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { usePushNotifications } from "../src/hook/usePushNotifications";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function LayoutContent() {
  const insets: EdgeInsets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect((): void => {
    setIsReady(true);
  }, []);

  useEffect((): void => {
    const checkUser = async (): Promise<void> => {
      const storedId = await SecureStore.getItemAsync("userId");
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
          backgroundColor: theme?.background || "#000",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </View>

      {isReady && <Footer />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
