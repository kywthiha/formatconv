<!--
    クラス名 :  fileItem
    概要 : アップロードファイル処理
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script setup>
import { reactive, ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { humanFileSize } from "../../utils/fileUtils";

const store = useStore();
const props = defineProps(["item"]);
const error_message = ref(null);
const progress = reactive({
  loaded: {
    size: 0,
    unit: "KB",
  },
  speed: {
    size: 0,
    unit: "KB",
  },
  percentage: 0,
});

const { unit, size } = humanFileSize(props.item.file.size);

// ファイルをS3にアップロードする処理
const uploadToS3 = async () => {
  progress.value = 0;
  const started_at = new Date();
  // アップロード進捗対応
  const handlPprogress = (e) => {
    if (
      e.currentTarget &&
      e.currentTarget.readyState == 4 &&
      e.currentTarget.status != 200
    ) {
      try {
        const parser = new DOMParser();
        const response = parser.parseFromString(
          e.currentTarget.responseText,
          "text/xml"
        );
        if (
          response &&
          response.getElementsByTagName("Message") &&
          response.getElementsByTagName("Message")[0]
        ) {
          const message =
            response.getElementsByTagName("Message")[0].textContent;
          error_message.value = message;
        } else {
          error_message.value = e.currentTarget.responseText;
        }
      } catch (error) {
        error_message.value = error.message;
      }
    }
    if (e.lengthComputable) {
      const seconds_elapsed =
        (new Date().getTime() - started_at.getTime()) / 1000;
      // アップロード進捗計算
      const percentage = Math.round((e.loaded / e.total) * 100);
      progress.loaded = humanFileSize(e.loaded);
      progress.speed = humanFileSize(
        seconds_elapsed ? e.loaded / seconds_elapsed : 0
      );
      progress.percentage = percentage;
    }
    if (e.type == "load") {
      // アップロード完了
      setTimeout(() => {
        store.dispatch("fileUploadManager/updateFileItems", {
          id: props.item.file.name,
          data: {
            uploaded: true,
          },
        });
      }, 500);
    }
  };
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", handlPprogress, false);
  xhr.addEventListener("load", handlPprogress, false);
  xhr.addEventListener("error", handlPprogress, false);
  xhr.addEventListener("abort", handlPprogress, false);
  xhr.open("PUT", props.item.upload_url);
  xhr.setRequestHeader("Content-Type", props.item.file.type);
  xhr.send(props.item.file);
};

// S3署名付きURLがあるか確認処理
watch(
  () => props.item.upload_url,
  async () => {
    if (props.item.file && props.item.upload_url && !props.item.uploaded) {
      // ファイルをS3にアップロードする処理
      await uploadToS3();
    }
  }
);

// 「削除」ボタン表示対応
const uploadStatus = computed(
  () => store.state.fileUploadManager.upload_status
);

const deleteFileItem = () =>
  store.dispatch("fileUploadManager/deleteFileItem", props.item);
</script>
<template>
  <div class="file-item card">
    <div class="alert-container">
      <div class="alert alert-danger" role="alert" v-if="error_message">
        {{ error_message }}
      </div>
    </div>
    <div class="row justify-content-between">
      <div class="row col">
        <div class="col align-self-center">
          <div class="fw-bold">
            <!-- フォルダ名 -->
            {{ $t("screenItemProperties.fileUpload.fileName") }}
          </div>
          <div>{{ item.file.name }}</div>
        </div>
        <div class="col align-self-center">
          <div class="fw-bold">
            <!-- サイズ -->
            {{ $t("screenItemProperties.fileUpload.fileSize") }}（{{ unit }}）
          </div>
          <div>{{ size }}</div>
        </div>
      </div>
      <div class="col-auto align-self-center">
        <button class="btn-upload" v-if="item.upload_url && !item.uploaded">
          {{ progress.percentage }}%
        </button>
        <div v-else-if="item.download_url" class="download-action">
          <a
            class="btn-upload btn-download-link"
            :href="item.download_url"
            download
            target="_blank"
          >
            <!-- ダウンロード -->
            {{ $t("screenItemProperties.fileUpload.download") }}</a
          >
        </div>
        <div
          class="spinner-border text-primary"
          role="status"
          v-else-if="uploadStatus"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        <div
          class="spinner-border text-secondary"
          role="status"
          v-else-if="item.uploaded"
        >
          <span class="visually-hidden">Loading...</span>
        </div>

        <button class="btn btn-danger" v-else @click="deleteFileItem">
          <!-- 削除 -->
          {{ $t("screenItemProperties.fileUpload.delete") }}
        </button>
      </div>
    </div>
    <template v-if="item.upload_url && !item.uploaded">
      <div class="progress mt-2 mb-1" style="height: 2px">
        <div
          class="progress-bar"
          role="progressbar"
          aria-label="Example with label"
          :style="{ width: `${progress.percentage}%` }"
          :aria-valuenow="progress.percentage"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <div class="row justify-content-between">
        <div class="col-auto">
          {{ progress.loaded.size }}{{ progress.loaded.unit }} / {{ size
          }}{{ unit }}
        </div>
        <div class="col-auto">
          {{ progress.speed.size }}{{ progress.speed.unit }}/s
        </div>
      </div>
    </template>
  </div>
</template>
<style scoped></style>
