import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const logo = require('../assets/images/logo13.png');

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const notify = (title: string, msg?: string) =>
    Platform.OS === 'web' ? window.alert(msg ? `${title}\n${msg}` : title) : Alert.alert(title, msg);

  const handleSendCode = async () => {
    const username = email.trim().toLowerCase();
    if (!username) {
      notify(t('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }
    setBusy(true);
    try {
      const out = await resetPassword({ username });
      setCodeSent(true);
      notify(
        t('verificationSent') || 'Verification sent',
        t('checkInbox') || 'Please check your inbox for the code.'
      );
    } catch (e: any) {
      const code = e?.name || e?.code;
      if (code === 'UserNotFoundException') {
        notify(t('userNotFound') || 'User not found');
      } else if (code === 'LimitExceededException' || code === 'TooManyRequestsException') {
        notify(t('tryLater') || 'Too many attempts. Please try again later.');
      } else {
        notify(t('resetFailed') || 'Could not start reset', e?.message || '');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    const username = email.trim().toLowerCase();
    if (!username || !code.trim() || !newPassword) {
      notify(t('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }
    if (newPassword.length < 8) {
      notify(t('weakPassword') || 'Password is too weak', t('min8Chars') || 'Minimum 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await confirmResetPassword({
        username,
        confirmationCode: code.trim(),
        newPassword,
      });
      notify(t('passwordResetSuccess') || 'Password reset successful');
      router.replace('/login');
    } catch (e: any) {
      const code = e?.name || e?.code;
      if (code === 'CodeMismatchException') {
        notify(t('invalidCode') || 'Invalid verification code');
      } else if (code === 'ExpiredCodeException') {
        notify(t('codeExpired') || 'Code expired. Please request a new one.');
      } else if (code === 'InvalidPasswordException') {
        notify(t('weakPassword') || 'Password is too weak');
      } else {
        notify(t('resetFailed') || 'Could not reset password', e?.message || '');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>{t('resetPass') || 'Reset Password'}</Text>

        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('email') || 'Email'}
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!busy}
          onSubmitEditing={() => (codeSent ? undefined : handleSendCode())}
        />

        {!codeSent && (
          <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={busy}>
            <Text style={styles.buttonText}>
              {busy ? (t('sending') || 'Sending…') : (t('sendCode') || 'Send Code')}
            </Text>
          </TouchableOpacity>
        )}
        {codeSent && (
          <>
            <TextInput
              style={[styles.input, { textAlign: 'center' }]}
              placeholder={t('verificationCode') || 'Verification Code'}
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              editable={!busy}
            />

            <TextInput
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('newPassword') || 'New Password'}
              placeholderTextColor="#ccc"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!busy}
              onSubmitEditing={handleConfirm}
            />

            <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={busy}>
              <Text style={styles.buttonText}>
                {busy ? (t('saving') || 'Saving…') : (t('confirm') || 'Confirm')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#6F7CF0' }]}
              onPress={handleSendCode}
              disabled={busy}
            >
              <Text style={styles.buttonText}>
                {t('resendVerificationEmail') || 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.text}>
          {t('noAcc')} {'\n '}
          <Text style={styles.link} onPress={() => router.push('/signup')}>
            {t('signup')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

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
