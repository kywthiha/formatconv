import mutations from "./mutations.js";
import actions from "./actions.js";
import getters from "./getters.js";

export default {
  namespaced: true,
  state() {
    return {
      connection_id: null,
      upload_status: false,
      fileItems: [],
    };
  },
  mutations,
  actions,
  getters,
};
