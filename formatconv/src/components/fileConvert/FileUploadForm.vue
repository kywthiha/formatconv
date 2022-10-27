<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import { onBeforeMount } from "vue";
import { useStore } from "vuex";
import LoginHeaderForm from "../auth/LoginHeaderForm.vue";
import FileUploadManager from "./FileUploadManager.vue";

const store = useStore();
onBeforeMount(() => {
  store.dispatch("fileUploadManager/setUploadStatus", false);
  store.dispatch("fileUploadManager/setFileItems", []);
});
</script>
<template>
  <div>
    <login-header-form></login-header-form>
    <FileUploadManager />
  </div>
</template>
