import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { API_BASE } from '../lib/api';
import { authFetch } from '../lib/authFetch';
import { ThemeContext } from '../theme';

const pattern = require('../assets/images/background2.png');
const darkBg = require('../assets/images/darkmodebg.png');

export default function AddEmergency() {
  const router = useRouter();
  const [ar, setAr] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [photoBase64, setPhotoBase64] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { darkMode } = useContext(ThemeContext);

  const takePhoto = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (cam.status !== 'granted') {
      Alert.alert(t('permNeededTitle'), t('permCameraMsg'));
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]) {
      setPhotoUri(res.assets[0].uri);
      setPhotoBase64(res.assets[0].base64 ?? undefined);
    }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert(t('permNeededTitle'), t('permGalleryMsg'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]) {
      setPhotoUri(res.assets[0].uri);
      setPhotoBase64(res.assets[0].base64 ?? undefined);
    }
  };

  const save = async () => {
    if (!ar.trim() && !photoBase64) {
      Alert.alert(t('missingContentTitle'), t('missingContentMsg'));
      return;
    }
    try {
      setSaving(true);

      const payload: any = {};
      if (ar.trim()) payload.text = ar.trim();
      if (photoBase64) payload.image = `data:image/jpeg;base64,${photoBase64}`;

      const res = await authFetch(`${API_BASE}/emergency_add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      router.back();
    } catch (e: any) {
      Alert.alert(t('errorTitle'), e?.message || t('saveErrorMsg'));
    } finally {
      setSaving(false);
    }
  };

  const disabled = (!ar.trim() && !photoBase64) || saving;

  return (
    <ImageBackground
      source={darkMode ? darkBg : pattern}
      style={{ flex: 1, height: '100%', width: '100%' }}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.wrap}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name={'arrow-back-outline'} size={26} color="#3C55ED" />
        </TouchableOpacity>

        <Text style={[styles.headline, { color: darkMode ? '#F5F5F5' : DARK }]}>
          {t('addEmergencyHeadlineLine1')}
          {'\n'}
          {t('addEmergencyHeadlineLine2')}
        </Text>
        <Text style={[styles.sub, { color: darkMode ? '#A1A1AA' : '#7D84B5' }]}>
          {t('addEmergencySub')}
        </Text>

        <View style={[styles.card, { backgroundColor: darkMode ? '#16171A' : PURPLE }]}>
          <Text style={[styles.cardTitle, { color: darkMode ? '#F5F5F5' : '#20214A' }]}>
            {t('typeArabicText')}
          </Text>
          <View style={[styles.inputPill, { backgroundColor: darkMode ? '#23262B' : '#D7DCFF' }]}>
            <TextInput
              value={ar}
              onChangeText={setAr}
              placeholder={t('arabicPlaceholder')}
              placeholderTextColor={darkMode ? '#94a3b8' : '#7D84B5'}
              style={[
                styles.input,
                { color: darkMode ? '#F5F5F5' : '#20214A' },
                {
                  textAlign: isRTL ? 'right' : 'left',
                  writingDirection: isRTL ? 'rtl' : 'ltr',
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.card, { gap: 10, backgroundColor: darkMode ? '#16171A' : PURPLE }]}>
          <Text style={[styles.cardTitle, { color: darkMode ? '#F5F5F5' : '#20214A' }]}>
            {t('attachPhoto')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={takePhoto}
              style={[
                styles.smallBtn,
                { backgroundColor: darkMode ? '#23262B' : '#D7DCFF', borderColor: darkMode ? '#2a2a2f' : '#C7CEFF' },
              ]}
              activeOpacity={0.9}
            >
              <Ionicons name="camera-outline" size={18} color={darkMode ? '#F5F5F5' : '#20214A'} />
              <Text style={[styles.smallBtnText, { color: darkMode ? '#F5F5F5' : '#20214A' }]}>
                {t('takePhoto')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickPhoto}
              style={[
                styles.smallBtn,
                { backgroundColor: darkMode ? '#23262B' : '#D7DCFF', borderColor: darkMode ? '#2a2a2f' : '#C7CEFF' },
              ]}
              activeOpacity={0.9}
            >
              <Ionicons name="image-outline" size={18} color={darkMode ? '#F5F5F5' : '#20214A'} />
              <Text style={[styles.smallBtnText, { color: darkMode ? '#F5F5F5' : '#20214A' }]}>
                {t('chooseFromGallery')}
              </Text>
            </TouchableOpacity>
          </View>

          {photoUri ? (
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <Image source={{ uri: photoUri }} style={{ width: 160, height: 160, borderRadius: 12 }} />
              <Text style={[styles.captured, { color: darkMode ? '#F5F5F5' : '#2C6E49' }]}>
                {t('photoAttached')}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, disabled && { opacity: 0.6 }]}
          onPress={save}
          activeOpacity={0.9}
          disabled={disabled}
        >
          <Text style={styles.saveText}>{saving ? t('saving') : t('savePhrase')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const PURPLE = '#BFC8FF';
const DARK = '#2C2C88';

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  back: { position: 'absolute', top: hp('4%'), left: 16, zIndex: 10 },

  headline: {
    textAlign: 'center',
    color: DARK,
    fontWeight: '900',
    fontSize: RFPercentage(3.4),
    marginTop: hp('6.5%'),
    lineHeight: RFPercentage(3.8),
  },
  sub: {
    textAlign: 'center',
    color: '#7D84B5',
    fontWeight: '600',
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
  },

  card: {
    backgroundColor: PURPLE,
    marginHorizontal: wp('6%'),
    borderRadius: 22,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    marginTop: hp('2%'),
  },
  cardTitle: {
    color: '#20214A',
    fontWeight: '800',
    marginBottom: hp('1%'),
    fontSize: RFPercentage(2.2),
  },
  inputPill: {
    backgroundColor: '#D7DCFF',
    borderRadius: 999,
    paddingVertical: hp('1.3%'),
    paddingHorizontal: wp('4%'),
  },
  input: {
    fontSize: RFPercentage(2.2),
    color: '#20214A',
  },
  captured: {
    marginTop: 6,
    color: '#2C6E49',
    fontWeight: '700',
  },

  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D7DCFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C7CEFF',
  },
  smallBtnText: { color: '#20214A', fontWeight: '700' },

  saveBtn: {
    alignSelf: 'center',
    backgroundColor: DARK,
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('20%'),
    borderRadius: 18,
    marginTop: hp('3%'),
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: RFPercentage(2.2) },
});
