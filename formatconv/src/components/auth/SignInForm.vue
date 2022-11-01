<!--
    クラス名 : SignInForm
    概要 : ログイン処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import store from "../../store/index";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import ResetPassword from "./PasswordResetForm.vue";
import { POOL_DATA } from "../../config/cognito";
import MFASettings from "./TotpForm.vue";
import HeaderDisplay from "../layout/HeaderDisplay.vue";
import LocaleSelect from "../LocaleSelect.vue";
import BodyDisplay from "../layout/BodyDisplay.vue";
import { useI18n } from "vue-i18n";
import validation from "../../hooks/validation";
import { handleKeyDown, exceptionError } from "../common/common";

export default {
  components: {
    MFASettings,
    HeaderDisplay,
    LocaleSelect,
    BodyDisplay,
    ResetPassword,
  },
  setup() {
    // Vue ルーターへの参照を作成する
    const router = useRouter();
    let message = ref("");
    const email = ref("");
    const username = ref("");
    const password = ref("");
    const mfaCode = ref("");
    const confirmMFACode = ref(false);
    const emailBlured = ref(false);
    const passwordBlured = ref(false);
    let verifyCodeRequireMsg = ref("");
    const verifyCodeBlured = ref(false);
    let alertStatus = true;
    let signinDisable = ref(false);
    const showPassword = ref(false);

    // 英語変換対応
    const { t } = useI18n();
    const passParam = t("errorParams.password");
    const pass = t("errorParams.totpCode");
    const digitpass = t("screenItemProperties.signin.onlyDigit");

    // 入力チェックのため
    const {
      validEmail,
      emailRequireMsg,
      signinValidPassword,
      signinPassRequireMsg,
      validVerificationCode,
      verificationCodeRequireMsg,
    } = validation();

    // メッセージを隠す
    function hideAlert() {
      message.value = "";
    }

    // ログインする
    function signIn() {
      // 連続ボタン対応
      signinDisable.value = true;

      if (!isValid()) {
        return;
      }

      // Cognito ユーザープールデータをセットアップする
      const userPool = new CognitoUserPool(POOL_DATA);
      const authData = {
        Username: email.value,
        Password: password.value,
      };

      // 認証の詳細を設定します - ユーザー名とユーザープール情報を含む
      const authDetails = new AuthenticationDetails(authData);
      const userData = {
        Username: authData.Username,
        Pool: userPool,
      };

      // ユーザー名とユーザープール情報に基づいて Cognito User オブジェクトを作成する
      const cognitoUser = new CognitoUser(userData);

      // authenticateUser APIを呼び出す
      cognitoUser.authenticateUser(authDetails, {
        onSuccess(session) {
          // ユーザーセッション情報を Vue 状態システムに保存する
          setUserSessionInfo(session);

          router.push({
            name: "fileUpload",
          });
          signinDisable.value = false;
        },
        onFailure(error) {
          if (!error.message.includes("SOFTWARE_TOKEN_MFA_CODE")) {
            message.value = exceptionError(
              error.name,
              t("errorParams.mailAndPass"),
              error.message
            );
          }

          // ユーザーのMFAステータスが確認されていない場合、
          if (error.message === "User is not confirmed.") {
            router.replace({
              name: "confirm",
              query: {
                username: email.value,
                errormsg: t("E001"),
              },
            });
          }

          signinDisable.value = false;
        },
        totpRequired(codeDeliveryDetails) {
          hideAlert();
          confirmMFACode.value = true;
          signinDisable.value = false;
          cognitoUser.sendMFACode(mfaCode.value, this, codeDeliveryDetails);
        },
      });
    }

    // 入力チェック対応
    function isValid() {
      if (
        !(
          validEmail(email.value) &&
          signinValidPassword(password.value, passParam)
        )
      ) {
        emailBlured.value = true;
        passwordBlured.value = true;
        signinDisable.value = false;
        return false;
      }
      if (
        !validVerificationCode(mfaCode.value) &&
        confirmMFACode.value == true
      ) {
        verifyCodeBlured.value = true;
        signinDisable.value = false;
        return false;
      }
      return true;
    }

    //
    function autoTimeout(result) {
      console.log("time out", result);
      // const seconds_timeout = 3600;
      const seconds_timeout = 60;
      // ユーザーのログインが 1 時間後に期限切れになるように設定する
      const expirationDate =
        +result.idToken.payload["auth_time"] + seconds_timeout;

      var expires_millseconds =
        (expirationDate - +result.idToken.payload["auth_time"]) * 1000;

      return expires_millseconds;
    }

    //　ログインユーザーの情報を保存する
    function setUserSessionInfo(session) {
      console.log("set ", session);
      //
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
      store.dispatch("setName", session.idToken.payload.name);
    }

    return {
      email,
      username,
      password,
      signIn,
      message,
      mfaCode,
      autoTimeout,
      confirmMFACode,
      setUserSessionInfo,
      emailBlured,
      validEmail,
      passwordBlured,
      signinValidPassword,
      emailRequireMsg,
      signinPassRequireMsg,
      alertStatus,
      hideAlert,
      exceptionError,
      isValid,
      signinDisable,
      validVerificationCode,
      verifyCodeRequireMsg,
      verifyCodeBlured,
      handleKeyDown,
      passParam,
      pass,
      digitpass,
      validVerificationCode,
      verificationCodeRequireMsg,
      showPassword,
    };
  },
};
</script>

