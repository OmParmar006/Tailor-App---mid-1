import React from 'react';
import { TouchableOpacity, Animated, Text, View, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle = () => {
  const { isEnglish, toggleLanguage, toggleAnim } = useLanguage();

  return (
    <TouchableOpacity 
      style={styles.languageToggle}
      onPress={toggleLanguage}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.languageSlider,
        {
          left: toggleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 38]
          })
        }
      ]} />
      <View style={styles.languageLabels}>
        <Text style={[
          styles.languageOption,
          isEnglish && styles.languageOptionActive
        ]}>
          EN
        </Text>
        <Text style={[
          styles.languageOption,
          !isEnglish && styles.languageOptionActive
        ]}>
          ગુ
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  languageToggle: {
    position: 'relative',
    width: 80,
    height: 40,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageSlider: {
    position: 'absolute',
    width: 38,
    height: 34,
    backgroundColor: "#3B82F6",
    borderRadius: 17,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  languageLabels: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  languageOption: {
    width: 36,
    textAlign: 'center',
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    zIndex: 10,
  },
  languageOptionActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});