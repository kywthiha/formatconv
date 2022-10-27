<!--
    クラス名 : SignUpForm
    概要 : 新規アカウント作成処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { computed } from "@vue/reactivity";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import TermsAndConditionsForm from "./TermsAndConditionsForm.vue";
import {
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import HeaderDisplay from "../layout/HeaderDisplay.vue";
import validation from "../../hooks/validation";
import useAlert from "../../hooks/alert";
import { useI18n } from "vue-i18n";
import { handleKeyDown, exceptionError } from "../common/common";

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
    const termOfService = ref("");
    const showModal = ref(false);
    const usernameBlured = ref(false);
    let disableBtn = ref(true);
    let openedModal = ref(false);
    let changedCheckbox = ref(false);
    const passwordBlured = ref(false);
    const emailBlured = ref(false);
    const confirmPasswordBlured = ref(false);
    let disableCheckbox = ref(true);
    let message = ref("");
    const showPassword = ref(false);

    // 英語変換対応
    const { t } = useI18n();
    const passParam = t("errorParams.password");
    const confirmPasswordParam = t("errorParams.confirmPassword");
    // 入力チェックのため
    const {
      validUsername,
      usernameRequireMsg,
      validPassword,
      passRequireMsg,
      validConfirmPassword,
      confirmPasswordRequireMsg,
      validEmail,
      emailRequireMsg,
    } = validation();

    // メッセージを表示する
    const { setMessage } = useAlert();

    // メッセージを隠す
    function hideAlert() {
      message.value = "";
    }

    // 登録ボタンを有効にする
    watch(
      [openedModal, changedCheckbox],
      ([modal, checked], [prevModal, prevChecked]) => {
        // チェックボックスを有効にする
        if (modal === true) {
          disableCheckbox.value = false;
        }

        // 登録ボタンを有効にする
        if (modal === true && checked === true) {
          disableBtn.value = false;
        } else if (modal === false && checked === true) {
          // to ask
          setMessage(t("errorMessages.E0019"));
        }
      }
    );

    // サインアップメソッドを呼び出す
    async function signUp() {
      // alert("signup");
      disableBtn.value = true;

      if (!isValid()) {
        return;
      }

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
          // 例外エラーが発生した場合、エラーメッセージを表示し、処理を終了する。
          if (err !== null) {
            message.value = exceptionError(err.name);
            disableBtn.value = false;
            console.log("message ", exceptionError(err.name));
          }

          if (!err) {
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
      openedModal.value = true;
    }

    // 利用規約の未選択対応
    function changeCheckbox(event) {
      changedCheckbox.value = event.target.checked;
      console.log("changeCheckbox ", changedCheckbox.value);
      if (changedCheckbox.value === false) {
        disableBtn.value = true;
      }
    }

    // 入力チェック対応
    function isValid() {
      if (
        !(
          validUsername(username.value) &&
          validEmail(email.value) &&
          validPassword(password.value, passParam) &&
          validConfirmPassword(confirm_password.value, password.value)
        )
      ) {
        usernameBlured.value = true;
        passwordBlured.value = true;
        emailBlured.value = true;
        confirmPasswordBlured.value = true;
        disableBtn.value = false;

        return false;
      }

      return true;
    }

    return {
      openModal,
      showModal,
      email,
      username,
      password,
      signUp,
      confirm_password,
      validUsername,
      usernameRequireMsg,
      usernameBlured,
      validEmail,
      emailRequireMsg,
      disableBtn,
      openedModal,
      changeCheckbox,
      changedCheckbox,
      validPassword,
      passwordBlured,
      validConfirmPassword,
      confirmPasswordBlured,
      passRequireMsg,
      confirmPasswordRequireMsg,
      emailBlured,
      hideAlert,
      message,
      isValid,
      termOfService,
      handleKeyDown,
      disableCheckbox,
      exceptionError,
      passParam,
      confirmPasswordParam,

      showPassword,
    };
  },
};
</script>

<template v-slot:body>
  <div>
    <form @submit.prevent="signUp" @keydown="handleKeyDown">
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
          <!-- Error Alert -->
          <div
            v-if="message"
            class="alert alert-danger alert-dismissible align-items-center fade show"
            style="text-align: center"
          >
            <label>{{ message }}</label>
            <button type="button" class="btn-close" @click="hideAlert"></button>
          </div>
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
                      maxlength="63"
                      v-bind:class="{
                        'form-control': true,
                        'is-invalid':
                          !validUsername(username) && usernameBlured,
                      }"
                      v-bind:style="[
                        !validUsername(username) && usernameBlured
                          ? { 'margin-bottom': '0px' }
                          : { 'margin-bottom': '20px' },
                      ]"
                      v-on:blur="usernameBlured = true"
                      autocomplete="false"
                    />
                    <div class="invalid-feedback">
                      {{ usernameRequireMsg }}
                    </div>
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
                      maxlength="128"
                      id="email"
                      v-bind:class="{
                        'form-control': true,
                        'is-invalid': !validEmail(email) && emailBlured,
                      }"
                      v-bind:style="[
                        !validEmail(email) && emailBlured
                          ? { 'margin-bottom': '0px' }
                          : { 'margin-bottom': '20px' },
                      ]"
                      v-on:blur="emailBlured = true"
                      autocomplete="false"
                    />
                    <div class="invalid-feedback">
                      {{ emailRequireMsg }}
                    </div>
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
                    <!-- type="password"
                      :type="passwordFieldType"
                      -->
                    <div class="input-group">
                      <input
                        class="form-control"
                        v-bind:type="[showPassword ? 'text' : 'password']"
                        v-model.trim="password"
                        autocomplete="false"
                        maxlength="256"
                        id="current-password"
                        v-bind:class="{
                          'form-control': true,
                          'is-invalid':
                            !validPassword(password, passParam) &&
                            passwordBlured,
                        }"
                        v-bind:style="[
                          !validPassword(password, passParam) && passwordBlured
                            ? { 'margin-bottom': '0px' }
                            : { 'margin-bottom': '20px' },
                        ]"
                        v-on:blur="passwordBlured = true"
                      />

                      <span class="test">
                        <i
                          class="bi bi-eye-slash"
                          id="togglePassword"
                          style="cursor: pointer"
                          @click="showPassword = !showPassword"
                        ></i>
                      </span>
                    </div>
                    <div class="invalid-feedback">
                      {{ passRequireMsg }}
                    </div>
                  </td>

                  <!-- 利用規約 -->
                  <td class="reg-chk-td">
                    <input
                      type="checkbox"
                      class="reg-checkbox"
                      id="checkbox"
                      @change="changeCheckbox"
                      :disabled="disableCheckbox"
                    />
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
                      id="confirm-password"
                      maxlength="256"
                      v-bind:class="{
                        'form-control': true,
                        'is-invalid':
                          !validConfirmPassword(
                            confirm_password,
                            password,
                            passParam,
                            confirmPasswordParam
                          ) && confirmPasswordBlured,
                      }"
                      v-bind:style="[
                        !validConfirmPassword(
                          confirm_password,
                          password,
                          passParam,
                          confirmPasswordParam
                        ) && confirmPasswordBlured
                          ? { 'margin-bottom': '0px' }
                          : { 'margin-bottom': '20px' },
                      ]"
                      v-on:blur="confirmPasswordBlured = true"
                    />
                    <div class="invalid-feedback">
                      {{ confirmPasswordRequireMsg }}
                    </div>
                  </td>
                  <td>
                    <!-- ボタンエリア -->
                    <div class="sign-up">
                      <button :disabled="disableBtn">
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
