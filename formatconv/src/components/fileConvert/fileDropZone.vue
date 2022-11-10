<!--
    クラス名 :  fileDropZone
    概要 : 変換ファイルアップロードエリア処理
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { getAllFileEntries } from "../../utils/fileUtils";
import { filesToZip } from "../../utils/zipUtils";

const store = useStore();
const events = ["dragenter", "dragover", "dragleave", "drop"];
const active = ref(false);
const allowImageTypes = ["image/jpeg"];
const allowImageExtension = ["jpg", "jpeg"];
const compressFiles = ref([]);
const { t } = useI18n();

// フィアルドロップエリア背景色を有効する
const setActive = () => {
  active.value = true;
};

// フィアルドロップエリア背景色を無効する
const setInactive = () => {
  active.value = false;
};

// イベントをストップする処理
const preventDefaults = (event) => {
  event.preventDefault();
};

// イベント追加処理
onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

// イベント削除処理
onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});

// 画面に表示するZipリスト設定
const setFileItems = (files) =>
  store.dispatch("fileUploadManager/addFileItems", files);

// 圧縮後ファイル名設定
const compressFileName = (compressFile) => {
  return compressFile && `${compressFile.webkitRelativePath.split("/")[0]}.zip`;
};

// ファイルを圧縮化する
const compressFolder = async (files, fileName) => {
  const filterFiles = files.filter((file) => {
    if (file.type.length) {
      return allowImageTypes.includes(file.type);
    } else {
      return allowImageExtension.includes(file.name.split(".").pop());
    }
  });
  if (filterFiles.length > 0) {
    compressFiles.value.push({
      fileName,
      message: t("successMessages.I0003"),       // 圧縮中
    });
    // 指定されたフォルダーにある全ファイルを圧縮化する
    const zipFile = await filesToZip(
      filterFiles.map((file) => ({
        file,
        options: {},
      })),
      fileName
    );
    compressFiles.value = compressFiles.value.filter(
      (item) => item.fileName != zipFile.name
    );
    return zipFile;
  } else {
    return false;
  }
};

// ファイル選択処理
const handleInputFileChange = async (event) => {
  const zipFile = await compressFolder(
    Array.from(event.target.files),
    compressFileName(event.target.files[0])
  );
  if (zipFile) {
    setFileItems([zipFile].map((file) => ({ file })));
  } else {
    // アップロード対象のJPEGファイルが入っていません。
    alert(t("errorMessages.E0017"));
  }
  event.target.value = null;
};

// ファイルドロップ処理
const handleOnDrop = async (event) => {
  setInactive();
  Array.from(event.dataTransfer.items).forEach(async (dataTransferItem) => {
    const item = dataTransferItem.webkitGetAsEntry();
    if (item && item.isDirectory) {
      // フォルダーかどうかチェック
      const folderName = `${item.fullPath.split("/")[1]}.zip`;
      compressFiles.value.push({
        fileName: folderName,
        message: t("successMessages.I0004"),         // ファイル読み込み中
      });
      // 
      const fileItems = await getAllFileEntries(item);
      compressFiles.value = compressFiles.value.filter(
        (item) => item.fileName != folderName
      );
      const zipFile = await compressFolder(fileItems, folderName);
      if (zipFile) {
        setFileItems([zipFile].map((file) => ({ file })));
      } else {
        compressFiles.value.push({
          fileName: folderName,
          // アップロード対象のJPEGファイルが入っていません。
          error: t("errorMessages.E0017"),
        });
      }
    }
  });
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
          :key="compressFile.fileName"
        >
          <div class="toast-header">
            <strong class="me-auto">{{ compressFile.fileName }}</strong>
            <button
              v-if="compressFile.error"
              type="button"
              class="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>

          <div class="toast-body text-danger" v-if="compressFile.error">
            {{ compressFile.error }}
          </div>
          <div class="toast-body" v-else-if="compressFile.message">
            {{ compressFile.message }}
          </div>
        </div>
      </div>
    </Teleport>

    <i class="bi bi-cloud-arrow-up" style="font-size: 1.5rem"></i>
    <!-- ここにフォルダーをドロップ\nまたは -->
    <div>{{ $t("screenItemProperties.fileUpload.fileDropZoneLabel") }}</div>
    <label
      :style="{ opacity: active ? 0 : 1 }"
      class="btn btn-primary col-auto btn-browse-file"
      for="file-drop-zone-file-input-mulitple"
    >
      <!-- フォルダー選択 -->
      {{ $t("screenItemProperties.button.convertBtn") }}
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
<style scoped></style>
