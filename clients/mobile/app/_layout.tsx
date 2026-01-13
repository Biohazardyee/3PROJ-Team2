import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ces noms correspondent aux fichiers que nous allons lier */}
      <Stack.Screen name="index" /> 
      <Stack.Screen name="login" />
    </Stack>
  );
}