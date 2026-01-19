import { Stack } from 'expo-router';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import HeaderStart from "@/src/components/HeaderStart";
import Footer from "@/src/components/Footer";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
      <SafeAreaView style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
        <HeaderStart />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Ces noms correspondent aux fichiers que nous allons lier */}
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
        </Stack>
        <Footer />
      </SafeAreaView>
  );
}

const styles= StyleSheet.create({
  container: {
    flex : 1,
    backgroundColor: '#13131a',
  }
})