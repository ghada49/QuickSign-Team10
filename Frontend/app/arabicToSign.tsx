import { Ionicons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { api } from '../lib/api';
import { ThemeContext } from '../theme';

const pattern = require('../assets/images/background2.png');
const darkBg  = require('../assets/images/darkmodebg.png');

type SignClip = { token: string; url: string; key?: string };

export default function ArabicToSignScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { darkMode } = useContext(ThemeContext);

  const [arabicText, setArabicText] = useState('');
  const [clips, setClips] = useState<SignClip[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState<1 | 0.5>(1);
  const videoRef = useRef<Video>(null);

  const translate = async () => {
    if (!arabicText.trim()) {
      Alert.alert(t('pleaseFillAllFields') || 'Please type something');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post<{ videos: SignClip[] }>('/text-to-sign', { text: arabicText.trim() });
      const list = res.videos || [];
      if (!list.length) {
        Alert.alert(t('noVideosFound') || 'No matching sign videos found.');
        setClips([]); setIdx(0);
        return;
      }
      setClips(list); setIdx(0);
    } catch (e: any) {
      Alert.alert(t('errorTitle') || 'Error', e?.message || 'Failed to translate');
    } finally {
      setLoading(false);
    }
  };

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish && idx + 1 < clips.length) {
      setIdx((prev) => Math.min(prev + 1, clips.length - 1));
    }
  };

  const togglePlay = async () => {
    const v = videoRef.current; if (!v) return;
    const st = await v.getStatusAsync();
    if (st.isLoaded) st.isPlaying ? v.pauseAsync() : v.playAsync();
  };

  const skipBack = () => clips.length && setIdx((prev) => Math.max(0, prev - 1));
  const toggleRate = async () => {
    const next = rate === 1 ? 0.5 : 1;
    setRate(next);
    const v = videoRef.current; if (v) await v.setRateAsync(next, true);
  };

  const currentUrl = clips[idx]?.url;
  useEffect(() => {
    (async () => {
      if (!videoRef.current) return;
      try {
        await videoRef.current.setRateAsync(rate, true);
      } catch {}
    })();
  }, [currentUrl, rate]);

  return (
    <ImageBackground
      source={darkMode ? darkBg : pattern}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.full}>
        <Text style={[styles.title, { color: darkMode ? '#F5F5F5' : '#2C2C88' }]}>
          {t('translateArabicToSign')}
        </Text>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: darkMode ? '#23262B' : '#b7c5f7' },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: darkMode ? '#F5F5F5' : '#2C2C88' },
            ]}
            placeholder={t('enterArabicText') || 'Enter Arabic Text'}
            placeholderTextColor={darkMode ? '#94a3b8' : '#7c8be2'}
            value={arabicText}
            onChangeText={setArabicText}
            textAlign={isRTL ? 'right' : 'left'}
          />
          <TouchableOpacity
            style={[
              styles.micBtn,
              { backgroundColor: darkMode ? '#2b2f36' : '#e6ebfb' },
            ]}
            onPress={() =>
                Alert.alert(
                  t('comingSoonTitle') || 'Coming soon',
                  t('voiceInputComingSoon') || 'Voice input is coming soon!'
                )
              }

          >
            <Ionicons name="mic-outline" size={26} color="#3C55ED" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: darkMode ? '#2b2f36' : '#b7c5f7' },
          ]}
          onPress={translate}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.buttonText,
              { color: darkMode ? '#F5F5F5' : '#2C2C88' },
            ]}
          >
            {loading ? (t('loading') || 'Loading…') : (t('translate') || 'Translate')}
          </Text>
        </TouchableOpacity>

        {currentUrl && (
          <>
            <Video
              ref={videoRef}
              source={{ uri: currentUrl }}
              style={[
                styles.videoResponsive,
                { backgroundColor: 'transparent' },
              ]}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={onStatus}
              shouldPlay
              rate={rate}
            />
            <View style={styles.controlsRow}>
              <Pressable onPress={skipBack}>
                <Ionicons name="play-skip-back-outline" size={30} color="#3C55ED" />
              </Pressable>
              <Pressable onPress={togglePlay}>
                <Ionicons name="play-outline" size={34} color="#3C55ED" style={{ marginHorizontal: 10 }} />
              </Pressable>
              <Pressable
                style={[
                  styles.x05Circle,
                  {
                    backgroundColor: darkMode ? 'rgba(35,38,43,0.95)' : '#fff',
                    borderColor: darkMode ? '#3a3a40' : '#3C55ED',
                  },
                ]}
                onPress={toggleRate}
              >
                <Text
                  style={[
                    styles.x05Text,
                    { color: darkMode ? '#F5F5F5' : '#3C55ED' },
                  ]}
                >
                  {rate === 1 ? 'x1' : 'x05'}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: darkMode ? '#111' : '#4D3CE0',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.push('/faq')}>
            <Ionicons name="help-circle-outline" size={wp('10%')} color="#fff" />
          </TouchableOpacity>
          <Pressable style={styles.homeButton} onPress={() => router.push('/home')}>
            <Ionicons name="home" size={wp('7.5%')} color="#4D3CE0" />
          </Pressable>
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
  full: { flex: 1, width: '100%' },

  title: {
    fontSize: RFPercentage(4.5),
    fontWeight: 'bold',
    color: '#2C2C88',
    textAlign: 'center',
    marginTop: hp('10%'),
    marginBottom: hp('2%'),
  },

  inputRow: {
    width: '85%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('4%'),
    backgroundColor: '#b7c5f7',
    borderRadius: 18,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('2%'),
    color: '#2C2C88',
    fontSize: RFPercentage(2.2),
    backgroundColor: 'transparent',
  },

  micBtn: {
    padding: 6,
    backgroundColor: '#e6ebfb',
    borderRadius: 20,
    marginLeft: 4,
  },

  button: {
    width: '60%',
    alignSelf: 'center',
    backgroundColor: '#b7c5f7',
    borderRadius: 18,
    paddingVertical: hp('1.6%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
  },

  buttonText: {
    fontSize: RFPercentage(2.5),
    color: '#2C2C88',
    fontWeight: 'bold',
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('5%'),
  },

  x05Circle: {
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#3C55ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  x05Text: {
    color: '#3C55ED',
    fontWeight: 'bold',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

  videoResponsive: {
    width: wp('70%'),
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
