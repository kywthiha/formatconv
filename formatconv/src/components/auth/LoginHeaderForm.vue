<!--
    クラス名 : loginHeaderForm
    概要 : ログイン後のヘッダ表示
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script>
import { computed } from "@vue/reactivity";
import { onBeforeMount, onBeforeUpdate } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import disableMFA from "../../hooks/disableMFA";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const router = useRouter();
    const store = useStore();
    // 英語変換対応
    const { t } = useI18n();

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      return store.getters.isMFAEnabled;
    });

    // プロファイル名
    const profilename = computed(() => store.state.authModule.name);

    // ログアウト
    const logout = () => {
      store.dispatch("logout");
      router.push({
        name: "signin",
      });
    };

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    // MFAステータスを変更する
    function enableMFAStatus(event) {
      if (event.target.checked === true) {
        store.dispatch("setStatus", event.target.checked);
        router.replace({
          name: "Mfa",
        });
      } else {
        store.dispatch("setStatus", event.target.checked);
        disableMFA();
      }
    }

    //　パスワード変更画面へ移動する
    function changePassword() {
      router.replace({
        name: "ChangePassword",
      });
    }

    return {
      mfaValue,
      enableMFAStatus,      // MFAステータス変更
      changePassword,       // パスワード変更画面へ移動
      profilename,
      logout,               // ログアウト
    };
  },
};
</script>

<template>
  <header-display>
    <template v-slot:register-slot>
      <div class="row">
        <!-- ホーム -->
        <div class="col-6">
          <router-link to="/fileUpload"
            ><button style="width: 100px; margin-left: 70px">
              <span class="figcaption">{{
                $t("screenItemProperties.button.homeBtn")
              }}</span>
            </button></router-link
          >
        </div>
        <!-- ドロップダウンメニュー -->
        <div class="col-6">
          <div class="dropdown">
            <!-- アカウント名 -->
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
              <!-- 多要素認証 -->
              <li class="dropdown-item">
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
              </li>
              <!-- パスワード変更 -->
              <li>
                <a class="dropdown-item" href="#" @click="changePassword">{{
                  $t("screenItemProperties.changePassword.changePassword")
                }}</a>
              </li>
              <!-- サービス利用規約確認 -->
              <li>
                <a class="dropdown-item" href="#">{{
                  $t("screenItemProperties.common.serviceConfirmMenu")
                }}</a>
              </li>
              <!-- ログアウト -->
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">{{
                  $t("screenItemProperties.common.logout")
                }}</a>
              </li>
            </ul>
          </div>
        </div>
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
</template>
