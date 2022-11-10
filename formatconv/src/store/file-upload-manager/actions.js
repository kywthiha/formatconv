import { getToken } from "../../components/common/common";

export default {
  addFileItems(context, payload) {
    context.commit("addFileItems", payload);
  },
  setFileItems(context, payload) {
    context.commit("setFileItems", payload);
  },
  deleteFileItem(context, payload) {
    context.commit("deleteFileItem", payload);
  },
  updateFileItems(context, payload) {
    context.commit("updateFileItems", payload);
  },
  setConnectionId(context, payload) {
    context.commit("setConnectionId", payload);
  },
  setUploadStatus(context, payload) {
    context.commit("setUploadStatus", payload);
  },
  async requestUploadUrl({ commit, getters }) {
    try {
      // トークンを取得する
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/presign-url-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            service_name: import.meta.env.VITE_SERVICE_NAME,
            file_names: getters.getfileItems.map(({ file }) => file.name),
          }),
        }
      );
      const res = await response.json();
      if (response.ok) {
        const { data, connection_id } = res;
        // update state files list
        const fileItemsUploadUrl = getters.getfileItems.map((fileItem) => {
          return {
            ...fileItem,
            ...data.find((i) => i.file_name == fileItem.file.name),
          };
        });
        commit("setConnectionId", connection_id);
        commit("setFileItems", fileItemsUploadUrl);
      } else {
        commit("setUploadStatus", false);
        if (res && res.message) {
          throw new Error(res.message)
        } else {
          throw new Error(res)
        }
      }
    } catch (e) {
      commit("setUploadStatus", false);
      throw e
    }
  },
};
