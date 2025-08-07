import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";

// Enable layout animation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQ() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: "What does the app do?",
      answer:
        "The app translates Arabic text to Arabic Sign Language (and vice versa) in real time using the device's camera.",
    },
    {
      question: "Does the app support regional sign dialects?",
      answer:
        "Currently, it supports standard Arabic Sign Language. Dialect support is in development.",
    },
    {
      question: "Do I need internet to use the app?",
      answer:
        "Yes, an internet connection is needed for real-time translation.",
    },
  ];

  const toggleItem = (index: number) => {

    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Help & FAQ</Text>

      {/* FAQ Items */}
      {faqData.map((item, index) => (
        <View key={index} style={styles.card}>
          <TouchableOpacity onPress={() => toggleItem(index)}>
            <View style={styles.questionRow}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.arrow}>
                {activeIndex === index ? "˅" : "›"}
              </Text>
            </View>
          </TouchableOpacity>

          {activeIndex === index && (
            <View style={styles.answerBox}>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3C55ED",
    textAlign: "center",
  },
  card: {
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 10,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },
  arrow: {
    fontSize: 20,
    color: "#3C55ED",
  },
  answerBox: {
    backgroundColor: "#3C55ED",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  answer: {
    fontSize: 15,
    color: "#fff",
  },
  backButton: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
});
