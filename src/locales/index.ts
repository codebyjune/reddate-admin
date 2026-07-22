import { createI18n } from "vue-i18n";
import zhCN from "./zh-CN";
import enUS from "./en-US";

const storedLocale = localStorage.getItem("locale") || "en-US";

const i18n = createI18n({
  legacy: false,
  locale: storedLocale,
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

export default i18n;
