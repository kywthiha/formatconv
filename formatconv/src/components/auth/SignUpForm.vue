<!--
    クラス名 : SignUpForm
    概要 : 新規アカウント作成処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import TermsAndConditionsForm from "./TermsAndConditionsForm.vue";
import {
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import HeaderDisplay from "../common/HeaderDisplay.vue";

export default {
  components: { HeaderDisplay, TermsAndConditionsForm },
  setup() {
    // Vuex ルーターにアクセスする
    const router = useRouter();

    // データ入力フィールドへの参照
    const email = ref("");
    const password = ref("");
    const confirm_password = ref("");
    const username = ref("");

    const isShowing = ref(false);
    const showModal = ref(false);

    // サインアップメソッドを呼び出す
    async function signUp() {
      /*
      ユーザープール オブジェクトを作成する。
      object パラメーターは、「Cognito ユーザー プールを使用するようにアプリケーションを構成する」セクションで設定した定数に保持されている Cognito ユーザー プール データを参照する。
      */
      const userPool = new CognitoUserPool(POOL_DATA);

      //この属性の配列は、パラメーターとしてサインアップ メソッドに渡される。
      const attrList = [];
      const emailAttribute = {
        Name: "email",
        Value: email.value,
      };
      const nameAttribute = {
        Name: "name",
        Value: username.value,
      };

      attrList.push(new CognitoUserAttribute(emailAttribute));
      attrList.push(new CognitoUserAttribute(nameAttribute));

      // 新規アカウント作成処理
      await userPool.signUp(
        email.value,
        password.value,
        attrList,
        null,
        (err, result) => {
          if (
            err.message === null ||
            err.message === "err is null" ||
            result === null
          ) {
            router.replace({
              name: "confirm",
              query: { username: email.value },
            });
          }
        }
      );
    }

    // モーダル表示する
    function openModal() {
      showModal.value = true;
    }

    return {
      openModal,
      showModal,
      email,
      username,
      password,
      signUp,
      confirm_password,
      isShowing,
    };
  },
};
</script>

<template v-slot:body>
  <div>
    <form @submit.prevent="signUp">
      <div v-if="!confirmMFACode">
        <div>
          <header-display>
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
              <div class="reg-input-text">
                <!-- アカウント名 -->
                <tr>
                  <td class="mail-label">
                    <label class="reg-accname-label">{{
                      $t("screenItemProperties.common.accountName")
                    }}</label>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model.trim="username"
                      autocomplete="false"
                      required
                    />
                  </td>
                </tr>
              </div>
              <div class="reg-input-text">
                <!-- メール -->
                <tr>
                  <td class="mail-label">
                    <label class="reg-accname-label">{{
                      $t("screenItemProperties.common.email")
                    }}</label>
                  </td>
                  <td>
                    <input
                      type="email"
                      v-model.trim="email"
                      id="email"
                      autocomplete="false"
                    />
                  </td>
                </tr>
              </div>
              <div class="reg-input-text">
                <tr>
                  <!-- パスワード -->
                  <td class="password-label">
                    <label class="reg-accname-label">{{
                      $t("screenItemProperties.common.password")
                    }}</label>
                  </td>
                  <td style="padding-right: 30px">
                    <input
                      type="password"
                      v-model.trim="password"
                      autocomplete="false"
                      required="required"
                      id="current-password"
                    />
                  </td>
                  <!-- 利用規約 -->
                  <td class="reg-chk-td">
                    <input type="checkbox" class="reg-checkbox" id="checkbox" />
                  </td>
                  <td>
                    <div class="terms-of-service-link">
                      <a @click="openModal">{{
                        $t("screenItemProperties.button.termsOfServiceBtn")
                      }}</a>
                    </div>
                  </td>
                </tr>
              </div>
              <div class="confirm-password-input">
                <tr>
                  <!-- パスワード確認 -->
                  <td class="password-label">
                    <label class="reg-accname-label">{{
                      $t("screenItemProperties.signup.confirmPassword")
                    }}</label>
                  </td>
                  <td>
                    <input
                      type="password"
                      v-model.trim="confirm_password"
                      autocomplete="false"
                      required="required"
                      id="confirm-password"
                    />
                  </td>
                  <td>
                    <!-- ボタンエリア -->
                    <div class="sign-up">
                      <button>
                        {{ $t("screenItemProperties.button.registerBtn") }}
                      </button>
                    </div>
                  </td>
                </tr>
              </div>

              <div class="signup-link">
                {{ $t("screenItemProperties.signup.alreadySignup") }}
                <a @click="resendCode" class="resend-code-atag"
                  ><router-link to="/signin"
                    ><span class="figcaption">
                      {{ $t("screenItemProperties.button.loginBtn") }}
                    </span>
                  </router-link></a
                >
              </div>
            </template>
          </body-display>
        </div>
      </div>
    </form>
    <!-- モーダルのため -->
    <!--
  このテンプレート フラグメントを body タグにテレポートする。
  -->
    <teleport to="body" />
    <terms-and-conditions-form :show="showModal" @close="showModal = false">
      <template #header>
        <h3>{{ $t("screenItemProperties.button.termsOfServiceBtn") }}</h3>
      </template>
    </terms-and-conditions-form>
    <teleport />
    <!-- モーダルのため -->
  </div>
</template>
<style></style>
