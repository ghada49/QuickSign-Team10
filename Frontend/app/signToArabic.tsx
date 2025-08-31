// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
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
const cameraPng = require('../assets/images/camera.png');
const waveformImg = require('../assets/images/waveform.png');

function pickWebMimeType(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  if (typeof MediaRecorder !== 'undefined') {
    for (const t of candidates) if (MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return 'video/webm';
}

export default function SignToArabicScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { darkMode } = useContext(ThemeContext);

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [outputText, setOutputText] = useState<string>('');

  // Recorder modal
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.front as CameraType);

  // Native camera ref
  const cameraRef = useRef<Camera | null>(null);

  // Web recorder bits
  const webVideoRef = useRef<HTMLVideoElement | null>(null);
  const webStreamRef = useRef<MediaStream | null>(null);
  const webRecorderRef = useRef<MediaRecorder | null>(null);
  const webChunksRef = useRef<Blob[]>([]);

  const C = darkMode
    ? { title:'#F5F5F5', pill:'#23262B', pillText:'#F5F5F5', box:'#23262B', hint:'#E5E7EB', nav:'#111' }
    : { title:'#2C2C88', pill:'#B7C5F7', pillText:'#2C2C88', box:'#E6EBFB', hint:'#2C2C88', nav:'#4D3CE0' };

  const guessMimeFromUri = (uri: string) => {
    const u = uri.toLowerCase();
    if (u.endsWith('.mov')) return 'video/quicktime';
    if (u.endsWith('.mp4')) return 'video/mp4';
    return 'video/mp4';
  };

  async function openWebStream() {
    const facingMode = cameraType === CameraType.front ? 'user' : 'environment';
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
    webStreamRef.current = stream;
    if (webVideoRef.current) {
      webVideoRef.current.srcObject = stream;
      webVideoRef.current.muted = true;
      webVideoRef.current.playsInline = true;
      await webVideoRef.current.play().catch(() => {});
    }
  }

  function stopWebStream() {
    const s = webStreamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      webStreamRef.current = null;
    }
  }

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your media library to pick a video.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset?.uri) setVideoUri(asset.uri);
      else Alert.alert('No video selected', 'Please choose a video.');
    } catch {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  const openRecorder = async () => {
    if (Platform.OS === 'web') {
      try {
        await openWebStream();
        setShowRecorder(true);
      } catch {
        Alert.alert('Permission needed', 'Camera & microphone access is required.');
      }
      return;
    }

    const cam = await Camera.requestCameraPermissionsAsync();
    const mic = await Camera.requestMicrophonePermissionsAsync();
    if (cam.status !== 'granted' || mic.status !== 'granted') {
      Alert.alert(
        t('cameraPermTitle') || 'Permission needed',
        t('cameraPermBody') || 'Camera & microphone permissions are required.'
      );
      return;
    }
    setShowRecorder(true);
  };

  const startRecording = async () => {
    if (isRecording) return;

    if (Platform.OS === 'web') {
      if (!webStreamRef.current) {
        try { await openWebStream(); } catch { return; }
      }
      try {
        setIsRecording(true);
        webChunksRef.current = [];
        const mimeType = pickWebMimeType();
        const rec = new MediaRecorder(webStreamRef.current!, { mimeType });
        webRecorderRef.current = rec;
        rec.ondataavailable = (e: BlobEvent) => e.data?.size && webChunksRef.current.push(e.data);
        rec.onstop = () => {
          const blob = new Blob(webChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setVideoUri(url);
          setIsRecording(false);
          setShowRecorder(false);
        };
        rec.start();
      } catch (e) {
        setIsRecording(false);
        Alert.alert('Error', 'Failed to start recording.');
      }
      return;
    }

    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      const rec = await cameraRef.current.recordAsync({ maxDuration: 30, mute: false });
      setIsRecording(false);
      setShowRecorder(false);
      if (rec?.uri) setVideoUri(rec.uri);
    } catch (e: any) {
      setIsRecording(false);
      setShowRecorder(false);
      Alert.alert('Recording failed', e?.message || 'Please try again.');
    }
  };

  const stopRecording = () => {
    if (Platform.OS === 'web') {
      try { webRecorderRef.current?.stop(); } catch {}
      return;
    }
    cameraRef.current?.stopRecording();
  };

  const onTranslate = async () => {
    if (!videoUri) {
      Alert.alert('No video', 'Please record or upload a video first.');
      return;
    }
    setIsTranslating(true);
    try {
      const fileName = videoUri.split('/').pop() || 'video.mp4';
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const res = await fetch(videoUri);
        const blob = await res.blob();
        const type = blob.type || 'video/webm';
        const ext = (type.split('/')[1] || 'webm').replace('quicktime', 'mov');
        formData.append('video', new File([blob], `video.${ext}`, { type }));
      } else {
        const fileName = videoUri.split('/').pop() || 'video.mp4';
        formData.append('video', {
          uri: videoUri,
          name: fileName,
          type: guessMimeFromUri(videoUri),
        } as any);
      }

      const response = await authFetch(`${API_BASE}/signtoarabic`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setOutputText(data.text);
    } catch {
      Alert.alert('Error', 'Failed to translate video.');
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (!showRecorder && Platform.OS === 'web') stopWebStream();
  }, [showRecorder]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') stopWebStream();
    };
  }, []);

  return (
    <ImageBackground source={darkMode ? darkBg : pattern} style={styles.background} resizeMode="cover" imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.full}>
        <Text style={[styles.title, { color: C.title }]}>
          {t('translateSignToArabic') || 'Translate Sign to Arabic'}
        </Text>

        {/* TWO BUTTONS: Upload + Open Camera (Open Camera works on web too) */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
          <TouchableOpacity style={[styles.openCamBtn, { backgroundColor: C.pill }]} onPress={pickFromGallery} activeOpacity={0.85}>
            <Text style={[styles.openCamText, { color: C.pillText }]}>{t('uploadVideo') || 'Upload Video'}</Text>
            <Ionicons name="cloud-upload-outline" size={20} color={C.pillText} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.openCamBtn, { backgroundColor: C.pill }]} onPress={openRecorder} activeOpacity={0.85}>
            <Text style={[styles.openCamText, { color: C.pillText }]}>{t('openCamera') || 'Open Camera'}</Text>
            <Ionicons name="videocam-outline" size={20} color={C.pillText} />
          </TouchableOpacity>
        </View>

        <View style={[styles.videoBox, { backgroundColor: C.box }]}>
          {videoUri ? (
            <>
              <Ionicons name="film-outline" size={36} color={C.pillText} />
              <Text style={[styles.videoHint, { color: C.hint }]}>{t('videoLoaded') || 'Video ready'}</Text>
            </>
          ) : (
            <>
              <Image source={cameraPng} style={styles.cameraIcon} resizeMode="contain" />
              <Text style={[styles.videoHint, { color: C.hint }]}>{t('video') || 'video'}</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={[styles.translateBtn, { backgroundColor: C.pill }]} onPress={onTranslate} activeOpacity={0.9} disabled={isTranslating}>
          <Text style={[styles.translateText, { color: C.pillText }]}>
            {isTranslating ? (t('translating') || 'Translating…') : (t('translate') || 'Translate')}
          </Text>
        </TouchableOpacity>

        <View style={styles.waveRow}>
          <Image source={waveformImg} style={styles.waveform} resizeMode="contain" />
        </View>

        {!!outputText && (
          <Text style={[styles.output, { textAlign: isRTL ? 'right' : 'left', color: C.title }]}>{outputText}</Text>
        )}

        <View style={[styles.bottomNav, { backgroundColor: C.nav, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => router.push('/faq')}>
            <Ionicons name="help-circle-outline" size={wp('10%')} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/home')}>
            <Ionicons name="home" size={wp('7.5%')} color="#4D3CE0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={wp('9%')} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showRecorder}
          animationType="slide"
          onRequestClose={() => { setShowRecorder(false); if (Platform.OS === 'web') stopWebStream(); }}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            {Platform.OS === 'web' ? (
              <video ref={webVideoRef} style={{ flex: 1 } as any} autoPlay muted playsInline />
            ) : (
              <Camera ref={(r) => (cameraRef.current = r)} style={{ flex: 1 }} type={cameraType as any} ratio="16:9" />
            )}

            <View style={styles.recBar}>
              <TouchableOpacity onPress={() => { setShowRecorder(false); if (Platform.OS === 'web') stopWebStream(); }} style={styles.recIconBtn}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={[styles.recButton, isRecording && styles.recButtonActive]} />

              <TouchableOpacity
                onPress={async () => {
                  setCameraType(p => (p === CameraType.front ? CameraType.back : CameraType.front));
                  if (Platform.OS === 'web') {
                    stopWebStream();
                    try { await openWebStream(); } catch {}
                  }
                }}
                style={styles.recIconBtn}
              >
                <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  full: { flex: 1, width: '100%' },

  title: {
    fontSize: RFPercentage(3.2),
    fontWeight: '900',
    textAlign: 'center',
    marginTop: hp('8%'),
    marginBottom: hp('2%'),
  },

  openCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.0%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 16,
  },
  openCamText: { fontWeight: '700', marginRight: 8, fontSize: RFPercentage(2.0) },

  videoBox: {
    width: '82%',
    alignSelf: 'center',
    height: hp('20%'),
    borderRadius: 18,
    marginTop: hp('1.6%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: { width: wp('18%'), height: wp('18%'), opacity: 0.9, marginBottom: 6 },
  videoHint: { opacity: 0.8, fontWeight: '600' },

  translateBtn: {
    width: '60%',
    alignSelf: 'center',
    borderRadius: 18,
    paddingVertical: hp('1.4%'),
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  translateText: { fontSize: RFPercentage(2.4), fontWeight: '800' },

  waveform: { width: '82%', height: hp('8%'), opacity: 0.95 },
  waveRow: { alignItems: 'center', justifyContent: 'center', marginVertical: hp('1.2%') },

  output: {
    width: '84%',
    alignSelf: 'center',
    fontSize: RFPercentage(2.6),
    marginTop: hp('0.5%'),
    marginBottom: hp('10%'),
    fontWeight: '600',
  },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: hp('10%'),
    alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: wp('10%'),
    borderTopLeftRadius: wp('8%'), borderTopRightRadius: wp('8%'),
  },
  homeButton: {
    width: wp('16%'), height: wp('16%'), borderRadius: wp('8%'),
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginTop: hp('-1%'), shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 4,
  },

  recBar: {
    position: 'absolute', bottom: hp('4%'), left: 0, right: 0,
    paddingHorizontal: wp('8%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recIconBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recButton: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: '#ff3b30',
    borderWidth: 3,
    borderColor: '#fff',
  },
  recButtonActive: { backgroundColor: '#c12720' },
});