import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
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

import { api, ApiError } from '../lib/api';
import { ThemeContext } from '../theme';

const pattern  = require('../assets/images/background2.png');
const darkBg   = require('../assets/images/darkmodebg.png');

const earIcon = require('../assets/images/ear.png');
const handIcon = require('../assets/images/hand1.png');
const alertIcon = require('../assets/images/emergency1.png');
const bookmarkIcon = require('../assets/images/bookmark.png');

export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { darkMode } = useContext(ThemeContext);

  const C = darkMode
    ? {
        card: '#16171A',
        text: '#F5F5F5',
        border: '#2A2A2F',
        nav: '#22232A',
        primary: '#818CF8',
        shadow: 0.25,
      }
    : {
        card: '#FFFFFF',
        text: '#111111',
        border: '#E7E7E7',
        nav: '#4D3CE0',
        primary: '#4D3CE0',
        shadow: 0.1,
      };

  const [me, setMe] = useState<{ sub?: string; email?: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ sub: string; email?: string }>('/me');
        setMe(data);
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/welcome');
        } else {
          console.warn('Failed to load /me:', e);
        }
      }
    })();
  }, []);

  const cards = [
    { key: 'a2s', title: t('translateArabicToSign'), image: earIcon, route: '/arabicToSign' },
    { key: 's2a', title: t('translateSignToArabic'), image: handIcon, route: '/signToArabic' },
    { key: 'em',  title: t('emergencyPhrases'),     image: alertIcon, route: '/emergency' },
    { key: 'sv',  title: t('savedPhrases'),         image: bookmarkIcon, route: '/saved' },
  ];

  return (
    <ImageBackground
      source={darkMode ? darkBg : pattern}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {cards.map(({ key, title, image, route }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.card,
              {
                backgroundColor: C.card,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                shadowOpacity: C.shadow,
              },
            ]}
            onPress={() => router.push(route as any)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: C.card,
                  borderWidth: 1,
                  borderColor: C.border,
                  marginLeft: isRTL ? 0 : wp('4%'),
                  marginRight: isRTL ? wp('4%') : 0,
                },
              ]}
            >
              <Image source={image} style={styles.iconImage} resizeMode="contain" />
            </View>
            <Text style={[styles.cardText, { color: C.text, textAlign: 'center' }]}>
              {title}
            </Text>
          </TouchableOpacity>
        ))}

        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: C.nav,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.push('/faq')}>
            <Ionicons name="help-circle-outline" size={wp('10%')} color="#fff" />
          </TouchableOpacity>

          <View style={[styles.homeButton, { backgroundColor: C.card, shadowOpacity: C.shadow }]}>
            <Ionicons name="home" size={wp('7.5%')} color={C.primary} />
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
  background: { flex: 1, width: '100%', height: '100%' },
  safeArea: { flex: 1, paddingHorizontal: wp('6%'), justifyContent: 'center' },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('13%'),
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    marginVertical: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('3%'),
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
    bottom: 0, left: 0, right: 0,
    height: hp('10%'),
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
