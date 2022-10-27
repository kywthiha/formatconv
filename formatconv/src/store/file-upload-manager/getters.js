export default {
  getfileItems(state) {
    return state.fileItems;
  },
  getConnectionId(state) {
    return state.connection_id;
  },
  getfileItemsCount(state) {
    return state.fileItems.length;
  },
  getProcessStatus(state) {
    if (state.fileItems.filter((fileItem) => fileItem.upload_url).length == 0)
      return !state.upload_status;
    return (
      state.fileItems.filter((fileItem) => fileItem.download_url).length ==
      state.fileItems.length
    );
  },
};
