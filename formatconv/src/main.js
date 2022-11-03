import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/main.css";
import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/screen-item.css";
import messages from "@intlify/unplugin-vue-i18n/messages";
import headerDisplay from "./components/layout/headerDisplay.vue";
import bodyDisplay from "./components/layout/bodyDisplay.vue";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "jp",
  fallbackLocale: "en",
  availableLocales: ["en", "jp"],
  messages: messages,
});

const app = createApp(App);
app.use(store);
app.use(router);
app.use(i18n);
app.mount("#app");
app.component("header-display", headerDisplay);
app.component("body-display", bodyDisplay);
import "bootstrap/dist/js/bootstrap.js";

export default i18n;
