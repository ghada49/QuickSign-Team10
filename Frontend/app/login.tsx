import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { fetchAuthSession, resendSignUpCode, signIn } from 'aws-amplify/auth';

const logo = require('../assets/images/logo13.png');

const notify = (title: string, msg?: string) =>
  Platform.OS === 'web' ? window.alert(msg ? `${title}\n${msg}` : title) : Alert.alert(title, msg);

const LoginScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);


  const finishLogin = async () => {
    const { tokens } = await fetchAuthSession(); 
    const idToken = tokens?.idToken?.toString();
    if (!idToken) { notify('Login failed', 'No id token'); return; }
    notify(t('loginSuccess') || 'Login successful');
    router.replace('/home');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      notify(t('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }
    setBusy(true);
    try {
      const out = await signIn({ username: email.trim().toLowerCase(), password });
      const step = out?.nextStep?.signInStep || 'DONE';

      if (step === 'DONE') {
        await finishLogin();
        return;
      }
      if (step === 'RESET_PASSWORD') {
        notify(t('passwordResetRequired') || 'Password reset required');
        router.push('/resetPassword');
        return;
      }

      notify(t('loginFailed') || 'Login failed', t('unsupportedStep') || `Unsupported step: ${step}`);
    } catch (e: any) {
      console.log('Amplify signIn error:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
      const code = e?.name || e?.code;

      if (code === 'UserNotConfirmedException') {
        try {
          await resendSignUpCode({ username: email.trim().toLowerCase() });
          notify(t('pleaseVerifyEmailLink') || 'Please verify your email', t('verificationEmailResent') || 'Verification email resent.');
        } catch {
          notify(t('resendFailed') || 'Could not resend verification email');
        }
      } else if (code === 'NotAuthorizedException') {
        notify(t('wrongCredentials') || 'Incorrect email or password');
      } else if (code === 'UserNotFoundException') {
        notify(t('userNotFound') || 'User not found');
      } else if (code === 'PasswordResetRequiredException') {
        notify(t('passwordResetRequired') || 'Password reset required');
        router.push('/resetPassword');
      } else {
        notify(t('loginFailed') || 'Login failed', e?.message || '');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>{t('login')}</Text>

      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('email') || 'Email'}
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('password') || 'Password'}
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? (t('signingIn') || 'Signing in…') : t('login')}</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        {t('forgotPass')} {'\n '}
        <Text style={styles.link} onPress={() => router.push('/resetPassword')}>
          {t('resetPass') || 'Reset Password'}
        </Text>
      </Text>

      <Text style={styles.text}>
        {t('noAcc')} {'\n '}
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
  logo: { width: wp('95%'), height: hp('30%'), marginBottom: hp('3%'), marginTop: hp('2%') },
  title: { fontSize: RFPercentage(4), color: '#4D3CE0', fontWeight: 'bold', width: '100%', textAlign: 'center', marginBottom: hp('2%') },
  input: {
    width: '100%', backgroundColor: '#4D3CE0', borderRadius: wp('2%'),
    paddingVertical: hp('1.8%'), paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'), color: 'white', fontSize: RFPercentage(2.2),
  },
  button: {
    backgroundColor: '#4D3CE0', borderRadius: wp('3%'),
    paddingVertical: hp('2%'), paddingHorizontal: wp('20%'),
    marginBottom: hp('3%'), alignItems: 'center', width: '100%', elevation: 4,
  },
  buttonText: { fontSize: RFPercentage(2.5), fontWeight: 'bold', color: '#fff' },
  text: { fontSize: RFPercentage(2), marginTop: hp('2%'), textAlign: 'center' },
  link: { color: '#4D3CE0', fontWeight: 'bold', fontSize: RFPercentage(2) },
});
