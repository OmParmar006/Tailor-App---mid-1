import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en";
import gu from "./gu";

const i18n = new I18n({
  en,
  gu,
});

i18n.enableFallback = true;

export const setI18nConfig = async () => {
  try {
    const savedLang = await AsyncStorage.getItem("APP_LANG");

    if (savedLang === "en" || savedLang === "gu") {
      i18n.locale = savedLang;
    } else {
      i18n.locale = "en"; // DEFAULT
    }
  } catch (error) {
    console.log("AsyncStorage error:", error);
    i18n.locale = "en"; // FAILSAFE
  }
};

export const changeLanguage = async (lang) => {
  i18n.locale = lang;
  await AsyncStorage.setItem("APP_LANG", lang);
};

export default i18n;
