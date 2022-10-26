import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/main.css";
import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/screen-item.css";
import messages from "@intlify/unplugin-vue-i18n/messages";
import HeaderDisplay from "./components/layout/HeaderDisplay.vue";
import BodyDisplay from "./components/layout/BodyDisplay.vue";

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
app.component("header-display", HeaderDisplay);
app.component("body-display", BodyDisplay);
import "bootstrap/dist/js/bootstrap.js";
