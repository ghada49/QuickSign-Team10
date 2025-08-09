import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  SafeAreaView,
  ImageBackground,
  I18nManager,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ASSETS
const background = require("../assets/images/background2.png");
const logo = require("../assets/images/logo13.png");

// COLORS
const MAIN_COLOR = "#3C55ED";
const DARK_BG = "#181D23";
const DARK_CARD = "#23262B";
const DARK_TEXT = "#fff";
const LIGHT_TEXT = "#2C2C88";
const LIGHT_CARD = "rgba(60,85,237,0.85)";
const WHITE = "#fff";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(false);
  // LANGUAGE STATE
  const [language, setLanguage] = useState(i18n.language || "en");

  // Dynamic styles for dark/light mode
  const pageBg = isDarkMode ? DARK_BG : "transparent";
  const cardBg = isDarkMode ? DARK_CARD : LIGHT_CARD;
  const textColor = isDarkMode ? DARK_TEXT : LIGHT_TEXT;
  const iconColor = MAIN_COLOR;
  const navBg = isDarkMode ? "#111" : "#4D3CE0";
  const homeBtnBg = isDarkMode ? DARK_TEXT : WHITE;

  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("user-language");
      if (savedLang && savedLang !== language) {
        setLanguage(savedLang);
        await i18n.changeLanguage(savedLang);
        if (savedLang === "ar") {
          I18nManager.forceRTL(true);
        } else {
          I18nManager.forceRTL(false);
        }
      }
    })();
  }, []);

  // LANGUAGE SWITCH
  const changeLanguage = async () => {
    const nextLang = language === "en" ? "ar" : "en";
    await i18n.changeLanguage(nextLang);
    setLanguage(nextLang);
    await AsyncStorage.setItem("user-language", nextLang);
    if (nextLang === "ar") {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
    // May require app reload for full RTL/LTR update.
  };

  return (
    <ImageBackground source={background} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={[styles.full, { backgroundColor: pageBg }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        {/* Settings Title */}
        <Text style={[styles.title, { color: textColor }]}>
          {t("settingsTitle") || "Settings"}
        </Text>

        {/* Settings Block */}
        <View style={styles.settingsBlock}>
          {/* Language */}
          <View style={styles.row}>
            <Ionicons
              name="globe-outline"
              size={32}
              color={iconColor}
              style={styles.icon}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: cardBg }]}
              onPress={changeLanguage}
            >
              <Text style={[styles.buttonText, { color: DARK_TEXT }]}>
                {language === "en" ? "العربية" : "English"}
              </Text>
              <Ionicons
                name="chevron-down-outline"
                size={22}
                color={DARK_TEXT}
              />
            </TouchableOpacity>
          </View>
          {/* Dark Mode */}
          <View style={styles.row}>
            <Ionicons
              name="moon-outline"
              size={32}
              color={iconColor}
              style={styles.icon}
            />
            <View
              style={[
                styles.button,
                {
                  backgroundColor: cardBg,
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: DARK_TEXT }]}>
                {t("darkMode") || "Dark Mode"}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                thumbColor={isDarkMode ? MAIN_COLOR : "#fff"}
                trackColor={{ false: "#aaa", true: "#fff" }}
              />
            </View>
          </View>
          {/* Profile */}
          <View style={styles.row}>
            <Ionicons
              name="person-outline"
              size={32}
              color={iconColor}
              style={styles.icon}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: cardBg }]}
              onPress={() => router.push("/profile")}
            >
              <Text style={[styles.buttonText, { color: DARK_TEXT }]}>
                {t("profile") || "Profile"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTTOM NAV (IDENTICAL TO HOME) */}
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: navBg,
              flexDirection: "row",
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")}>
            <Ionicons name="help-circle-outline" size={wp("10%")} color="#fff" />
          </TouchableOpacity>
         <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/home")}>
  <Ionicons name="home-outline" size={wp("7.5%")} color="#4D3CE0" />
</TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={wp("9%")} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, width: "100%" },
  bg: { flex: 1, width: "100%" },
  logoWrap: {
    alignItems: "center",
    marginTop: hp("15%"),
    marginBottom: hp("0.5%"),
  },
  logo: { width: wp("95%"), height: wp("52%") },
  title: {
    fontSize: RFPercentage(5),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("0.1%"),
    marginTop: hp("2%"),
    letterSpacing: 0.4,
  },
  settingsBlock: {
    width: "88%",
    alignSelf: "center",
    marginTop: hp("5%"),
    marginBottom: hp("5%"),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  icon: {
    marginRight: wp("3%"),
    marginLeft: wp("1%"),
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(60,85,237,0.85)",
    borderRadius: 10,
    paddingVertical: hp("1.7%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "space-between",
    marginLeft: wp("1%"),
  },
  buttonText: {
    color: "#fff",
    fontSize: RFPercentage(2.5),
    fontWeight: "bold",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: hp("10%"),
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: wp("10%"),
    borderTopLeftRadius: wp("8%"),
    borderTopRightRadius: wp("8%"),
  },
  homeButton: {
    width: wp("16%"),
    height: wp("16%"),
    borderRadius: wp("8%"),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("-1%"),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
});