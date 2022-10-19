<!--
    クラス名 : FileUploadForm
    概要 : 変換ファイルアップロード処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { computed } from "@vue/reactivity";
import { ref, onBeforeMount, onBeforeUpdate } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";

// const events = ["dragenter", "dragleave", "dragover", "drop"];

export default {
  setup() {
    const store = useStore();
    let fileDropSelected = ref(false);
    let fileSelected = ref("");
    let fileName = ref("");
    let fileSize = ref("");
    let moveMFASetting = ref(false);
    let router = useRouter();
    let route = useRoute();
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
      console.log(event.dataTransfer.files);
      console.log("dragFile ", event.dataTransfer.files[0].name);
      fileDropSelected.value = true;
      fileSelected.value = event.dataTransfer.files[0];
      fileName.value = event.dataTransfer.files[0].name;
      fileSize.value = event.dataTransfer.files[0].size / Math.pow(1024, 3);
      console.log("fileSelected ", fileSelected);
      console.log("fileName ", fileName);
      console.log("fileSize ", fileSize);
    }

    function changePassword() {
      router.replace({
        name: "ChangePassword",
      });
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

    const cognitoUserName = computed(
      () => store.state.authModule.cognitoUserName
    );

    const profilename = computed(() => store.state.authModule.name);

    //
    const logout = () => {
      store.dispatch("logout");
      router.push({
        name: "signin",
        params: { message: "You have logged out" },
      });
    };

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      console.log(" in file upload ", store.getters.isMFAEnabled);
      return store.getters.isMFAEnabled;
    });

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    // const self = this;
    function enableMFAStatus(event) {
      console.log("checkbox value ", event.target.checked);
      // this.$root.broadcast("checkedValue", {
      //   users: event.target.checked,
      // });
      // self.$root.$emit("checkedValue", event.target.checked);
      // TotpForm.$emit("checkedValue", event.target.checked);
      router.replace({
        name: "Mfa",
        query: { checkedValue: event.target.checked },
      });
    }

    return {
      changePassword,
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
      logout,
      cognitoUserName,
      enableMFAStatus,
      mfaValue,
    };
  },
};
</script>
<template>
  <div>
    <header-display>
      <template v-slot:totp-slot>
        <button>
          <div class="form-switch" style="padding-left: 0em">
            <label class="form-check-label" for="flexSwitchCheckDefault">
              {{ $t("screenItemProperties.common.mfaOnOff") }}</label
            >
            <input
              class="form-check-input"
              style="margin-left: 0em"
              type="checkbox"
              id="flexSwitchCheckDefault"
              :value="mfaValue"
              v-model="mfaValue"
              @change="enableMFAStatus($event)"
            />
          </div>
        </button>
      </template>
      <template v-slot:register-slot>
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ profilename }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li>
              <a class="dropdown-item" href="#" @click="changePassword">{{
                $t("screenItemProperties.changePassword.changePassword")
              }}</a>
            </li>
            <li>
              <a class="dropdown-item" href="#">{{
                $t("screenItemProperties.common.serviceConfirmMenu")
              }}</a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="logout"
                >ログアウト</a
              >
            </li>
          </ul>
        </div>
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
