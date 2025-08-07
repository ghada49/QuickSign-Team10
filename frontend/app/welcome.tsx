import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

const logo = require('../assets/images/logo8.png');

const AuthScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter(); 

  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>QuickSign {'\n'}</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
          <Text style={styles.buttonText}>{t('signup')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>{t('login')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default AuthScreen;

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
    width: wp('95%'),
    height: wp('95%'),
    marginBottom: hp('-8%'),
  },
  title: {
    fontSize: RFPercentage(6),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    height: hp('8%'),                     
    minWidth: wp('60%'),
    alignSelf: 'center',
    marginVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',            
    elevation: 10,
  },
  buttonText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#4D3CE0',
  },
});
