import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const logo = require('../assets/images/logo13.png');

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State for input fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  // Optionally, add a basic validation or feedback if you want

  const handleSignUp = async () => {
    // Simple validation (optional)
    if (!fullName || !email || !password || !gender) {
      alert(t('Please fill in all required fields.'));
      return;
    }
    // Save user to AsyncStorage
    const userData = {
      username: email.split('@')[0],
      name: fullName,
      email,
      password,
      gender,
      phone,
    };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    router.push('/profile');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{t('signup')}</Text>

        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('fullName')}
          placeholderTextColor="#ccc"
          value={fullName}
          onChangeText={setFullName}
        />

        <View style={styles.genderContainer}>
          <Text
            style={[
              styles.genderLabel,
              { textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('gender')}
          </Text>
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'male' && styles.selectedGender,
              ]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'male' && styles.selectedGenderText,
                ]}
              >
                {t('male')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'female' && styles.selectedGender,
              ]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'female' && styles.selectedGenderText,
                ]}
              >
                {t('female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('email')}
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('password')}
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('phoneNumber')}
          placeholderTextColor="#ccc"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>{t('createAccount')}</Text>
        </TouchableOpacity>

        <Text style={styles.text}>
          {t('alreadyAccount')}{' '}
          <Text style={styles.link} onPress={() => router.push('/login')}>
            {t('login')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

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
  genderContainer: {
    width: '100%',
    marginBottom: hp('2%'),
  },
  genderLabel: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2.2),
    marginBottom: hp('1%'),
    color: '#4D3CE0',
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  selectedGender: {
    backgroundColor: '#4D3CE0',
  },
  genderText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
  },
  selectedGenderText: {
    color: '#fff',
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
  },
  link: {
    color: '#4D3CE0',
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
  },
});
