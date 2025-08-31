import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
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

const helpImg = require('../assets/images/help.jpg');
const hospitalImg = require('../assets/images/hospital.jpg');
const ambulanceImg = require('../assets/images/ambulance.png');

const pattern = require('../assets/images/background2.png');
const darkBg  = require('../assets/images/darkmodebg.png');
const handPng = require('../assets/images/hand.png');

const imgSize = wp('20%');

const confirmDelete = (
  title: string,
  message: string,
  cancelLabel: string,
  deleteLabel: string,
  onConfirm: () => void
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel' },
      { text: deleteLabel, style: 'destructive', onPress: onConfirm },
    ]);
  }
};




type CustomPhrase = { id: string; text?: string; image_url?: string; created?: number };
type DefaultPhrase = { id: string; en: string; ar: string; image?: ImageSourcePropType };

const DEFAULTS: DefaultPhrase[] = [
  { id: 'd1', en: 'I need help!', ar: 'مساعدة', image: helpImg },
  { id: 'd2', en: 'Hospital', ar: 'مستشفى', image: hospitalImg },
  { id: 'd3', en: 'Ambulance', ar: 'إسعاف', image: ambulanceImg },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const [custom, setCustom] = useState<CustomPhrase[]>([]);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [preview, setPreview] = useState<{ text?: string; image?: ImageSourcePropType } | null>(null);

  
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const res = await authFetch(`${API_BASE}/emergency_phrases`);
          if (res.status === 401) { router.replace('/login'); return; }
          if (!res.ok) throw new Error(await res.text());
          const list: CustomPhrase[] = await res.json();
          setCustom(list);
        } catch (e) {
          console.warn('Failed to load emergency phrases', e);
          setCustom([]);
        }
      })();
    }, [router])
  );

  const deleteEmergency = async (id: string) => {
    try {
      const res = await authFetch(`${API_BASE}/emergency_delete/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (!res.ok) throw new Error(await res.text());
  
      console.log('Deleted emergency phrase', id);
      setCustom((prev) => prev.filter((c) => c.id !== id));
      Alert.alert(t('deleted') || 'Deleted', t('emergencyPhraseDeleted') || 'Emergency phrase deleted.');
    } catch (e) {
      console.warn('Failed to delete emergency phrase', e);
      Alert.alert(t('error') || 'Error', t('emergencyPhraseDeleteError') || 'Failed to delete emergency phrase.');
    }
  };
  

  const data = [
    ...custom.map((c) => ({ key: `c_${c.id}`, type: 'custom' as const, item: c })),
    ...DEFAULTS.map((d) => ({ key: d.id, type: 'default' as const, item: d })),
  ];

  const renderItem = ({ item }: { item: (typeof data)[number] }) => {
    if (item.type === 'custom') {
      const c = item.item as CustomPhrase;
      const hasText = !!(c.text && c.text.trim().length);

      return (
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: darkMode ? '#16171A' : '#BFC8FF' },
            !hasText && { justifyContent: 'center' },
          ]}
          activeOpacity={0.9}
          onPress={() =>
            setPreview({
              text: c.text?.trim() || undefined,
              image: c.image_url ? { uri: c.image_url } : undefined,
            })
          }
        >
          {hasText ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                {c.image_url ? (
                  <Image source={{ uri: c.image_url }} style={{ width: imgSize, height: imgSize, borderRadius: 12 }} />
                ) : (
                  <View style={{ width: imgSize, height: imgSize }} />
                )}
                <Text
                  style={[
                    styles.cardText,
                    { color: darkMode ? '#F5F5F5' : '#20214A' },
                    { flexShrink: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {c.text}
                </Text>
              </View>
              <View style={styles.cardActions}>
              <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                   confirmDelete(
                      t('delete') || 'Delete',
                      c.text ? (t('deletePhrase', { phrase: c.text }) || `Delete "${c.text}"?`) : (t('deleteImage') || 'Delete this image?'),
                      t('cancel') || 'Cancel',
                      t('delete') || 'Delete',
                      () => deleteEmergency(c.id)
                    );

                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>

                <Ionicons name="chevron-forward" size={22} color={darkMode ? '#E5E7EB' : '#20214A'} />
              </View>
            </>
          ) : (
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              {c.image_url ? (
                <Image source={{ uri: c.image_url }} style={{ width: imgSize, height: imgSize, borderRadius: 12 }} />
              ) : (
                <Image source={handPng} style={{ width: imgSize, height: imgSize, borderRadius: 12 }} resizeMode="contain" />
              )}
              <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                  Alert.alert(
                    t('delete') || 'Delete',
                    c.text ? (t('deletePhrase', { phrase: c.text }) || `Delete "${c.text}"?`) : (t('deleteImage') || 'Delete this image?'),
                    [
                      { text: t('cancel') || 'Cancel', style: 'cancel' },
                      { text: t('delete') || 'Delete', style: 'destructive', onPress: () => deleteEmergency(c.id) },
                    ]
                  );

                  }}
                >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      );
    } else {
      const d = item.item as DefaultPhrase;
      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: darkMode ? '#16171A' : '#BFC8FF' }]}
          activeOpacity={0.9}
          onPress={() => setPreview({ text: `${d.en} / ${d.ar}`, image: d.image })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            {d.image ? (
              <Image source={d.image} style={{ width: imgSize, height: imgSize, borderRadius: 12 }} />
            ) : (
              <View style={{ width: imgSize, height: imgSize }} />
            )}
            <Text
              style={[
                styles.cardText,
                { color: darkMode ? '#F5F5F5' : '#20214A' },
                { flexShrink: 1 },
              ]}
              numberOfLines={1}
            >
              {d.en} / {d.ar}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={darkMode ? '#E5E7EB' : '#20214A'} />
        </TouchableOpacity>
      );
    }
  };

  return (
    <ImageBackground
      source={darkMode ? darkBg : pattern}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.wrapper}>
        <Text style={[styles.title, { color: darkMode ? '#F5F5F5' : '#2C2C88' }]}>
          {t('emergencyPhrases')}
        </Text>

        <FlatList
          data={data}
          keyExtractor={(i) => i.key}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.fab} onPress={() => router.push('/addEmergency')}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <View
          style={[
            styles.bottomNav,
            { backgroundColor: darkMode ? '#111' : '#4D3CE0', flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity onPress={() => router.push('/faq')}>
            <Ionicons name="help-circle-outline" size={wp('9%')} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/home')}>
            <Ionicons name="home" size={wp('7%')} color="#4D3CE0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={wp('9%')} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal visible={!!preview} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalBody}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setPreview(null)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              <ScrollView contentContainerStyle={styles.modalContent}>
                {preview?.image ? <Image source={preview.image} style={styles.fullImage} resizeMode="contain" /> : null}
                {preview?.text ? <Text style={styles.fullText}>{preview.text}</Text> : null}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  wrapper: { flex: 1 },

  title: {
    fontSize: RFPercentage(3.2),
    fontWeight: '800',
    color: '#2C2C88',
    textAlign: 'center',
    marginTop: hp('7%'),
    marginBottom: hp('2%'),
  },

  list: { paddingHorizontal: wp('6%'), paddingBottom: hp('16%'), gap: hp('1.6%') },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#BFC8FF',
    paddingVertical: hp('2.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  cardText: {
    fontSize: RFPercentage(2.2),
    color: '#20214A',
    fontWeight: '700',
    maxWidth: '82%',
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  deleteButton: {
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  deleteButtonImageOnly: {
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  fab: {
    position: 'absolute',
    right: wp('7%'),
    bottom: hp('12%'),
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: '#4D3CE0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp('10%'),
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
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

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  modalBody: { flex: 1 },
  modalClose: { position: 'absolute', right: 16, top: 12, zIndex: 10, padding: 8 },
  modalContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },
  fullImage: { width: '100%', height: '65%', borderRadius: 12, marginBottom: 16 },
  fullText: { color: '#fff', fontSize: RFPercentage(3), fontWeight: '800', textAlign: 'center' },
});
