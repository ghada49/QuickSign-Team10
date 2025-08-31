import { Stack } from "expo-router";
import '../i18n';
import '../lib/aws';
import '../polyfills';
import { ThemeProvider } from "../theme";
export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}