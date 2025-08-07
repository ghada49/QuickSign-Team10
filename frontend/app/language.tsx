import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import i18n from '../i18n';

const logo = require('../assets/images/logo8.png');

const LanguageSelectScreen: React.FC = () => {
  const router = useRouter();

  const selectLanguage = async (lang: 'en' | 'ar') => {
    try {
      await AsyncStorage.setItem('user-language', lang);
      await i18n.changeLanguage(lang);
      router.replace('/welcome');
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>QuickSign</Text>

        <Text style={styles.subtitle}>
          اختر لغتك{'\n'}Please select your language
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => selectLanguage('ar')}>
          <Text style={styles.buttonText}>العربية</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => selectLanguage('en')}>
          <Text style={styles.buttonText}>English</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default LanguageSelectScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp('10%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp('100%'),
    height: wp('100%'),
    marginBottom: hp('-8%'),
  },
  title: {
    fontSize: RFPercentage(6),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFPercentage(2.5),
    color: 'white',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('20%'),
    marginVertical: hp('1.2%'),
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#4D3CE0',
  },
});
