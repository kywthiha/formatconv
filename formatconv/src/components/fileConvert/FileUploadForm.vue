<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import LoginHeaderForm from "../auth/LoginHeaderForm.vue";
import FileUploadManager from "./FileUploadManager.vue";
</script>
<template>
  <div>
    <login-header-form></login-header-form>
    <FileUploadManager />
  </div>
</template>
