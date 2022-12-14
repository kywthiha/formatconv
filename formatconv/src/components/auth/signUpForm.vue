<!--
    クラス名 : signUpForm
    概要 : 新規アカウント作成処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import headerDisplay from "../layout/headerDisplay.vue";
import validation from "../../hooks/validation";
import { useI18n } from "vue-i18n";
import { handleKeyDown, exceptionError } from "../common/common";
import TermsAndConditionsForm from "./TermsAndConditionsForm.vue";

export default {
  components: { headerDisplay, TermsAndConditionsForm },
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
    let disableBtn = ref(true);
    let openedModal = ref(false);
    let changedCheckbox = ref(false);
    const passwordBlured = ref(false);
    const emailBlured = ref(false);
    const confirmPasswordBlured = ref(false);
    let disableCheckbox = ref(true);
    let message = ref("");
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    let messageType = ref("");

    // 英語変換対応
    const { t } = useI18n();
    // パスワード
    const passParam = t("errorParams.password");
    // パスワード確認
    const confirmPasswordParam = t("errorParams.confirmPassword");
    // 入力チェックのため
    const {
      validUsername,                // アカウントユーザー名フォーマット変換
      validPassword,                // パスワードフォマットチェック
      passRequireMsg,
      validConfirmPassword,         // パスワードやパスワード確認一致チェック
      confirmPasswordRequireMsg,
      validEmail,                   // メールアドレスフォーマットチェック
      emailRequireMsg,
    } = validation();

    // エラーメッセージエリアを隠す
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
          // 「利用規約」ボタンをクリックし、内容を確認してください。
          message.value = t("errorMessages.E0018");
          messageType.value = "danger";
        }
      }
    );

    // サインアップメソッドを呼び出す
    async function signUp() {
      // 連続ボタン対応
      disableBtn.value = true;

      // 入力チェック
      if (!isValid()) {
        return;
      }

      // ユーザープール オブジェクトを作成する。
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
            // 例外エラー対応
            messageType.value = "danger";
            message.value = exceptionError(err.name);
            disableBtn.value = false;
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
      if (changedCheckbox.value === false) {
        disableBtn.value = true;
      }
    }

    // アカウント名を設定する
    function insertUsername() {
      username.value = email.value.replace(/[^0-9a-z]/g, "");
    }

    // 入力チェック
    function isValid() {
      if (
        !(
          // アカウントユーザー名フォーマット変換・メールアドレスフォーマットチェック・パスワードフォマットチェック・パスワードやパスワード確認一致チェック
          validUsername(username.value) &&
          validEmail(email.value) &&
          validPassword(password.value, passParam) &&
          validConfirmPassword(confirm_password.value, password.value)
        )
      ) {
        passwordBlured.value = true;
        emailBlured.value = true;
        confirmPasswordBlured.value = true;
        disableBtn.value = false;

        return false;
      }

      return true;
    }

    return {
      openModal,                            // モーダル表示する
      showModal,
      email,
      username,
      password,
      signUp,                               // サインアップメソッドを呼び出す
      confirm_password,
      validUsername,                        // アカウントユーザー名フォーマット変換
      validEmail,                           // メールアドレスフォーマットチェック
      emailRequireMsg,
      disableBtn,
      openedModal,
      changeCheckbox,                       // 利用規約の未選択対応
      changedCheckbox,
      validPassword,                        // パスワードフォマットチェック
      passwordBlured,
      validConfirmPassword,                 // パスワードやパスワード確認一致チェック
      confirmPasswordBlured,
      passRequireMsg,
      confirmPasswordRequireMsg,
      emailBlured,
      hideAlert,                            // エラーメッセージエリアを隠す
      message,
      isValid,                              // 入力チェック
      termOfService,
      handleKeyDown,                        // Enterキーイベント対応
      disableCheckbox,
      exceptionError,                       // 例外エラー対応
      passParam,
      confirmPasswordParam,
      showPassword,
      showConfirmPassword,
      messageType,
      insertUsername,                       // アカウント名を設定する
    };
  },
};
</script>

