import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import enUs from "element-plus/es/locale/lang/en";
import ElementPlus from "element-plus";
import { createPinia } from "pinia";
import i18n from "./locales";
const pinia = createPinia();
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus, {
  locale: i18n.global.locale.value === "en-US" ? enUs : zhCn,
});
app.use(pinia);
app.use(i18n);
app.use(router).mount("#app");
