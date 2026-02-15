import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import i18n, { changeLanguage } from "../i18n";

export default function LanguageToggle({ onChange }) {
  const switchLanguage = async (lang) => {
    await changeLanguage(lang);
    onChange();
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.segment, i18n.locale === "en" && styles.activeSegment]}
        onPress={() => switchLanguage("en")}
      >
        <Text style={[styles.text, i18n.locale === "en" && styles.activeText]}>
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.segment, i18n.locale === "gu" && styles.activeSegment]}
        onPress={() => switchLanguage("gu")}
      >
        <Text style={[styles.text, i18n.locale === "gu" && styles.activeText]}>
          ગુ
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 4,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  activeSegment: {
    backgroundColor: "#0F172A",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeText: {
    color: "#FFFFFF",
  },
});
