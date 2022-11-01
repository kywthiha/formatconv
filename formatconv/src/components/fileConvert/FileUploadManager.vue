<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_KTH
    作成日 : 2022/10/17　 
-->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import FileDropZone from "./FileDropZone.vue";
import FileList from "./FileList.vue";
const store = useStore();
const { t } = useI18n();
const handleUpload = () => {
  store.dispatch("fileUploadManager/setUploadStatus", true);
  store.dispatch("fileUploadManager/requestUploadUrl");
};

const processStatus = computed(
  () => store.getters["fileUploadManager/getProcessStatus"]
);

const fileItemsCount = computed(
  () => store.getters["fileUploadManager/getfileItemsCount"]
);

const uploadStatus = computed(
  () => store.state.fileUploadManager.upload_status
);

const handleGotoUpload = () => {
  const ans = window.confirm(
    t("screenItemProperties.fileUpload.goToUploadConfirm")
  );
  if (ans) {
    store.dispatch("fileUploadManager/setUploadStatus", false);
    store.dispatch("fileUploadManager/setFileItems", []);
  }
};
</script>
<template>
  <div class="file-upload-manager">
    <FileDropZone class="file-drop-zone" v-if="!uploadStatus" />
    <button
      v-else-if="processStatus"
      class="btn btn-danger go-to-upload"
      @click="handleGotoUpload"
    >
      {{ $t("screenItemProperties.fileUpload.goToUpload") }}
    </button>
    <FileList class="file-list" />
    <div class="file-action-group" v-if="!uploadStatus">
      <button
        class="btn btn-primary col-auto btn-upload"
        @click="handleUpload"
        :disabled="uploadStatus || !fileItemsCount"
      >
        {{ $t("screenItemProperties.button.uploadBtn") }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.file-list {
  margin-bottom: 1rem;
}
.file-drop-zone {
  margin-bottom: 1rem;
}
.file-upload-manager {
  margin: 1rem;
  min-height: 50vh;
}
.file-action-group {
  display: flex;
  justify-content: flex-end;
}
.go-to-upload {
  margin-bottom: 1rem;
}
.btn-upload {
  background-color: #6c8bc5 !important;
}
</style>
