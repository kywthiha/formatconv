import { getToken } from "../../components/common/common";

export default {
  // 画面に表示するZipリスト設定
  addFileItems(context, payload) {
    context.commit("addFileItems", payload);
  },
  // ファイルリスト設定
  setFileItems(context, payload) {
    context.commit("setFileItems", payload);
  },
  // 削除ボタン対応
  deleteFileItem(context, payload) {
    context.commit("deleteFileItem", payload);
  },
  // ダウンロードURL設定
  updateFileItems(context, payload) {
    context.commit("updateFileItems", payload);
  },
  // クライアントID設定
  setConnectionId(context, payload) {
    context.commit("setConnectionId", payload);
  },
  // アップロードボタン表示対応
  setUploadStatus(context, payload) {
    context.commit("setUploadStatus", payload);
  },

  // アップロード用S3署名付きURL発行処理
  async requestUploadUrl({ commit, getters }) {
    try {
      // トークンを取得する
      const token = await getToken();
      // アップロード用S3署名付きURL発行APIを呼び出す
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
        // S3署名付きURL更新
        const fileItemsUploadUrl = getters.getfileItems.map((fileItem) => {
          return {
            ...fileItem,
            ...data.find((i) => i.file_name == fileItem.file.name),
          };
        });
        // クライアントID設定
        commit("setConnectionId", connection_id);
        // S3署名付きURL設定
        commit("setFileItems", fileItemsUploadUrl);
      } else {
        // アップロードボタン非表示
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
