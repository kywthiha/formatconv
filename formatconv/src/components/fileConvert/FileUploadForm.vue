<!--
    クラス名 : fileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script setup>
import { onBeforeMount } from "vue";
import { useStore } from "vuex";
import loginHeaderForm from "../auth/loginHeaderForm.vue";
import fileUploadManager from "./fileUploadManager.vue";

const store = useStore();
onBeforeMount(() => {
  store.dispatch("fileUploadManager/setUploadStatus", false);
  store.dispatch("fileUploadManager/setFileItems", []);
});
</script>
<template>
  <div>
    <login-header-form></login-header-form>
    <fileUploadManager />
  </div>
</template>
