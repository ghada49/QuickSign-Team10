import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ImageBackground,
  SafeAreaView,
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

const pattern = require('../assets/images/background2.png');

const earIcon = require('../assets/images/ear.png');
const handIcon = require('../assets/images/hand1.png');
const alertIcon = require('../assets/images/emergency1.png');
const bookmarkIcon = require('../assets/images/bookmark.png');

export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const cards = [
    {
      key: 'a2s',
      title: t('translateArabicToSign'),
      image: earIcon,
      bg: '#fff',
      route: '/arabicToSign',
    },
    {
      key: 's2a',
      title: t('translateSignToArabic'),
      image: handIcon,
      bg: '#fff',
      route: '/signToArabic',
    },
    {
      key: 'em',
      title: t('emergencyPhrases'),
      image: alertIcon,
      bg: '#fff',
      route: '/emergency',
    },
    {
      key: 'sv',
      title: t('savedPhrases'),
      image: bookmarkIcon,
      bg: '#fff',
      route: '/saved',
    },
  ];

  return (
    <ImageBackground source={pattern} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        {cards.map(({ key, title, image, bg, route }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.card,
              { backgroundColor: bg, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={() => router.push(route as any)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconBox,
                {
                  marginLeft: isRTL ? 0 : wp('4%'),
                  marginRight: isRTL ? wp('4%') : 0,
                },
              ]}
            >
              <Image source={image} style={styles.iconImage} resizeMode="contain" />
            </View>
            <Text style={[styles.cardText, { textAlign: 'center' }]}>{title}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.bottomNav, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => router.push('/faq')}>
            <Ionicons name="help-circle-outline" size={wp('10%')} color="#fff" />
          </TouchableOpacity>

          <View style={styles.homeButton}>
            <Ionicons name="home" size={wp('7.5%')} color="#4D3CE0" />
          </View>

          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={wp('9%')} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('13%'),
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    marginVertical: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('3%'),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  iconImage: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('3%'),
    resizeMode: 'contain',
  },
  cardText: {
    flex: 1,
    fontSize: RFPercentage(3),
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp('10%'),
    backgroundColor: '#4D3CE0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: wp('10%'),
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
  },
  homeButton: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('-1%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
});
