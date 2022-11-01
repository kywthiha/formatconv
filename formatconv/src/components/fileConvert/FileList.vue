<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_KTH
    作成日 : 2022/10/17　 
-->
<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import FileItem from "./FileItem.vue";

const store = useStore();

const fileItems = computed(
  () => store.getters["fileUploadManager/getfileItems"]
);
</script>
<template>
  <div class="file-list-container card" v-if="fileItems.length">
    <div class="file-list">
      <!-- ドラッグ と ドロップしたファイルを表示するエリア -->
      <FileItem
        v-for="fileItem in fileItems"
        :key="fileItem.file.name"
        :item="fileItem"
      />
    </div>
  </div>
  <div v-else class="empty-file-list">
    <h6 class="text-center">
      {{ $t("screenItemProperties.fileUpload.emptyFileTitle") }}
    </h6>
    <p class="text-center">
      {{ $t("screenItemProperties.fileUpload.emptyFileBody") }}
    </p>
  </div>
</template>
<style scoped></style>
