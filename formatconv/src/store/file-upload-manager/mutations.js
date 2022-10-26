export default {
  addFileItems(state, payload) {
    const newFileItems = payload.filter(
      (fileItem) =>
        !state.fileItems.some(({ file }) => file.name == fileItem.file.name)
    );
    state.fileItems = state.fileItems.concat(newFileItems);
  },
  setFileItems(state, payload) {
    state.fileItems = [...payload];
  },
  updateFileItems(state, payload) {
    state.fileItems = state.fileItems.map((fileItem) => {
      if (fileItem.file.name === payload.id) {
        return Object.assign({}, fileItem, payload.data);
      }
      return fileItem;
    });
  },
  deleteFileItem(state, payload) {
    state.fileItems = state.fileItems.filter((fileItem) => fileItem != payload);
  },
  setConnectionId(state, payload) {
    state.connection_id = payload;
  },
  setUploadStatus(state, payload) {
    state.upload_status = payload;
  },
};
