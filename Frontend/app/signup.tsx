import { resendSignUpCode, signUp } from "aws-amplify/auth";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

const logo = require("../assets/images/logo13.png");

type Strength = "weak" | "medium" | "strong";
type PasswordRules = { length: boolean; upper: boolean; lower: boolean; number: boolean; special: boolean; };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [awaitingLink, setAwaitingLink] = useState(false);
  const [busy, setBusy] = useState(false);

  const rules: PasswordRules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const strength: Strength = useMemo(() => {
    const score = Object.values(rules).filter(Boolean).length;
    if (score === 5) return "strong";
    if (score >= 3) return "medium";
    return "weak";
  }, [rules]);

  const emailValid = useMemo(() => EMAIL_RE.test(email.trim()), [email]);
  const canSubmit = !awaitingLink && !!fullName.trim() && emailValid && !!gender && strength !== "weak" && !busy;

  const alert = (title: string, msg?: string) =>
    Platform.OS === "web" ? window.alert(msg ? `${title}\n${msg}` : title) : Alert.alert(title, msg);

  const handleSignUp = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !trimmedEmail || !password || !gender) {
      alert(t("pleaseFillAllFields") || "Please fill all fields");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      alert(t("invalidEmail") || "Invalid email address");
      return;
    }
    if (strength === "weak") {
      alert(t("weakPassword") || "Password is too weak");
      return;
    }

    setBusy(true);
    try {
      await signUp({
        username: trimmedEmail,
        password,
        options: { userAttributes: { email: trimmedEmail, name: fullName.trim(), gender: gender! } },
      });
      setAwaitingLink(true);
      alert(
        t("verificationEmailSentTitle") || "Verification email sent",
        (t("verificationEmailSentBody") || `We sent a verification link to ${trimmedEmail}. Open it, confirm, then continue.`)
      );
    } catch (e: any) {
      const code = e?.name || e?.code;
      if (code === "UsernameExistsException") {
        alert(t("emailExists") || "Email already exists");
      } else if (code === "InvalidPasswordException") {
        alert(t("weakPassword") || "Weak password");
      } else if (code === "InvalidParameterException") {
        alert(t("invalidEmail") || "Invalid email or attributes");
      } else {
        alert(t("signupFailed") || "Sign-up failed", e?.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return;
    try {
      await resendSignUpCode({ username: trimmedEmail });
      alert(t("verificationSent") || "Verification email sent", t("checkInbox") || "Please check your inbox.");
    } catch {
      alert(t("resendFailed") || "Could not resend verification email");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{t("signup")}</Text>

        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder={t("fullName") || "Full Name"}
          placeholderTextColor="#ccc"
          value={fullName}
          onChangeText={setFullName}
          editable={!awaitingLink}
          autoCapitalize="words"
          textContentType="name"
        />

        <View style={styles.genderContainer}>
          <Text style={[styles.genderLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("gender")}</Text>
          <View style={styles.genderOptions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: gender === "male" }}
              style={[styles.genderOption, gender === "male" && styles.selectedGender]}
              onPress={() => !awaitingLink && setGender("male")}
            >
              <Text style={[styles.genderText, gender === "male" && styles.selectedGenderText]}>{t("male")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: gender === "female" }}
              style={[styles.genderOption, gender === "female" && styles.selectedGender]}
              onPress={() => !awaitingLink && setGender("female")}
            >
              <Text style={[styles.genderText, gender === "female" && styles.selectedGenderText]}>{t("female")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder={t("email") || "Email"}
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          editable={!awaitingLink}
        />

        <TextInput
          style={[styles.input, { textAlign: isRTL ? "right" : "left" }]}
          placeholder={t("password") || "Password"}
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!awaitingLink}
          textContentType="newPassword"
          onSubmitEditing={handleSignUp}
        />

        {!!password && !awaitingLink && (
          <>
            <View style={{ height: 6, width: "100%", backgroundColor: "#ccc", borderRadius: 3, marginTop: 4 }}>
              <View
                style={{
                  height: "100%",
                  width: strength === "strong" ? "100%" : strength === "medium" ? "66%" : "33%",
                  backgroundColor: strength === "strong" ? "green" : strength === "medium" ? "orange" : "red",
                  borderRadius: 3,
                }}
              />
            </View>

            <View style={{ alignSelf: "flex-start", marginTop: hp("1%"), marginBottom: hp("2%") }}>
              <Text style={{ color: rules.length ? "green" : "red" }}>{rules.length ? "✔" : "✘"} {t("min8Chars")}</Text>
              <Text style={{ color: rules.upper ? "green" : "red" }}>{rules.upper ? "✔" : "✘"} {t("upperCase")}</Text>
              <Text style={{ color: rules.lower ? "green" : "red" }}>{rules.lower ? "✔" : "✘"} {t("lowerCase")}</Text>
              <Text style={{ color: rules.number ? "green" : "red" }}>{rules.number ? "✔" : "✘"} {t("number")}</Text>
              <Text style={{ color: rules.special ? "green" : "red" }}>{rules.special ? "✔" : "✘"} {t("specialChar")}</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, (!canSubmit && !awaitingLink) && { opacity: 0.6 }]}
          onPress={async () => {
            if (awaitingLink) {
              router.push("/login");
            } else {
              await handleSignUp();
            }
          }}
          disabled={!awaitingLink ? !canSubmit : busy}
        >
          <Text style={styles.buttonText}>
            {awaitingLink ? (t("continue") || "Continue") : (busy ? (t("creating") || "Creating…") : (t("createAccount") || "Create Account"))}
          </Text>
        </TouchableOpacity>

        {!awaitingLink ? (
          <Text style={styles.text}>
            {t("alreadyAccount")} <Text style={styles.link} onPress={() => router.push("/login")}>{t("login")}</Text>
          </Text>
        ) : (
          <>
            <Text style={styles.text}>
              {t("verificationEmailSentBody") || `We sent a verification link to ${email.trim().toLowerCase()}. Tap it to confirm your account, then press Continue.`}
            </Text>
            <Text style={styles.link} onPress={handleResend}>{t("resendVerificationEmail") || "Resend verification email"}</Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: wp("8%"),
    paddingVertical: hp("4%"),
    backgroundColor: "white",
  },
  logo: { width: wp("95%"), height: hp("30%"), marginBottom: hp("3%"), marginTop: hp("2%") },
  title: { fontSize: RFPercentage(4), color: "#4D3CE0", fontWeight: "bold", width: "100%", textAlign: "center", marginBottom: hp("2%") },
  input: {
    width: "100%",
    backgroundColor: "#4D3CE0",
    borderRadius: wp("2%"),
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
    color: "white",
    fontSize: RFPercentage(2.2),
  },
  genderContainer: { width: "100%", marginBottom: hp("2%") },
  genderLabel: { fontWeight: "bold", fontSize: RFPercentage(2.2), marginBottom: hp("1%"), color: "#4D3CE0" },
  genderOptions: { flexDirection: "row", justifyContent: "space-between" },
  genderOption: { flex: 1, backgroundColor: "#E0E0E0", borderRadius: wp("2%"), paddingVertical: hp("1.5%"), alignItems: "center", marginRight: wp("2%") },
  selectedGender: { backgroundColor: "#4D3CE0" },
  genderText: { color: "#000", fontWeight: "bold", fontSize: RFPercentage(2) },
  selectedGenderText: { color: "#fff" },
  button: { backgroundColor: "#4D3CE0", borderRadius: wp("3%"), paddingVertical: hp("2%"), paddingHorizontal: wp("20%"), marginBottom: hp("3%"), alignItems: "center", width: "100%", elevation: 4 },
  buttonText: { fontSize: RFPercentage(2.5), fontWeight: "bold", color: "#fff" },
  text: { fontSize: RFPercentage(2), marginTop: hp("2%") },
  link: { color: "#4D3CE0", fontWeight: "bold", fontSize: RFPercentage(2) },
});
