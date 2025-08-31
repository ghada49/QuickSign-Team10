import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import i18n from '../i18n';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const lang = await AsyncStorage.getItem('user-language');
        if (!lang) {
          router.replace('/language');
          return;
        }
        await i18n.changeLanguage(lang);

        await getCurrentUser();
        router.replace('/home');
      } catch {
        router.replace('/welcome');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4D3CE0" />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
