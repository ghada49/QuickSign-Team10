
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import i18n from '../i18n';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     //AsyncStorage.clear();

    const bootstrap = async () => {
      try {
        const lang = await AsyncStorage.getItem('user-language');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');

        if (!lang) {
          router.replace('/language');
        } else {
          await i18n.changeLanguage(lang);

          if (loggedIn === 'true') {
            router.replace('/home');
          } else {
            router.replace('/home');
          }
        }
      } catch (e) {
        console.error(e);
        router.replace('/language');
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
  loader: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
});
