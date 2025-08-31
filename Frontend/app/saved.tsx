import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert, FlatList, Image, ImageBackground, Modal,
  Platform,
  SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { API_BASE } from "../lib/api";
import { authFetch } from "../lib/authFetch";
import { ThemeContext } from "../theme";

const confirmDelete = (message: string, onConfirm: () => void) => {
  if (Platform.OS === "web") {
    if (window.confirm(message)) {
      onConfirm();
    }
  } else {
    Alert.alert("Delete", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ]);
  }
};

const bg     = require("../assets/images/background2.png");
const darkBg = require("../assets/images/darkmodebg.png");

const imgSize = wp("20%");

type SavedPhrase = { id: string; text?: string; image_url?: string; created?: number };

export default function SavedPhrasesScreen() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<{ text?: string; image?: string } | null>(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const refresh = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/saved_phrases`);
      if (res.status === 401) { router.replace("/login"); return; }
      if (!res.ok) throw new Error(await res.text());
      const list: SavedPhrase[] = await res.json();
      setPhrases(list);
    } catch (e) {
      console.warn("Failed to fetch saved phrases:", e);
      setPhrases([]);
    }
  }, [router]);

  useEffect(() => { refresh(); }, [refresh]);
  useFocusEffect(useCallback(() => { refresh(); return () => {}; }, [refresh]));

  const filtered = phrases.filter((p) => (p.text || "").toLowerCase().includes(search.toLowerCase()));

  const deleteSaved = async (id: string) => {
    try {
      console.log("hello")
      const res = await authFetch(`${API_BASE}/saved_delete/${id}`, { method: "DELETE" });
      console.log("bye")
      if (!res.ok) {
        const errorText = await res.text();
        console.warn("Delete failed:", errorText);
        Alert.alert("Error", `Failed to delete: ${errorText}`);
      } else {
        console.log("Delete successful!");
        Alert.alert("Success", "Phrase deleted successfully!");
      }
    } catch (e) {
      console.error("Delete error:", e);
      Alert.alert("Error", `Delete failed: ${e}`);
    } finally {
      refresh();
    }
  };

  const C = darkMode
    ? {
        title: "#F5F5F5",
        searchBg: "rgba(22,23,26,0.96)",
        searchPh: "#94a3b8",
        card: "#16171A",
        cardText: "#F5F5F5",
        chevron: "#E5E7EB",
        nav: "#111",
        empty: "#A1A1AA",
      }
    : {
        title: "#2C2C88",
        searchBg: "rgba(255,255,255,0.95)",
        searchPh: "#94a3b8",
        card: "#BFC8FF",
        cardText: "#20214A",
        chevron: "#20214A",
        nav: "#4D3CE0",
        empty: "#2C2C88",
      };

  const renderItem = ({ item }: { item: SavedPhrase }) => {
    const hasText = !!(item.text && item.text.trim().length);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, { backgroundColor: C.card }, !hasText && { justifyContent: "center" }]}
        onPress={() => setPreview({ text: item.text?.trim() || undefined, image: item.image_url })}
      >
        {hasText ? (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={{ width: imgSize, height: imgSize, borderRadius: 12 }} />
              ) : (
                <View style={{ width: imgSize, height: imgSize, borderRadius: 12, opacity: 0 }} />
              )}
              <Text
                numberOfLines={1}
                style={[
                  styles.cardText,
                  { textAlign: isRTL ? "right" : "left", flexShrink: 1, color: C.cardText },
                ]}
              >
                {item.text}
              </Text>
            </View>
            <View style={styles.cardActions}>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  console.log("Trash pressed!"); 
                  confirmDelete(
                  item.text ? t("deletePhrase", { phrase: item.text }) : t("deleteImage"),
                  () => deleteSaved(item.id)
                );

                }}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={wp("6%")} color={C.chevron} />
            </View>
          </>
        ) : (
          <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={{ width: imgSize, height: imgSize, borderRadius: 12 }} />
            ) : (
              <Text style={[styles.cardText, { opacity: 0.6, color: C.cardText }]}>(empty)</Text>
            )}
            <TouchableOpacity
              style={[styles.deleteButton, styles.deleteButtonImageOnly]}
              onPress={() => {
              Alert.alert(
                t("delete"),
                t("deleteImage"),
                [
                  { text: t("cancel"), style: "cancel" },
                  { text: t("delete"), style: "destructive", onPress: () => deleteSaved(item.id) },
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
  };

  return (
    <ImageBackground
      source={darkMode ? darkBg : bg}
      style={styles.bg}
      resizeMode="cover"
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.wrapper}>
        <Text style={[styles.title, { color: C.title }]}>{t("savedPhrases")}</Text>

        <View
          style={[
            styles.searchWrap,
            { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: C.searchBg },
          ]}
        >
          <Ionicons name="search" size={20} color="#64748b" style={{ marginHorizontal: 8 }} />
          <TextInput
            placeholder={isRTL ? "ابحث…" : "Search…"}
            placeholderTextColor={C.searchPh}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.searchInput,
              { textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" },
            ]}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item, idx) => item.id || String(idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 26, color: C.empty }}>
              {t("noPhrases")}
            </Text>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/addSaved")}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <View
          style={[
            styles.bottomNav,
            { backgroundColor: C.nav, flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity onPress={() => router.push("/faq")}>
            <Ionicons name="help-circle-outline" size={wp("9%")} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/home")}>
            <Ionicons name="home" size={wp("7%")} color="#4D3CE0" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={wp("9%")} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal visible={!!preview} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalBody}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setPreview(null)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {preview?.image ? (
                  <Image source={{ uri: preview.image }} style={styles.fullImage} resizeMode="contain" />
                ) : null}
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
  bg: { flex: 1, width: "100%", height: "100%" },
  wrapper: { flex: 1 },

  title: {
    fontSize: RFPercentage(3.2),
    fontWeight: "800",
    color: "#2C2C88",
    textAlign: "center",
    marginTop: hp("3%"),
    marginBottom: hp("2%"),
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    marginHorizontal: wp("6%"),
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("2%"),
    marginBottom: hp("1.2%"),
  },
  searchInput: {
    flex: 1,
    fontSize: RFPercentage(2.1),
    paddingVertical: 6,
  },

  list: { paddingHorizontal: wp("6%"), paddingBottom: hp("16%"), gap: hp("1.6%") },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#BFC8FF",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: {
    flex: 1,
    fontSize: RFPercentage(2.2),
    color: "#20214A",
    fontWeight: "700",
    marginHorizontal: wp("2%"),
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonImageOnly: {
    padding: 0,
  },

  fab: {
    position: "absolute",
    right: wp("7%"),
    bottom: hp("12%"),
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    backgroundColor: "#4D3CE0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 2,
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
    zIndex: 1,
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

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)" },
  modalBody: { flex: 1 },
  modalClose: { position: "absolute", right: 16, top: 12, zIndex: 10, padding: 8 },
  modalContent: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingTop: 40, paddingBottom: 24 },
  fullImage: { width: "100%", height: "65%", borderRadius: 12, marginBottom: 16 },
  fullText: { color: "#fff", fontSize: RFPercentage(3), fontWeight: "800", textAlign: "center" },

  debugInfo: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: wp("6%"),
    marginBottom: hp("1.2%"),
    alignItems: "center",
  },
  debugText: {
    color: "#fff",
    fontSize: RFPercentage(1.8),
    textAlign: "center",
  },
  testDeleteButton: {
    backgroundColor: "#ef4444",
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 8,
    marginTop: hp("1%"),
  },
  testDeleteButtonText: {
    color: "#fff",
    fontSize: RFPercentage(2),
    fontWeight: "700",
  },
  testApiButton: {
    backgroundColor: "#4D3CE0",
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 8,
    marginTop: hp("1%"),
  },
  testApiButtonText: {
    color: "#fff",
    fontSize: RFPercentage(2),
    fontWeight: "700",
  },
});
