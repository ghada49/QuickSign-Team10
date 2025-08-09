import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme'; 

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
