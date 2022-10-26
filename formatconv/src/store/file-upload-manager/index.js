import mutations from "./mutations.js";
import actions from "./actions.js";
import getters from "./getters.js";

export default {
  namespaced: true,
  state() {
    return {
      connection_id: null,
      upload_status: false,
      fileItems: [
        // {
        //   file: {
        //     lastModified: 1666235297809,
        //     lastModifiedDate: "2022-10-20T03:08:17.809Z",
        //     name: "Archive.zip",
        //     size: 1313466,
        //     type: "application/zip",
        //   },
        //   // upload_url: true,
        // },
        // {
        //   file: {
        //     lastModified: 1666235310818,
        //     lastModifiedDate: "2022-10-20T03:08:30.818Z",
        //     name: "Archive 2.zip",
        //     size: 1778705,
        //     type: "application/zip",
        //   },
        //   // upload_url: true,
        // },
      ],
    };
  },
  mutations,
  actions,
  getters,
};
