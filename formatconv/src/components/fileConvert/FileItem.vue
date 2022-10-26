<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import { onMounted, reactive, ref } from "vue";
const props = defineProps(["item"]);
const error_message = ref(null);
const progress = reactive({
  loaded: {
    fileSize: 0,
    fileUnit: "KB",
  },
  speed: {
    fileSize: 0,
    fileUnit: "KB",
  },
  percentage: 0,
});
const complete = ref(false);

const humanFileSize = (size) => {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return {
    fileSize: (size / Math.pow(1024, i)).toLocaleString(),
    fileUnit: ["B", "KB", "MB", "GB", "TB"][i],
  };
};

const { fileUnit, fileSize } = humanFileSize(props.item.file.size);

const uploadToS3 = async () => {
  progress.value = 0;
  const started_at = new Date();
  const handlPprogress = (e) => {
    console.log(e);
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
        console.log(response);
        const code = response.getElementsByTagName("Code")[0].textContent;
        const message = response.getElementsByTagName("Message")[0].textContent;
        error_message.value = message;
        console.log(code, message);
        console.log(response.getElementsByTagName("Code")[0].textContent);
        console.log(response.getElementsByTagName("Message")[0].textContent);
      } catch (error) {
        error_message.value = error.message;
        console.log(e.currentTarget.responseText);
      }
    }
    if (e.lengthComputable) {
      const seconds_elapsed =
        (new Date().getTime() - started_at.getTime()) / 1000;
      const percentage = Math.round((e.loaded / e.total) * 90) + 10;
      progress.loaded = humanFileSize(e.loaded);
      progress.speed = humanFileSize(
        seconds_elapsed ? e.loaded / seconds_elapsed : 0
      );
      progress.percentage = percentage;
    }
    if (e.type == "load") {
      complete.value = true;
      console.log("Upload Complete");
    }
  };
  console.log("Start Upload");
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", handlPprogress, false);
  xhr.addEventListener("load", handlPprogress, false);
  xhr.addEventListener("error", handlPprogress, false);
  xhr.addEventListener("abort", handlPprogress, false);
  xhr.open("PUT", props.item.upload_url);
  xhr.setRequestHeader("Content-Type", props.item.file.type);
  xhr.send(props.item.file);
};

onMounted(async () => {
  if (props.item.file && props.item.upload_url && !complete.value) {
    await uploadToS3();
  }
});
</script>
<template>
  <div class="file-item">
    <div class="alert alert-danger" role="alert" v-if="error_message">
      {{ error_message }}
    </div>
    <div class="row justify-content-between">
      <div class="col align-self-center">
        <div class="fw-bold">フォルダ名</div>
        <div>{{ item.file.name }}</div>
      </div>
      <div class="col align-self-center">
        <div class="fw-bold">サイズ（{{ fileUnit }}）</div>
        <div>{{ fileSize }}</div>
      </div>
      <div class="col-auto align-self-center">
        <button class="btn-upload" v-if="item.upload_url && !complete">
          {{ progress.percentage }}%
        </button>
        <button class="btn-upload btn-complete" v-else-if="complete">
          完了
        </button>
        <button class="btn-upload" v-else>スタート</button>
      </div>
    </div>
    <template v-if="item.upload_url && !complete">
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
          {{ progress.loaded.fileSize }}{{ progress.loaded.fileUnit }} /
          {{ fileSize }}{{ fileUnit }}
        </div>
        <div class="col-auto">
          {{ progress.speed.fileSize }}{{ progress.speed.fileUnit }}/s
        </div>
      </div>
    </template>
  </div>
</template>
<style>
.file-item {
  border: 1px solid #787878;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.file-item .btn-complete {
  background-color: #2097f3 !important;
}

.file-item .btn-upload {
  border: none;
  outline: none;
  width: 7rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.375rem 0.75rem;
  display: inline-block;
  background-color: #8cc34a;
  color: #ffffff;
}
</style>
