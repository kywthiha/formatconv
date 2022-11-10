<!--
    クラス名 : fileUploadManager
    概要 : 変換ファイルアップロード処理
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import fileDropZone from "./fileDropZone.vue";
import fileList from "./fileList.vue";
const store = useStore();
const { t } = useI18n();
const errorMessage = ref(null)

const handleUpload = async () => {
  try{
    errorMessage.value = null;
    store.dispatch("fileUploadManager/setUploadStatus", true);
    await store.dispatch("fileUploadManager/requestUploadUrl");
  }catch(e){
    errorMessage.value = t("errorMessages.E0021");
  }
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

const hideAlert = ()=>{
  errorMessage.value = null
}
</script>
<template>
  <div class="file-upload-manager">
    <!-- エラーメッセージ表示 -->
    <div class="alert-container" v-if="errorMessage">
      <div class="alert alert-danger alert-dismissible align-items-center fade show" style="text-align: center">
        <label>{{ errorMessage }}</label>
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>
    </div>
    <fileDropZone class="file-drop-zone" v-if="!uploadStatus" />
    <button v-else-if="processStatus" class="btn btn-danger go-to-upload" @click="handleGotoUpload">
      {{ $t("screenItemProperties.fileUpload.goToUpload") }}
    </button>
    <fileList class="file-list" />
    <div class="file-action-group" v-if="!uploadStatus">
      <button class="btn btn-primary col-auto btn-upload" @click="handleUpload"
        :disabled="uploadStatus || !fileItemsCount">
        {{ $t("screenItemProperties.button.uploadBtn") }}
      </button>
    </div>
  </div>
</template>
<style scoped>

</style>
