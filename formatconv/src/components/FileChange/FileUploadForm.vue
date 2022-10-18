<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import store from "../../store/index";

const events = ["dragenter", "dragleave", "dragover", "drop"];

export default {
  setup() {
    let fileDropSelected = ref(false);
    let fileSelected = ref("");
    let fileName = ref("");
    let fileSize = ref("");
    let moveMFASetting = ref(false);
    let router = useRouter();
    let route = useRoute();
    let profilename = ref(route.query.profilename);
    let fileList = ref("");

    function handleDrop(event) {
      console.log("fileSelected ", event.target.files);
      for (var i = 0; i < event.target.files.length; i++) {
        fileList.value = event.target.files[i];
      }
      console.log("fileList ", fileList.value);
      fileDropSelected.value = true;
      fileSelected.value = event.target.files[0];
      fileName.value = event.target.files[0].name;
      fileSize.value = event.target.files[0].size / Math.pow(1024, 3);
      console.log("fileSelected ", fileSelected);
      console.log("fileName ", fileName.value);
      console.log("fileSize ", fileSize.value);
    }

    function dragFile(event) {
      console.log("dragFile ", event.dataTransfer.files[0].name);
      fileDropSelected.value = true;
      fileSelected.value = event.dataTransfer.files[0];
      fileName.value = event.dataTransfer.files[0].name;
      fileSize.value = event.dataTransfer.files[0].size / Math.pow(1024, 3);
      console.log("fileSelected ", fileSelected);
      console.log("fileName ", fileName);
      console.log("fileSize ", fileSize);
    }

    function enableMFASetting() {
      console.log("enableMFASetting ");
      moveMFASetting.value = true;
      router.replace({
        name: "Mfa",
      });
    }

    function setUserSessionInfo(session) {
      setTimeout(function () {
        store.dispatch("autoLogout");
        router.replace("/signin");
        alert("You have been automatically logged out");
      }, autoTimeout(session));

      store.dispatch("setSession", session);
      store.dispatch("setIDToken", session.getIdToken().getJwtToken());
      store.dispatch(
        "setUsername",
        session.idToken.payload["cognito:username"]
      );
      store.dispatch("setIsAuthenticated", true);
      store.dispatch("setEmail", session.idToken.payload.email);
    }
    return {
      handleDrop,
      dragFile,
      fileDropSelected,
      fileSelected,
      fileName,
      fileSize,
      File,
      enableMFASetting,
      moveMFASetting,
      setUserSessionInfo,
      profilename,
    };
  },
};
</script>
<template>
  <div>
    <header-display>
      <template v-slot:totp-slot>
        <button @click="enableMFASetting">
          <span class="figcaption">{{
            $t("screenItemProperties.common.mfaOnOff")
          }}</span>
        </button>
      </template>
      <template v-slot:register-slot>
        <router-link to="#"
          ><button style="width: 250px">
            <span class="figcaption">アカウント名：{{ profilename }}</span>
          </button></router-link
        >
      </template>
      <template v-slot:titlebar-slot>
        <div class="logo-icon">
          <img src="../../assets/logo-icon.png" class="img-fluid" />
        </div>
        <!-- タイトル -->
        <label>{{ $t("screenItemProperties.common.title") }}</label>
      </template>
    </header-display>
    <body-display>
      <template v-slot:body>
        <!-- ファイルのドラッグ と ドロップエリア -->
        <div @dragover.prevent @drop.prevent v-if="!fileDropSelected">
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

          <div @drop="dragFile" class="lblFile">
            <label>+</label>
            <div>
              <ul v-for="file in File" :key="file">
                <li>{{ file.name }}</li>
              </ul>
            </div>
          </div>
        </div>
        <!-- ドラッグ と ドロップしたファイルを表示するエリア -->
        <div class="lblText" v-if="fileDropSelected">
          <table>
            <tr>
              <td class="filename-lbl">
                <b>{{ $t("screenItemProperties.fileUpload.fileName") }}</b>
              </td>
              <td class="filesize-lbl">
                <b>{{ $t("screenItemProperties.fileUpload.fileSize") }}</b>
              </td>
              <td rowspan="2" class="convert-td">
                <button>
                  {{ $t("screenItemProperties.button.convertingBtn") }}
                </button>
              </td>
            </tr>
            <tr>
              <td class="filesize-lbl" style="column-width: 200px">
                {{ fileName }}
              </td>
              <td class="filesize-lbl">{{ fileSize }}</td>
            </tr>
          </table>
        </div>
      </template>
    </body-display>
  </div>
</template>
