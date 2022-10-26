<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { Toast } from "bootstrap/dist/js/bootstrap.js";
import { useStore } from "vuex";
import { humanFileSize, tranformFileItems } from "../../utils/FileUtils";
import { filesToZip } from "../../utils/ZipUtils";

const store = useStore();
const events = ["dragenter", "dragover", "dragleave", "drop"];
const active = ref(false);
const allowImageTypes = ["image/tiff", "image/tif"];
const toastRef = ref(null);
const zipFile = ref(null);

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

const downloadURI = (uri, name) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const setFileItems = (files) =>
  store.dispatch("fileUploadManager/addFileItems", files);

const handleInputFileChange = async (event) => {
  const files = Array.from(event.target.files).filter((file) =>
    allowImageTypes.includes(file.type)
  );
  const totalSize = files.reduce((prev, file) => (prev += file.size), 0);
  if (files.length > 0) {
    zipFile.value = files[0];
    const toast = new Toast(toastRef.value);
    toast.show();
    zipFile.value = await filesToZip(
      files.map((file) => ({
        file,
        options: {
          onprogress: (current, total) => {
            console.log(current, total);
          },
        },
      })),
      `${files[0].webkitRelativePath.split("/")[0]}.zip`
    );
    console.log(zipFile.value);
    console.log(humanFileSize(totalSize), humanFileSize(zipFile.value.size));
    setFileItems([zipFile.value].map((file) => ({ file })));
    toast.hide();
    downloadURI(URL.createObjectURL(zipFile.value));
  } else {
    alert("Empty Tiff File");
  }

  event.target.value = null;
};

const zipFileName = computed(() => {
  return (
    zipFile.value && `${zipFile.value.webkitRelativePath.split("/")[0]}.zip`
  );
});

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
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div
        id="liveToast"
        class="toast hide"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-autohide="false"
        ref="toastRef"
      >
        <div class="toast-header">
          <strong class="me-auto">{{ zipFileName }}</strong>
        </div>
        <div class="toast-body">Compressing...</div>
      </div>
    </div>

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
