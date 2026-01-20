import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from "@/src/components/Footer";

export default function RootLayout() {
  return (
      <View style={[styles.container]}>
        <LayoutContent />
      </View>
  );
}

function LayoutContent() {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

            <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="restriction" />
                    <Stack.Screen name="notifications"/>
                    <Stack.Screen name="OnBoarding" />
                </Stack>
            </View>
            <Footer />
        </View>
    );
}

const styles= StyleSheet.create({
  container: {
    flex : 1,
    backgroundColor: '#13131a',
  }
})