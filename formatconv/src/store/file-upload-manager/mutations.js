export default {
  // 画面に表示するZipリスト設定
  addFileItems(state, payload) {
    const newFileItems = payload.filter(
      (fileItem) =>
        !state.fileItems.some(({ file }) => file.name == fileItem.file.name)
    );
    state.fileItems = state.fileItems.concat(newFileItems);
  },
  // ファイルリスト設定
  setFileItems(state, payload) {
    state.fileItems = [...payload];
  },
  // ダウンロードURL設定
  updateFileItems(state, payload) {
    state.fileItems = state.fileItems.map((fileItem) => {
      if (fileItem.file.name === payload.id) {
        return Object.assign({}, fileItem, payload.data);
      }
      return fileItem;
    });
  },
  // 削除ボタン対応
  deleteFileItem(state, payload) {
    state.fileItems = state.fileItems.filter((fileItem) => fileItem != payload);
  },
  // クライアントID設定
  setConnectionId(state, payload) {
    state.connection_id = payload;
  },
  // アップロードボタン表示対応
  setUploadStatus(state, payload) {
    state.upload_status = payload;
  },
};