<template>
  <div>
    <form @submit.prevent="signUp" @keydown="handleKeyDown">
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
        <!-- エラーメッセージ表示 -->
        <div class="alert-container">
          <div
            class="alert alert-dismissible align-items-center fade show"
            :class="[
              messageType == 'danger' ? 'alert-danger' : 'alert-success',
            ]"
            v-if="message"
            style="text-align: center"
          >
            <label>{{ message }}</label>
            <button type="button" class="btn-close" @click="hideAlert"></button>
          </div>
        </div>
        <body-display>
          <template v-slot:body>
            <table class="signup-tbl">
              <!-- アカウント名 -->
              <tr>
                <td class="account-name-label">
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
                    }"
                    autocomplete="false"
                    disabled
                  />
                </td>
              </tr>
              <!-- メールアドレス -->
              <tr>
                <td class="mail-label">
                  <label class="sign-up-label">{{
                    $t("screenItemProperties.common.email")
                  }}</label>
                </td>
                <td>
                  <input
                    type="text"
                    class="signup-mail"
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
                    @keyup="insertUsername()"
                    autocomplete="false"
                  />
                  <div class="invalid-feedback">
                    {{ emailRequireMsg }}
                  </div>
                </td>
              </tr>
              <tr>
                <!-- パスワード -->
                <td class="password-label">
                  <label class="sign-up-label">{{
                    $t("screenItemProperties.common.password")
                  }}</label>
                </td>
                <td>
                  <div class="password-input">
                    <input
                      class="form-control"
                      :type="[showPassword ? 'text' : 'password']"
                      v-model.trim="password"
                      autocomplete="false"
                      maxlength="256"
                      id="current-password"
                      v-bind:class="{
                        'form-control': true,
                        'is-invalid':
                          !validPassword(password, passParam) && passwordBlured,
                      }"
                      v-bind:style="[
                        !validPassword(password, passParam) && passwordBlured
                          ? { 'margin-bottom': '0px' }
                          : { 'margin-bottom': '20px' },
                      ]"
                      v-on:blur="passwordBlured = true"
                    />
                    <i
                      :class="[
                        showPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill',
                      ]"
                      aria-hidden="true"
                      @click="showPassword = !showPassword"
                    ></i>
                    <div class="invalid-feedback">
                      {{ passRequireMsg }}
                    </div>
                  </div>
                </td>
                <!-- 利用規約チェックボックス -->
                <td>
                  <div style="padding-left: 30px">
                    <input
                      type="checkbox"
                      class="reg-checkbox"
                      id="checkbox"
                      @change="changeCheckbox"
                      :disabled="disableCheckbox"
                    />
                  </div>
                </td>
                <!-- 利用規約ボタン -->
                <td style="padding-bottom: 10px">
                  <div class="terms-of-service-link">
                    <a @click="openModal">{{
                      $t("screenItemProperties.button.termsOfServiceBtn")
                    }}</a>
                  </div>
                </td>
              </tr>
              <tr>
                <!-- パスワード確認 -->
                <td class="password-label">
                  <label class="sign-up-label">{{
                    $t("screenItemProperties.signup.confirmPassword")
                  }}</label>
                </td>
                <td>
                  <div class="password-input">
                    <input
                      :type="[showConfirmPassword ? 'text' : 'password']"
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
                    <i
                      :class="[
                        showConfirmPassword
                          ? 'bi-eye-fill'
                          : 'bi-eye-slash-fill',
                      ]"
                      aria-hidden="true"
                      @click="showConfirmPassword = !showConfirmPassword"
                    ></i>
                    <div class="invalid-feedback">
                      {{ confirmPasswordRequireMsg }}
                    </div>
                  </div>
                </td>
                <td colspan="2" style="padding-left: 30px">
                  <!-- ボタンエリア -->
                  <div class="sign-up">
                    <button :disabled="disableBtn">
                      <!-- 登録 -->
                      {{ $t("screenItemProperties.button.registerBtn") }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <!-- 再送信する -->
                <td colspan="4">
                  <div class="signup-link">
                    <!-- すでにアカウントをお持ちですか？ -->
                    {{ $t("screenItemProperties.signup.alreadySignup") }}
                    <a @click="resendCode" class="resend-code-atag">
                      <router-link to="/signin"
                        ><span class="figcaption">
                          <!-- ログイン -->
                          {{ $t("screenItemProperties.button.loginBtn") }}
                        </span>
                      </router-link>
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </template>
        </body-display>
      </div>
    </form>
    <!-- モーダルのため -->
    <!--
  このテンプレート フラグメントを body タグにテレポートする。
  -->
    <template v-if="showModal">
      <termsAndConditionsForm
        :show="showModal"
        @close="showModal = false"
        to="body"
      >
        <template #header>
          <!-- 利用規約ボタン -->
          <h3>{{ $t("screenItemProperties.button.termsOfServiceBtn") }}</h3>
        </template>
      </termsAndConditionsForm>
    </template>
    <!-- モーダルのため -->
  </div>
</template>
<style></style>
