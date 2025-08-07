// frontend/app/_layout.tsx

import { Stack } from 'expo-router';
import '../i18n';

export default function Layout() {
  // An empty <Stack> will automatically pick up every .tsx in /app
  return <Stack screenOptions={{ headerShown: false }} />;
}
