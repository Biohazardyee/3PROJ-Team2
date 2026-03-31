import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from "@/src/components/Footer";
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
        <LayoutContent />
    </ThemeProvider>
  );
}

function LayoutContent() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.background }]}>

            <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                </Stack>
            </View>
            <Footer />
        </View>
    );
}
const styles= StyleSheet.create({
  container: {
    flex : 1,
    }
})