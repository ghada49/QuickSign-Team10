import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const pattern = require('../assets/images/background2.png');
const handIcon = require('../assets/images/hand_.png'); 

export default function ArabicToSignScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { darkMode } = useContext(ThemeContext);

  const [arabicText, setArabicText] = useState("");

  // Voice to text: dummy handler
  const handleVoiceInput = () => {
    // For now, just alert
    alert("Voice input coming soon!");
  };

  return (
    <ImageBackground source={pattern} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.full}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name={isRTL ? "arrow-forward-outline" : "arrow-back-outline"} size={28} color="#3C55ED" />
        </TouchableOpacity>

        {/* Title (No underline) */}
        <Text style={styles.title}>
          {t("translateArabicToSign")}
        </Text>

        {/* Input Field with mic icon */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t("enterArabicText") || "Enter Arabic Text"}
            placeholderTextColor="#7c8be2"
            value={arabicText}
            onChangeText={setArabicText}
          />
          <TouchableOpacity style={styles.micBtn} onPress={handleVoiceInput}>
            <Ionicons name="mic-outline" size={26} color="#3C55ED" />
          </TouchableOpacity>
        </View>

        {/* Translate Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{t("translate") || "Translate"}</Text>
        </TouchableOpacity>

        {/* Hand Image */}
        <Image source={handIcon} style={styles.handIcon} resizeMode="contain" />

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <Ionicons name="play-skip-back-outline" size={30} color="#3C55ED" />
          <Ionicons name="play-outline" size={34} color="#3C55ED" style={{ marginHorizontal: 10 }} />
          <View style={styles.x05Circle}>
            <Text style={styles.x05Text}>x05</Text>
          </View>
        </View>

        {/* BOTTOM NAV (identical to HomeScreen) */}
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: darkMode ? "#111" : "#4D3CE0",
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
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
  background: { flex: 1, width: "100%" },
  full: { flex: 1, width: "100%" },
  backBtn: {
    position: "absolute",
    top: hp("5%"),
    left: 15,
    zIndex: 20,
  },
  title: {
    fontSize: RFPercentage(4.5),
    fontWeight: "bold",
    color: "#2C2C88",
    textAlign: "center",
    marginTop: hp("10%"),
    marginBottom: hp("2%"),
    // No underline
  },
  inputRow: {
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
    marginTop: hp("4%"),
    backgroundColor: "#b7c5f7",
    borderRadius: 18,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("2%"),
    color: "#2C2C88",
    fontSize: RFPercentage(2.2),
    backgroundColor: "transparent",
  },
  micBtn: {
    padding: 6,
    backgroundColor: "#e6ebfb",
    borderRadius: 20,
    marginLeft: 4,
  },
  button: {
    width: "60%",
    alignSelf: "center",
    backgroundColor: "#b7c5f7",
    borderRadius: 18,
    paddingVertical: hp("1.6%"),
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  buttonText: {
    fontSize: RFPercentage(2.5),
    color: "#2C2C88",
    fontWeight: "bold",
  },
  handIcon: {
    width: wp("45%"),
    height: hp("22%"),
    alignSelf: "center",
    marginVertical: hp("2%"),
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("5%"),
  },
  x05Circle: {
    marginLeft: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#3C55ED",
    alignItems: "center",
    justifyContent: "center",
  },
  x05Text: {
    color: "#3C55ED",
    fontWeight: "bold",
  },
  // Bottom nav styles (identical to HomeScreen)
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
});

