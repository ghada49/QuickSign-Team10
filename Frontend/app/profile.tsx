import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from "aws-amplify/auth";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { api, ApiError } from "../lib/api";
import { ThemeContext } from "../theme";

const background = require("../assets/images/background2.png");
const darkBg     = require("../assets/images/darkmodebg.png");

type Profile = {
  name: string;
  email: string;
  gender: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const C = darkMode
    ? { title:"#F5F5F5", avatarBg:"#22232A", inputBg:"#23262B", inputText:"#F5F5F5", nav:"#22232A", placeholder:"#94a3b8" }
    : { title:"#2C2C88", avatarBg:"#E3E6F3", inputBg:"#B7C5F7", inputText:"#23262B", nav:"#4D3CE0", placeholder:"#777" };

  const [user, setUser] = useState<Profile>({ name: "", email: "", gender: "" });

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ name?: string; email?: string; gender?: string }>("/me");
        const u: Profile = {
          name: me.name || "",
          email: me.email || "",
          gender: me.gender || ""
        };
        setUser(u);
        await AsyncStorage.setItem("user", JSON.stringify(u));
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login");
          return;
        }
        const cached = await AsyncStorage.getItem("user");
        if (cached) setUser(JSON.parse(cached) as Profile);
      }
    })();
  }, []);

  return (
    <ImageBackground
      source={darkMode ? darkBg : background}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.full}>
        <Text style={[styles.title, { color: C.title, textAlign: "center" }]}>
          {t("profile")}
        </Text>

        <View style={[styles.avatarCircle, { backgroundColor: C.avatarBg }]}>
          <Ionicons name="person" size={RFPercentage(10)} color="#3C55ED" />
        </View>

        <View style={styles.fields}>
          <Text style={[styles.label, { color: C.title }, isRTL && { textAlign: "right" }]}>{t("fullName")}</Text>
          <TextInput
            value={user.name}
            editable={false}
            style={[
              styles.input,
              { backgroundColor: C.inputBg, color: C.inputText },
              isRTL && { textAlign: "right" },
            ]}
            placeholder={t("fullName")}
            placeholderTextColor={C.placeholder}
          />

          <Text style={[styles.label, { color: C.title }, isRTL && { textAlign: "right" }]}>{t("emailAddress")}</Text>
          <TextInput
            value={user.email}
            editable={false}
            style={[
              styles.input,
              { backgroundColor: C.inputBg, color: C.inputText },
              isRTL && { textAlign: "right" },
            ]}
            placeholder={t("emailAddress")}
            placeholderTextColor={C.placeholder}
          />

          <Text style={[styles.label, { color: C.title }, isRTL && { textAlign: "right" }]}>{t("gender")}</Text>
          <TextInput
            value={user.gender === "male" ? t("male") : user.gender === "female" ? t("female") : ""}
            editable={false}
            style={[
              styles.input,
              { backgroundColor: C.inputBg, color: C.inputText },
              isRTL && { textAlign: "right" },
            ]}
            placeholder={t("gender")}
            placeholderTextColor={C.placeholder}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            try { await signOut(); } catch (e) { console.warn("Sign out error:", e); }
            finally {
              await AsyncStorage.removeItem("user");
              setUser({ name: "", email: "", gender: "" });
              router.replace("/welcome");
            }
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.logoutText}>{t("logout")}</Text>
          <Ionicons name="log-out-outline" size={28} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <View
          style={[
            styles.bottomNav,
            { backgroundColor: C.nav, flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")}>
            <Ionicons name="help-circle-outline" size={wp("10%")} color="#fff" />
          </TouchableOpacity>

          <Pressable style={styles.homeButton} onPress={() => router.push("/home")}>
            <Ionicons name="home" size={wp("7.5%")} color="#4D3CE0" />
          </Pressable>

          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={wp("9%")} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  full: { flex: 1, width: "100%" },
  title: {
    fontSize: RFPercentage(5),
    fontFamily: "Poppins_800ExtraBold",
    marginTop: hp("8%"),
    marginBottom: hp("2%"),
  },
  avatarCircle: {
    backgroundColor: "#E3E6F3",
    borderRadius: 80,
    width: wp("33%"),
    height: wp("33%"),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("1%"),
  },
  fields: { width: "88%", alignSelf: "center", marginTop: hp("1%") },
  label: {
    fontSize: RFPercentage(2.1),
    color: "#2C2C88",
    fontStyle: "italic",
    marginBottom: 2,
    marginTop: hp("1%"),
  },
  input: {
    backgroundColor: "#B7C5F7",
    borderRadius: 12,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    fontSize: RFPercentage(2.3),
    color: "#23262B",
    marginBottom: hp("1.5%"),
    fontStyle: "italic",
  },
  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#3C55ED",
    borderRadius: 10,
    width: "88%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
    marginTop: hp("2%"),
    marginBottom: hp("11%"),
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: RFPercentage(2.7),
    letterSpacing: 0.5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: hp('10%'),
    backgroundColor: '#4D3CE0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: wp('10%'),
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
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
