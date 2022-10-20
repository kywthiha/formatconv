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
import { POOL_DATA } from "../../config/cognito";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import disableMFA from "../../hooks/disableMFA";
import loginHeaderForm from "../auth/LoginHeaderForm.vue";

const store = useStore();
let router = useRouter();
const files = ref([]);
const service_name = "formatconv";

const getUploadUrl = async (targetFiles) => {
  console.log(targetFiles);
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
          file_names: [...targetFiles].map((file) => file.name),
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      files.value = [...targetFiles].map((file) => {
        return {
          file: file,
          ...data.find((i) => i.file_name == file.name),
        };
      });
    } else {
      const data = await response.json();
      console.log(data);
      alert(data.message);
    }
  } catch (e) {
    console.log(e);
  }
};

async function handleDrop(event) {
  files.value = [...event.target.files].map((file) => ({ file }));
  await getUploadUrl(event.target.files);
}
async function dragFile(event) {
  files.value = [...event.dataTransfer.files].map((file) => ({ file }));
  await getUploadUrl(event.dataTransfer.files);
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
          @change="handleDrop"
          type="file"
          multiple
          id="inputName"
          class="visually-hidden"
        />
        <label for="inputName" class="lbl">{{
          $t("screenItemProperties.button.dataConvertionUploadBtn")
        }}</label>

        <div @drop="dragFile" class="drag-container">
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
