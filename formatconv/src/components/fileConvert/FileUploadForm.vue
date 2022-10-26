<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script setup>
import { computed } from "@vue/reactivity";
import { ref, onBeforeMount, onBeforeUpdate } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import FileItem from "./FileItem.vue";
import * as zip from "@zip.js/zip.js";
import LoginHeaderForm from "../auth/LoginHeaderForm.vue";

const store = useStore();
let router = useRouter();
const files = ref([]);
const service_name = import.meta.env.VITE_SERVICE_NAME;
const accept_file_types = [
  "application/zip",
  "application/x-zip",
  "application/x-zip-compressed",
];

const getUploadUrl = async (targetFiles) => {
  const filter_files = [...targetFiles].filter((file) =>
    accept_file_types.includes(file.type)
  );

  if (filter_files.length < 1) {
    alert("Invalid file type");
    return;
  }

  files.value = filter_files.map((file) => ({ file }));

  try {
    const response = await fetch(
      "https://wdduz75b1m.execute-api.us-east-1.amazonaws.com/test/presigned-url-upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: store.state.authModule.idToken,
        },
        body: JSON.stringify({
          service_name,
          file_names: filter_files.map((file) => file.name),
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      // update state files list
      files.value = filter_files.map((file) => {
        return {
          file: file,
          ...data.find((i) => i.file_name == file.name),
        };
      });
    } else {
      console.log(data);
      alert(data.message);
    }
  } catch (e) {
    console.log(e);
    alert(e.message);
  }
};

async function folderToZip(files) {
  const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"), {
    bufferedWrite: true,
  });
  await Promise.all(
    Array.from(files).map(async (file) => {
      console.log(file);
      await zipWriter.add(file.name, new zip.BlobReader(file), {
        onstart(max) {
          console.log("start");
          console.log(max);
        },
        onprogress(index, max) {
          console.log(index, max, file.name);
        },
        onend(computedSize) {
          console.log("end", file.name);
        },
      });
    })
  );
  console.log("finish");
  const my_blob = await zipWriter.close();
  const file = new File([my_blob], files[0].webkitRelativePath.split("/")[0], {
    type: my_blob.type,
  });
  console.log(my_blob);
  console.log(file);
  return file;
}

function convertMinute(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

async function handleInputFileChange(event) {
  console.log(event.target.files);
  const startTime = performance.now();
  const file = await folderToZip(event.target.files);
  const endTime = performance.now();
  const message = `Execution Time = ${convertMinute(endTime - startTime)} `;
  console.log(message);
  alert(message);
  files.value = [file].map((file) => ({ file }));
  // await getUploadUrl([file]);
  // await getUploadUrl(event.target.files);
}

function traverseFileTree(item, path) {
  path = path || "";
  if (item.isFile) {
    // Get file
    item.file(function (file) {
      console.log("File:", path + file.name);
    });
  } else if (item.isDirectory) {
    // Get folder contents
    const dirReader = item.createReader();
    dirReader.readEntries(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        traverseFileTree(entries[i], path + item.name + "/");
      }
    });
  }
}

async function handleDropFile(event) {
  const items = event.dataTransfer.items;
  for (let i = 0; i < items.length; i++) {
    // webkitGetAsEntry is where the magic happens
    const item = items[i].webkitGetAsEntry();
    if (item) {
      traverseFileTree(item);
    }
  }
  // await folderToZip(event.dataTransfer.files);
  // await getUploadUrl(event.dataTransfer.files);
}

const username = computed(() => store.state.authModule.cognitoUserName);
</script>
<template>
  <div>
    <login-header-form></login-header-form>
    <div class="file-upload-form">
      <!-- ファイルのドラッグ と ドロップエリア -->
      <div
        @dragover.prevent
        @drop.prevent
        class="file-upload-container"
        v-if="!files.length"
      >
        <input
          @change="handleInputFileChange"
          type="file"
          multiple
          webkitdirectory
          directory
          id="inputName"
          class="visually-hidden"
        />
        <label for="inputName" class="lbl">{{
          $t("screenItemProperties.button.dataConvertionUploadBtn")
        }}</label>

        <div @drop="handleDropFile" class="drag-container">
          <span>+</span>
        </div>
      </div>
      <div class="file-list-container" v-if="files.length">
        <div class="file-list">
          <!-- ドラッグ と ドロップしたファイルを表示するエリア -->
          <FileItem v-for="item in files" :key="item.file_name" :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.file-upload-form {
  min-height: 50vh;
}
.file-upload-form .file-list-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
.file-upload-form .file-list {
  display: flex;
  width: 60%;
  flex-direction: column;
  gap: 1rem;
}
.file-upload-form .file-upload-container {
  display: flex;
  margin-top: 2rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.file-upload-form .file-upload-container .drag-container {
  width: 15rem;
  height: 10rem;
  background-color: #e0e0e0;
  border-radius: 5px;
  border: 1px solid #4a4a4a;
  display: flex;
  justify-content: center;
  align-items: center;
}
.file-upload-form .file-upload-container .drag-container span {
  font-size: 1.5rem;
}
</style>
