<!--
    クラス名 : fileList
    概要 : アップロードするファイルリスト処理
    作成者 : GICM_KTH
    作成日 : 2022/10/17　 
-->
<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import fileItem from "./fileItem.vue";

const store = useStore();

const fileItems = computed(
  () => store.getters["fileUploadManager/getfileItems"]
);
</script>
<template>
  <div class="file-list-container card" v-if="fileItems.length">
    <div class="file-list">
      <!-- ドラッグ と ドロップしたファイルを表示するエリア -->
      <fileItem
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
