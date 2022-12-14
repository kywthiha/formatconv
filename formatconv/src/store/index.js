import { createStore } from "vuex";
import authModule from "./auth/index";
import settingsModule from "./settings/index";
import fileUploadManager from "./file-upload-manager";

export default createStore({
  state() {
    return {
      isLoading: false,
    };
  },
  mutations: {
    setIsLoading(state, payload) {
      state.isLoading = payload;
    },
  },
  actions: {
    setIsLoading(context, payload) {
      context.commit("setIsLoading", payload);
    },
  },
  modules: {
    authModule,
    settingsModule,
    fileUploadManager,
  },
  getters: {
    getIsLoading(state) {
      return state.isLoading;
    },
  },
});
