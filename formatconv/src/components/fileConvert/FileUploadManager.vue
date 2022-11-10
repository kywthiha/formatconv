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

// ファイルアップロード処理
const handleUpload = async () => {
  try{
    errorMessage.value = null;
    // 「アップロード」ボタン削除
    store.dispatch("fileUploadManager/setUploadStatus", true);
    // アップロード用S3署名付きURL発行処理
    await store.dispatch("fileUploadManager/requestUploadUrl");
  }catch(e){
    // バケットが作成できませんでした。
    errorMessage.value = t("errorMessages.E0009");
  }
};

// 「アップロードへ」ボタン表示対応
const processStatus = computed(
  () => store.getters["fileUploadManager/getProcessStatus"]
);

// 「アップロード」ボタン表示対応
const fileItemsCount = computed(
  () => store.getters["fileUploadManager/getfileItemsCount"]
);

// ファイルドロップエリアを削除対応
const uploadStatus = computed(
  () => store.state.fileUploadManager.upload_status
);

// 「アップロードへ」ボタン処理
const handleGotoUpload = () => {
  // このページを離れるとアップロードされた内容がなくなりますが、よろしいでしょうか？
  const ans = window.confirm(
    t("successMessages.I0005")
  );
  if (ans) {
    // 「アップロード」ボタン表示
    store.dispatch("fileUploadManager/setUploadStatus", false);
    // ファイルリストを初期化する
    store.dispatch("fileUploadManager/setFileItems", []);
  }
};

// エラーメッセージエリアを隠す
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
     <!-- ファイルドロップ -->
    <fileDropZone class="file-drop-zone" v-if="!uploadStatus" />
    <button v-else-if="processStatus" class="btn btn-danger go-to-upload" @click="handleGotoUpload">
      <!-- アップロードへ -->
      {{ $t("screenItemProperties.fileUpload.goToUpload") }}
    </button>
     <!-- ドラッグ・ドロップしたファイルリストを表示するエリア -->
    <fileList class="file-list" />
    <div class="file-action-group" v-if="!uploadStatus">
      <button class="btn btn-primary col-auto btn-upload" @click="handleUpload"
        :disabled="uploadStatus || !fileItemsCount">
        <!-- アップロード -->
        {{ $t("screenItemProperties.button.uploadBtn") }}
      </button>
    </div>
  </div>
</template>
<style scoped>

</style>
