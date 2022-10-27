<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { tranformFileItems } from "../../utils/FileUtils";
import { filesToZip } from "../../utils/ZipUtils";

const store = useStore();
const events = ["dragenter", "dragover", "dragleave", "drop"];
const active = ref(false);
const allowImageTypes = ["image/tiff", "image/tif"];
const compressFiles = ref([]);

const setActive = () => {
  active.value = true;
};
const setInactive = () => {
  active.value = false;
};

const preventDefaults = (event) => {
  event.preventDefault();
};

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});

const setFileItems = (files) =>
  store.dispatch("fileUploadManager/addFileItems", files);

const compressFileName = (compressFile) => {
  return compressFile && `${compressFile.webkitRelativePath.split("/")[0]}.zip`;
};

const handleInputFileChange = async (event) => {
  const files = Array.from(event.target.files).filter((file) =>
    allowImageTypes.includes(file.type)
  );
  if (files.length > 0) {
    compressFiles.value.push(compressFileName(files[0]));
    const zipFile = await filesToZip(
      files.map((file) => ({
        file,
        options: {
          // onprogress: (current, total) => {
          //   console.log(current, total);
          // },
        },
      })),
      `${files[0].webkitRelativePath.split("/")[0]}.zip`
    );
    compressFiles.value = compressFiles.value.filter(
      (fileName) => fileName != zipFile.name
    );
    setFileItems([zipFile].map((file) => ({ file })));
  } else {
    alert("Empty Tiff File");
  }
  event.target.value = null;
};

const handleOnDrop = async (event) => {
  setInactive();
  const items = await tranformFileItems(event.dataTransfer.items);
  setFileItems(items);
};
</script>
<template>
  <div
    class="card file-drop-zone"
    :data-active="active"
    @dragenter.prevent="setActive"
    @dragover.prevent="setActive"
    @dragleave.prevent="setInactive"
    @drop.prevent="handleOnDrop"
    :class="{ active: active }"
  >
    <Teleport to="body">
      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <!-- Then put toasts within -->
        <div
          v-for="compressFile in compressFiles"
          class="toast show"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-bs-autohide="false"
          :key="compressFile.name"
        >
          <div class="toast-header">
            <strong class="me-auto">{{ compressFile }}</strong>
          </div>
          <div class="toast-body">Compressing...</div>
        </div>
      </div>
    </Teleport>

    <i class="bi bi-cloud-arrow-up" style="font-size: 1.5rem"></i>
    <div>{{ $t("screenItemProperties.fileUpload.fileDropZoneLabel") }}</div>
    <label
      :style="{ opacity: active ? 0 : 1 }"
      class="btn btn-primary col-auto btn-browse-file"
      for="file-drop-zone-file-input-mulitple"
    >
      {{ $t("screenItemProperties.button.dataConvertionUploadBtn") }}
    </label>
    <input
      id="file-drop-zone-file-input-mulitple"
      @change="handleInputFileChange"
      type="file"
      webkitdirectory
      directory
      multiple
      class="visually-hidden"
    />
  </div>
</template>
<style scoped>
.file-drop-zone {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-style: dashed !important;
  background-color: #f7f7f9 !important;
}
.file-action-group {
  padding-top: 0.5rem;
}
.active {
  background-color: #a8a8ca !important;
}
.btn-browse-file {
  background-color: #6c8bc5 !important;
}
</style>
