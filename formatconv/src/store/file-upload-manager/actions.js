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
  async requestUploadUrl({ dispatch, commit, getters, rootState }) {
    try {
      const response = await fetch(
        "https://wdduz75b1m.execute-api.us-east-1.amazonaws.com/test/presigned-url-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: rootState.authModule.idToken,
          },
          body: JSON.stringify({
            service_name: import.meta.env.VITE_SERVICE_NAME,
            file_names: getters.getfileItems.map(({ file }) => file.name),
          }),
        }
      );
      const { data, connection_id } = await response.json();
      if (response.ok) {
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
        console.log(data);
        if (data && data.message) {
          alert(data.message);
        } else {
          alert(data);
        }
      }
    } catch (e) {
      console.log(e);
      alert(e);
    }
  },
};
