
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { KeyboardTypeOptions } from "react-native";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { API_BASE } from "../lib/api";
import { authFetch } from "../lib/authFetch";
import { ThemeContext } from "../theme";

const pattern = require("../assets/images/background2.png");
const darkBg  = require("../assets/images/darkmodebg.png");

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FAQ() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const colors = useMemo(
    () => ({
      cardBg: darkMode ? "#222" : "rgba(60,85,237,0.2)",
      answerBg: darkMode ? "#333" : "rgba(60,85,237,0.3)",
      primary: darkMode ? "#fff" : "#2C2C88",
      navBg: darkMode ? "#111" : "#4D3CE0",
      inputBg: darkMode ? "#1a1a1a" : "#fff",
      inputText: darkMode ? "#fff" : "#1a1a1a",
      inputBorder: darkMode ? "#444" : "#dcdcf7",
      placeholder: darkMode ? "#aaa" : "#888",
      buttonBg: "#4D3CE0",
      buttonText: "#fff",
      success: darkMode ? "#8be28b" : "#1e7f1e",
      error: "#cc3a3a",
    }),
    [darkMode]
  );

  const faqData = [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
  ];

  const toggleItem = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === i ? null : i);
  };

  const goHome = () => router.replace("/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentOK, setSentOK] = useState<null | boolean>(null);

  const validate = () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert(t("error") || "Error", t("pleaseFillAllFields") || "Please fill all fields.");
      return false;
    }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      Alert.alert(t("invalidEmail") || "Invalid Email", t("enterValidEmail") || "Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSentOK(null);

    try {
      const response = await authFetch(`${API_BASE}/contact-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          locale: i18n.language,
        }),
      });

      if (response.ok) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSentOK(true);
        setName(""); setEmail(""); setSubject(""); setMessage("");
      } else {
        const errorData = await response.json();
        setSentOK(false);
        Alert.alert('Error', errorData.error || 'Failed to send support ticket');
      }
    } catch (error) {
      console.error('Error sending support ticket:', error);
      setSentOK(false);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={darkMode ? darkBg : pattern}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text
              style={[styles.title, darkMode && styles.titleDark, { textAlign: isRTL ? "right" : "left" }]}
            >
              {t("faqTitle")}
            </Text>

            {faqData.map((item, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.cardBg }]}>
                <TouchableOpacity
                  style={[styles.questionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
                  onPress={() => toggleItem(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.question, { color: colors.primary, textAlign: isRTL ? "right" : "left" }]}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={activeIndex === i ? "chevron-up-outline" : "chevron-down-outline"}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {activeIndex === i && (
                  <View style={[styles.answerBox, { backgroundColor: colors.answerBg }]}>
                    <Ionicons
                      name="chevron-forward-outline"
                      size={18}
                      color={colors.primary}
                      style={{
                        marginRight: isRTL ? 0 : 8,
                        marginLeft: isRTL ? 8 : 0,
                        transform: [{ scaleX: isRTL ? -1 : 1 }],
                      }}
                    />
                    <Text style={[styles.answer, { color: colors.primary, textAlign: isRTL ? "right" : "left" }]}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}

=            <View style={[styles.card, { backgroundColor: colors.cardBg, marginTop: hp("2%") }]}>
              <Text style={[styles.formTitle, { color: colors.primary, textAlign: isRTL ? "right" : "left" }]}>
                {t("contactSupport") || "Contact Support"}
              </Text>

              <LabeledInput
                label={t("name") || "Name"}
                value={name}
                onChangeText={setName}
                placeholder={t("enterName") || "Your name"}
                isRTL={isRTL}
                colors={colors}
              />
              <LabeledInput
                label={t("email") || "Email"}
                value={email}
                onChangeText={setEmail}
                placeholder={t("enterEmail") || "you@example.com"}
                keyboardType="email-address"
                autoCapitalize="none"
                isRTL={isRTL}
                colors={colors}
              />
              <LabeledInput
                label={t("subject") || "Subject"}
                value={subject}
                onChangeText={setSubject}
                placeholder={t("enterSubject") || "Subject"}
                isRTL={isRTL}
                colors={colors}
              />
              <LabeledInput
                label={t("message") || "Message"}
                value={message}
                onChangeText={setMessage}
                placeholder={t("enterMessage") || "Describe your issue or claim"}
                isRTL={isRTL}
                colors={colors}
                multiline
                numberOfLines={5}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.9}
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.buttonBg, opacity: submitting ? 0.7 : 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
                ]}
                disabled={submitting}
              >
                <Ionicons name={submitting ? "sync" : "send"} size={18} color={colors.buttonText} style={{ marginRight: 8 }} />
                <Text style={[styles.submitText, { color: colors.buttonText }]}>
                  {submitting ? (t("submitting") || "Submitting...") : (t("submit") || "Submit")}
                </Text>
              </TouchableOpacity>

              {sentOK === true && (
                <Text style={{ marginTop: 6, color: colors.success, textAlign: isRTL ? "right" : "left" }}>
                  {t("ticketSent") || "Your ticket has been sent. We’ll get back to you shortly."}
                </Text>
              )}
              {sentOK === false && (
                <Text style={{ marginTop: 6, color: colors.error, textAlign: isRTL ? "right" : "left" }}>
                  {t("ticketFailed") || "Couldn’t send the ticket. Please try again."}
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: colors.navBg,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")} activeOpacity={0.8}>
            <Ionicons name="help-circle-outline" size={wp("10%")} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goHome}
            activeOpacity={0.9}
            style={styles.homeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
          >
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

function LabeledInput(props: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  isRTL: boolean;
  colors: {
    inputBg: string;
    inputText: string;
    inputBorder: string;
    placeholder: string;
    primary: string;
  };
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const {
    label, value, onChangeText, placeholder,
    isRTL, colors, multiline, numberOfLines, keyboardType, autoCapitalize
  } = props;
  return (
    <View style={{ marginBottom: hp("1%") }}>
      <Text style={{ marginBottom: 6, color: colors.primary, fontFamily: "Inter_500Medium", textAlign: isRTL ? "right" : "left" }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlign={isRTL ? "right" : "left"}
        style={{
          backgroundColor: colors.inputBg,
          color: colors.inputText,
          borderColor: colors.inputBorder,
          borderWidth: 1,
          borderRadius: 10,
          paddingVertical: hp("1.2%"),
          paddingHorizontal: wp("3%"),
          minHeight: multiline ? hp("12%") : undefined,
          fontFamily: "Inter_400Regular",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%" , height: "100%" },
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
  formTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    marginBottom: hp("1.5%"),
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: hp("1.6%"),
    marginTop: hp("0.5%"),
  },
  submitText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
