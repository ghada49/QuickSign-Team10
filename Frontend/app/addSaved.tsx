import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE } from "../lib/api";
import { authFetch } from "../lib/authFetch";
import { ThemeContext } from "../theme";

const bg = require("../assets/images/background2.png");
const darkBg = require("../assets/images/darkmodebg.png");

export default function AddSavedPhraseScreen() {
  const [text, setText] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [photoBase64, setPhotoBase64] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { darkMode } = useContext(ThemeContext);

  const takePhoto = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (cam.status !== "granted") {
      Alert.alert(t("permNeededTitle"), t("permCameraMsg"));
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if ("assets" in res && !res.canceled && res.assets.length > 0) {
      setPhotoUri(res.assets[0].uri);
      setPhotoBase64(res.assets[0].base64 ?? undefined);
    }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert(t("permNeededTitle"), t("permGalleryMsg"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if ("assets" in res && !res.canceled && res.assets.length > 0) {
      setPhotoUri(res.assets[0].uri);
      setPhotoBase64(res.assets[0].base64 ?? undefined);
    }
  };

  const clearPhoto = () => {
    setPhotoUri(undefined);
    setPhotoBase64(undefined);
  };

  const addPhrase = async (textValue: string, imageBase64?: string) => {
    const payload: { text: string; image?: string } = { text: textValue };
    if (imageBase64) payload.image = `data:image/jpeg;base64,${imageBase64}`;

    const res = await authFetch(`${API_BASE}/addsaved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const save = async () => {
    if (!text.trim() && !photoUri) {
      Alert.alert(t("missingContentTitle"), t("missingContentMsgSaved"));
      return;
    }
    try {
      setSaving(true);
      await addPhrase(text.trim(), photoBase64);
      router.back();
    } catch (e) {
      Alert.alert(t("errorTitle"), t("saveErrorMsg"));
    } finally {
      setSaving(false);
    }
  };

  const saveDisabled = saving || (!text.trim() && !photoUri);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={darkMode ? darkBg : bg}
        style={styles.bg}
        imageStyle={[styles.bgImage, { opacity: darkMode ? 1 : 0.9 }]}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={28} color="#3C55ED" />
          </TouchableOpacity>

          <View style={styles.body}>
            <Text style={[styles.title, { color: darkMode ? "#F5F5F5" : "#2C2C88" }]}>
              {t("addSavedPhraseTitle")}
            </Text>

            <TextInput
              placeholder={t("savedPhrasePlaceholder")}
              placeholderTextColor={darkMode ? "#94a3b8" : "#cbd5e1"}
              value={text}
              onChangeText={setText}
              style={[
                styles.input,
                {
                  backgroundColor: darkMode ? "rgba(22,23,26,0.96)" : "rgba(255,255,255,0.92)",
                  color: darkMode ? "#F5F5F5" : "#0f172a",
                  textAlign: isRTL ? "right" : "left",
                  writingDirection: isRTL ? "rtl" : "ltr",
                },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={takePhoto}
                style={[
                  styles.blockBtn,
                  { backgroundColor: darkMode ? "#23262B" : "rgba(255,255,255,0.9)" },
                ]}
              >
                <Ionicons name="camera-outline" size={18} color={darkMode ? "#F5F5F5" : "#0f172a"} />
                <Text style={[styles.blockBtnText, { color: darkMode ? "#F5F5F5" : "#0f172a" }]}>
                  {t("takePhoto")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickPhoto}
                style={[
                  styles.blockBtn,
                  { backgroundColor: darkMode ? "#23262B" : "rgba(255,255,255,0.9)" },
                ]}
              >
                <Ionicons name="image-outline" size={18} color={darkMode ? "#F5F5F5" : "#0f172a"} />
                <Text style={[styles.blockBtnText, { color: darkMode ? "#F5F5F5" : "#0f172a" }]}>
                  {t("choosePhoto")}
                </Text>
              </TouchableOpacity>
            </View>

            {photoUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <TouchableOpacity
                  onPress={clearPhoto}
                  style={[
                    styles.clearBtn,
                    {
                      backgroundColor: darkMode ? "rgba(35,38,43,0.95)" : "rgba(255,255,255,0.95)",
                      borderColor: darkMode ? "#3a3a40" : "#e2e8f0",
                    },
                  ]}
                >
                  <Ionicons name="close" size={18} color={darkMode ? "#F5F5F5" : "#0f172a"} />
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={save}
              disabled={saveDisabled}
              style={[
                styles.saveBtn,
                darkMode && { backgroundColor: "#3A3A8A" },
                saveDisabled && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.saveText}>
                {saving ? t("saving") : t("savePhrase")}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bg: { flex: 1, width: "100%", height: "100%" },
  bgImage: { opacity: 0.9 },
  safe: { flex: 1, backgroundColor: "transparent" },

  backBtn: { position: "absolute", top: 8, left: 16, zIndex: 10, padding: 6 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 60, gap: 14 },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#2C2C88",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  blockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  blockBtnText: { color: "#0f172a", fontWeight: "600" },

  previewWrap: { alignItems: "center", gap: 8, marginTop: 4 },
  preview: { width: 160, height: 160, borderRadius: 12 },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  saveBtn: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#2f49ff",
    alignItems: "center",
    marginTop: 6,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
