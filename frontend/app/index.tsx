import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Clear all old saved data (language, login state, etc.)
    AsyncStorage.clear();

    // After clearing, go to the language screen
    router.replace('/language');
  }, []);

  return null;
}
