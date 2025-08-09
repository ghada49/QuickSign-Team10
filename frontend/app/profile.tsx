import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../theme";
import { useTranslation } from "react-i18next";
import { RFPercentage } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from '@react-native-async-storage/async-storage';

const background = require("../assets/images/background2.png");

export default function ProfileScreen() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [user, setUser] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    gender: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        setUser(JSON.parse(data));
      }
    };
    fetchUser();
  }, []);

  return (
    <ImageBackground source={background} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.full}>
        {/* Top Back Button */}
        <TouchableOpacity style={[styles.backBtn, isRTL && { left: 15, right: undefined }]} onPress={() => router.back()}>
          <Ionicons
            name={isRTL ? "arrow-forward-outline" : "arrow-back-outline"}
            size={28}
            color="#3C55ED"
          />
        </TouchableOpacity>

        {/* Profile Title */}
        <Text style={[
          styles.title,
          { color: "#2C2C88", textAlign: "center" }
        ]}>{t("profile")}</Text>

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={RFPercentage(10)} color="#3C55ED" />
        </View>

        {/* Username Row (with edit icon) */}
        <View style={[styles.usernameRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Ionicons name="create-outline" size={28} color="#3C55ED" />
          <Text style={[styles.username, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
            {user.username}
          </Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fields}>
          {/* Full Name */}
          <Text style={[styles.label, isRTL && { textAlign: "right" }]}>{t("fullName")}</Text>
          <TextInput
            value={user.name}
            editable={false}
            style={[
              styles.input,
              isRTL && { textAlign: "right" }
            ]}
            placeholder={t("fullName")}
            placeholderTextColor="#777"
          />

          {/* Email */}
          <Text style={[styles.label, isRTL && { textAlign: "right" }]}>{t("emailAddress")}</Text>
          <TextInput
            value={user.email}
            editable={false}
            style={[
              styles.input,
              isRTL && { textAlign: "right" }
            ]}
            placeholder={t("emailAddress")}
            placeholderTextColor="#777"
          />

          {/* Gender */}
          <Text style={[styles.label, isRTL && { textAlign: "right" }]}>{t("gender")}</Text>
          <TextInput
            value={user.gender === "male" ? t("male") : user.gender === "female" ? t("female") : ""}
            editable={false}
            style={[
              styles.input,
              isRTL && { textAlign: "right" }
            ]}
            placeholder={t("gender")}
            placeholderTextColor="#777"
          />

          {/* Phone Number */}
          <Text style={[styles.label, isRTL && { textAlign: "right" }]}>{t("phoneNumber")}</Text>
          <TextInput
            value={user.phone}
            editable={false}
            style={[
              styles.input,
              isRTL && { textAlign: "right" }
            ]}
            placeholder={t("phoneNumber")}
            placeholderTextColor="#777"
          />
        </View>

        {/* LOG OUT Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem('user');
            setUser({ username: "", name: "", email: "", phone: "", gender: "" });
            router.push('/login');
          }}
        >
          <Text style={styles.logoutText}>{t("logout")}</Text>
          <Ionicons name="log-out-outline" size={28} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* BOTTOM NAV */}
        <View
          style={[
            styles.bottomNav,
            { backgroundColor: darkMode ? "#111" : "#4D3CE0", flexDirection: "row" },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")}>
            <Ionicons name="help-circle-outline" size={wp("10%")} color="#fff" />
          </TouchableOpacity>
          <View style={styles.homeButton}>
            <Ionicons name="home-outline" size={wp("7.5%")} color="#4D3CE0" />
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={wp("9%")} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%" },
  full: { flex: 1, width: "100%" },
  backBtn: {
    position: "absolute",
    top: hp("5%"),
    left: 15,
    zIndex: 20,
  },
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
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("2.5%"),
  },
  username: {
    fontSize: RFPercentage(2.9),
    fontWeight: "bold",
    color: "#3C55ED",
    letterSpacing: 0.2,
  },
  fields: {
    width: "88%",
    alignSelf: "center",
    marginTop: hp("1%"),
  },
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

