import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  I18nManager,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import i18n from "../i18n";
import { ThemeContext } from "../theme";

const lightBg = require("../assets/images/background2.png");
const darkBg  = require("../assets/images/darkmodebg.png");
const logo    = require("../assets/images/logo13.png");

const MAIN_COLOR = "#3C55ED";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const [language, setLanguage] = useState(i18n.language || "en");

  const isRTL = i18n.language === "ar";

  const C = darkMode
    ? {
        text: "#fff",
        cardBg: "#23262B",
        navBg: "#111",
        icon: MAIN_COLOR,
        buttonText: "#fff",
      }
    : {
        text: "#2C2C88",
        cardBg: "rgba(60,85,237,0.85)",
        navBg: "#4D3CE0",
        icon: MAIN_COLOR,
        buttonText: "#fff",
      };

  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("user-language");
      if (savedLang && savedLang !== language) {
        setLanguage(savedLang);
        await i18n.changeLanguage(savedLang);
        I18nManager.forceRTL(savedLang === "ar");
      }
    })();
  }, []);

  const changeLanguage = async () => {
    const nextLang = language === "en" ? "ar" : "en";
    await i18n.changeLanguage(nextLang);
    setLanguage(nextLang);
    await AsyncStorage.setItem("user-language", nextLang);
    I18nManager.forceRTL(nextLang === "ar");
  };

  return (
    <ImageBackground
      source={darkMode ? darkBg : lightBg}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={[styles.full, { backgroundColor: "transparent" }]}>
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={[styles.title, { color: C.text }]}>
          {t("settingsTitle") || "Settings"}
        </Text>

        <View style={styles.settingsBlock}>
          <View style={styles.row}>
            <Ionicons name="globe-outline" size={32} color={C.icon} style={styles.icon} />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: C.cardBg }]}
              onPress={changeLanguage}
              activeOpacity={0.9}
            >
              <Text style={[styles.buttonText, { color: C.buttonText }]}>
                {language === "en" ? "العربية" : "English"}
              </Text>
              <Ionicons name="chevron-down-outline" size={22} color={C.buttonText} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Ionicons name="moon-outline" size={32} color={C.icon} style={styles.icon} />
            <View
              style={[
                styles.button,
                { backgroundColor: C.cardBg, flexDirection: "row", justifyContent: "space-between" },
              ]}
            >
              <Text style={[styles.buttonText, { color: C.buttonText }]}>
                {t("darkMode") || "Dark Mode"}
              </Text>
              <Switch
                value={darkMode}
                onValueChange={(v) => toggleDarkMode(v)}
                thumbColor={darkMode ? MAIN_COLOR : "#fff"}
                trackColor={{ false: "#aaa", true: "#fff" }}
                style={{ transform: [{ scale: 1.05 }] }}
              />
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="person-outline" size={32} color={C.icon} style={styles.icon} />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: C.cardBg }]}
              onPress={() => router.push("/profile")}
              activeOpacity={0.9}
            >
              <Text style={[styles.buttonText, { color: C.buttonText }]}>
                {t("profile") || "Profile"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.bottomNav,
            { backgroundColor: C.navBg, flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")} activeOpacity={0.8}>
            <Ionicons name="help-circle-outline" size={wp("10%")} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/home")}>
            <Ionicons name="home" size={wp("7.5%")} color="#4D3CE0" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/settings")} activeOpacity={0.8}>
            <Ionicons name="settings-outline" size={wp("9%")} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, width: "100%" },
  bg: { flex: 1, width: "100%", height: "100%" },

  logoWrap: {
    alignItems: "center",
    marginTop: hp("15%"),
    marginBottom: hp("0.5%"),
  },
  logo: { width: wp("95%"), height: hp("30%"), marginBottom: hp("-2"), marginTop: hp("0%") },

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