<template>
  <!-- <locale-select></locale-select> -->
  <div>
    <div>
      <header-display>
        <template v-slot:register-slot v-if="!confirmMFACode">
          <router-link to="/signup"
            ><button>
              <span class="figcaption">{{
                $t("screenItemProperties.common.register")
              }}</span>
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

      <!-- Error Alert -->
      <div
        class="alert alert-danger alert-dismissible align-items-center fade show"
        v-if="message"
        style="text-align: center"
      >
        <label>{{ message }}</label>
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>
      <body-display>
        <template v-slot:body>
          <form @submit.prevent="signIn" @keydown="handleKeyDown">
            <div v-if="!confirmMFACode" style="margin-right: 38px">
              <table class="signin-table">
                <!-- メール -->
                <tr>
                  <td class="signin-mail-label">
                    <label>{{ $t("screenItemProperties.common.email") }}</label>
                  </td>
                  <td>
                    <input
                      type="text"
                      maxlength="128"
                      v-model.trim="email"
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

                <!-- パスワード -->
                <tr class="table-row">
                  <td class="password-label">
                    <label
                      >{{ $t("screenItemProperties.common.password") }}
                    </label>
                  </td>
                  <td>
                    <div class="password-input">
                      <input
                        :type="[showPassword ? 'text' : 'password']"
                        maxlength="256"
                        v-model.trim="password"
                        autocomplete="false"
                        v-bind:class="{
                          'form-control': true,
                          'is-invalid':
                            !signinValidPassword(password, passParam) &&
                            passwordBlured,
                        }"
                        v-bind:style="[
                          !signinValidPassword(password, passParam) &&
                          passwordBlured
                            ? {
                                'margin-bottom': '0px',
                              }
                            : { 'margin-bottom': '20px' },
                        ]"
                        v-on:blur="passwordBlured = true"
                      />
                      <i
                        class="bi bi-eye-slash"
                        aria-hidden="true"
                        @click="showPassword = !showPassword"
                      ></i>
                      <div class="invalid-feedback">
                        {{ signinPassRequireMsg }}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr></tr>
                <tr>
                  <td></td>
                  <td style="text-align: right">
                    <!-- リンク -->
                    <router-link to="/resetPassword"
                      ><span class="figcaption"
                        ><u>{{
                          $t("screenItemProperties.signin.resetPassword")
                        }}</u></span
                      ></router-link
                    >
                  </td>
                </tr>
              </table>

              <!-- ボタンエリア -->
              <div class="sign-in">
                <button :disabled="signinDisable">
                  {{ $t("screenItemProperties.button.loginBtn") }}
                </button>
              </div>
            </div>
            <!-- mfa を有効にするときに表示する -->
            <div v-if="confirmMFACode">
              <!-- ワンタイムパスワード -->
              <table class="totp-table">
                <tr>
                  <td class="totp-label">
                    <label>{{
                      $t("screenItemProperties.signin.onetimePassword")
                    }}</label>
                  </td>
                  <td>
                    <input
                      type="text"
                      maxlength="6"
                      v-model.trim="mfaCode"
                      v-bind:class="{
                        'form-control': true,
                        'is-invalid':
                          !validVerificationCode(mfaCode, pass, digitpass) &&
                          verifyCodeBlured,
                      }"
                      v-bind:style="[
                        !validVerificationCode(mfaCode, pass, digitpass) &&
                        verifyCodeBlured
                          ? { 'margin-bottom': '0px' }
                          : { 'margin-bottom': '20px' },
                      ]"
                      v-on:blur="verifyCodeBlured = true"
                      autocomplete="false"
                    />
                    <div class="invalid-feedback">
                      {{ verificationCodeRequireMsg }}
                    </div>
                  </td>
                </tr>
              </table>
              <!-- ボタンエリア -->
              <div class="sign-in">
                <button :disabled="signinDisable">
                  {{ $t("screenItemProperties.button.loginBtn") }}
                </button>
              </div>
            </div>
          </form>
        </template>
      </body-display>
    </div>
  </div>
</template>
