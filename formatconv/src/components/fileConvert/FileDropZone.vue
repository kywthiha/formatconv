<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import { tranformFileItems } from "../../utils/FileUtils";

const store = useStore();
const events = ["dragenter", "dragover", "dragleave", "drop"];
const active = ref(false);

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

const handleInputFileChange = (event) => {
  setFileItems(Array.from(event.target.files).map((file) => ({ file })));
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
    <i class="bi bi-cloud-arrow-up" style="font-size: 1.5rem"></i>
    <div>Drag and drop files and folders</div>
    <label
      :style="{ opacity: active ? 0 : 1 }"
      class="btn btn-primary col-auto"
      for="file-drop-zone-file-input-mulitple"
    >
      {{ $t("screenItemProperties.button.dataConvertionUploadBtn") }}
    </label>
    <input
      id="file-drop-zone-file-input-mulitple"
      @change="handleInputFileChange"
      type="file"
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
</style>
