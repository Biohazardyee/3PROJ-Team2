import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderStart from "@/src/components/HeaderStart";
import Footer from "@/src/components/Footer";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
      <SafeAreaProvider style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
        <LayoutContent />
      </SafeAreaProvider>
  );
}

function LayoutContent() {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

            {/* 1. Zone du contenu (Stack) : flex: 1 lui permet de prendre toute la place */}
            <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="register" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="restriction" />
                </Stack>
            </View>

            {/* 2. Le Footer reste en bas car la View au-dessus pousse tout l'espace */}
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