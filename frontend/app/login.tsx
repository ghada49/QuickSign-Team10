import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const logo = require('../assets/images/logo13.png');

const LoginScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle login logic
  const handleLogin = async () => {
    const stored = await AsyncStorage.getItem('user');
    if (!stored) {
      Alert.alert(t('login'), t('No user found. Please sign up first.'));
      return;
    }
    const savedUser = JSON.parse(stored);
    if (email.trim().toLowerCase() === savedUser.email.trim().toLowerCase() && password === savedUser.password) {
      // Optional: Save user again to refresh session if needed
      await AsyncStorage.setItem('user', JSON.stringify(savedUser));
      router.push('/profile');
    } else {
      Alert.alert(t('login'), t('Incorrect email or password.'));
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>{t('login')}</Text>

      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('email')}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t('login')}</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        {t('forgotPass')} {'\n'}
        <Text style={styles.link} onPress={() => router.push('/resetPassword')}>
          {t('resetPass')}
        </Text>
      </Text>

      <Text style={styles.text}>
        {t('noAcc')}{' '}
        <Text style={styles.link} onPress={() => router.push('/signup')}>
          {t('signup')}
        </Text>
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('4%'),
    backgroundColor: 'white',
  },
  logo: {
    width: wp('95%'),
    height: hp('30%'),
    marginBottom: hp('3%'),
    marginTop: hp('2%'),
  },
  title: {
    fontSize: RFPercentage(4),
    color: '#4D3CE0',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  input: {
    width: '100%',
    backgroundColor: '#4D3CE0',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    color: 'white',
    fontSize: RFPercentage(2.2),
  },

  button: {
    backgroundColor: '#4D3CE0',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('20%'),
    marginBottom: hp('3%'),
    alignItems: 'center',
    width: '100%',
    elevation: 4,
  },
  buttonText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  text: {
    fontSize: RFPercentage(2),
    marginTop: hp('2%'),
    textAlign: 'center',
  },
  link: {
    color: '#4D3CE0',
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
  },
});
