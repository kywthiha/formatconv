<!--
    クラス名 : fileList
    概要 : アップロードするファイルリスト処理
    作成者 : GICM_KTH
    作成日 : 2022/10/17　 
-->
<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import FileItem from "./fileItem.vue";

const store = useStore();

// ファイルリスト表示
const fileItems = computed(
  () => store.getters["fileUploadManager/getfileItems"]
);
</script>
<template>
  <div class="file-list-container card" v-if="fileItems.length">
    <div class="file-list">
      <!-- ドラッグ・ドロップしたファイルを表示するエリア -->
      <FileItem
        v-for="fileItem in fileItems"
        :key="fileItem.file.name"
        :item="fileItem"
      />
    </div>
  </div>
  <div v-else class="empty-file-list">
    <h6 class="text-center">
       <!-- フォルダー設定なし -->
      {{ $t("screenItemProperties.fileUpload.emptyFileTitle") }}
    </h6>
    <p class="text-center">
       <!-- 変換データのフォルダーがまだ選択されていません。 -->
      {{ $t("screenItemProperties.fileUpload.emptyFileBody") }}
    </p>
  </div>
</template>
<style scoped></style>
