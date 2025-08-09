// app/faq.tsx
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemeContext } from "../theme";
import { useTranslation } from "react-i18next";
import { RFPercentage } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const pattern = require("../assets/images/background2.png");

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FAQ() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // FAQ uses translations for all questions and answers
  const faqData = [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    // Add more here...
  ];

  const toggleItem = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === i ? null : i);
  };

  return (
    <ImageBackground source={pattern} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[
            styles.title,
            darkMode && styles.titleDark,
            { textAlign: isRTL ? "right" : "left" }
          ]}>
            {t("faqTitle")}
          </Text>

          {faqData.map((item, i) => (
            <View
              key={i}
              style={[
                styles.card,
                { backgroundColor: darkMode ? "#222" : "rgba(60,85,237,0.2)" },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.questionRow,
                  { flexDirection: isRTL ? "row-reverse" : "row" }
                ]}
                onPress={() => toggleItem(i)}
              >
                <Text
                  style={[
                    styles.question,
                    darkMode && { color: "#fff" },
                    { textAlign: isRTL ? "right" : "left" }
                  ]}
                >
                  {item.question}
                </Text>
                <Ionicons
                  name={
                    activeIndex === i
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={24}
                  color={darkMode ? "#fff" : "#2C2C88"}
                />
              </TouchableOpacity>

              {activeIndex === i && (
                <View
                  style={[
                    styles.answerBox,
                    { backgroundColor: darkMode ? "#333" : "rgba(60,85,237,0.3)" },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color={darkMode ? "#fff" : "#2C2C88"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.answer,
                      darkMode && { color: "#fff" },
                      { textAlign: isRTL ? "right" : "left" }
                    ]}
                  >
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Bottom nav identical to home page */}
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: darkMode ? "#111" : "#4D3CE0",
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")}>
            <Ionicons
              name="help-circle-outline"
              size={wp("10%")}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.homeButton}>
            <Ionicons name="home" size={wp("7.5%")} color="#4D3CE0" />
          </View>

          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons
              name="settings-outline"
              size={wp("9%")}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    paddingTop: hp("4%"),
    paddingHorizontal: wp("5%"),
    paddingBottom: hp("12%"),
  },
  title: {
    fontSize: RFPercentage(4.8),
    fontFamily: "Poppins_800ExtraBold",
    color: "#2C2C88",
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  titleDark: { color: "#fff" },
  card: {
    borderRadius: 12,
    marginBottom: hp("1.5%"),
    padding: wp("4%"),
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 18,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
    color: "#2C2C88",
    flex: 1,
  },
  answerBox: {
    flexDirection: "row",
    marginTop: hp("1%"),
    borderRadius: 10,
    padding: wp("3%"),
  },
  answer: {
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
    color: "#2C2C88",
    flex: 1,
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
});
