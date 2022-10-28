<!--
    クラス名 : SignInForm
    概要 : ログイン処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
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
    const route = useRoute();

    const { t } = useI18n();
    let message = ref("");
    const email = ref("");
    const username = ref("");
    const password = ref("");
    const mfaCode = ref("");
    const {
      validEmail,
      emailRequireMsg,
      signinValidPassword,
      signinPassRequireMsg,
    } = validation();

    const confirmMFACode = ref(false);

    const emailBlured = ref(false);
    const passwordBlured = ref(false);
    let verifyCodeRequireMsg = ref("");
    const verifyCodeBlured = ref(false);
    let alertStatus = true;
    let signinDisable = ref(false);
    const passParam = t("errorParams.password");
    console.log("pass....", passParam);

    function validVerificationCode(mfaCode) {
      // console.log("pass length", password.length);
      if (mfaCode.length === 0) {
        verifyCodeRequireMsg.value = t("errorMessages.E0001", {
          param1: t("errorParams.totpCode"),
        });
        return false;
      } else {
        return true;
      }
    }

    function hideAlert() {
      message.value = "";
    }

    // ログインする
    function signIn() {
      console.log("disable...", signinDisable);
      signinDisable.value = true;
      if (!isValid()) {
        // alert("valid...");
        return;
      }

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

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authDetails, {
        onSuccess(session) {
          console.log("success disable...", signinDisable);
          // ユーザーセッション情報を Vue 状態システムに保存する
          setUserSessionInfo(session);

          router.push({
            name: "fileUpload",
          });
          signinDisable.value = false;
        },
        onFailure(error) {
          // console.log("error...", error);
          // console.log("type error...", JSON.stringify({ error }));
          // console.log("failure disable...", signinDisable);

          if (error.message === "User is not confirmed.") {
            router.replace({
              name: "confirm",
              query: {
                username: email.value,
                errormsg: t("E001"),
              },
            });
          }
          if (!error.message.includes("SOFTWARE_TOKEN_MFA_CODE")) {
            message.value = exceptionError(
              error.name,
              t("errorParams.mailAndPass")
            );
          }
          signinDisable.value = false;
        },
        totpRequired(codeDeliveryDetails) {
          // alert("totp");
          console.log("totp msg", message.value);
          hideAlert();
          confirmMFACode.value = true;
          signinDisable.value = false;
          cognitoUser.sendMFACode(
            mfaCode.value.toString(),
            this,
            codeDeliveryDetails
          );
        },
      });
    }

    function isValid() {
      if (
        !(
          validEmail(email.value) &&
          signinValidPassword(password.value, passParam)
        )
      ) {
        // alert("isvalid totp if...");
        emailBlured.value = true;
        passwordBlured.value = true;
        signinDisable.value = false;
        return false;
      }
      if (
        !validVerificationCode(mfaCode.value) &&
        confirmMFACode.value == true
      ) {
        // alert("isvalid totp first if...");
        verifyCodeBlured.value = true;
        signinDisable.value = false;
        return false;
      }
      return true;
    }

    function autoTimeout(result) {
      const seconds_timeout = 3600;
      // ユーザーのログインが 1 時間後に期限切れになるように設定する
      const expirationDate =
        +result.idToken.payload["auth_time"] + seconds_timeout;

      var expires_millseconds =
        (expirationDate - +result.idToken.payload["auth_time"]) * 1000;

      return expires_millseconds;
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
      store.dispatch("setName", session.idToken.payload.name);
    }

    onMounted(function () {
      if (route.params.message) {
        message.value = route.params.message;
      }
    });

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
            <div v-if="!confirmMFACode">
              <div class="input-text">
                <!-- メール -->
                <tr>
                  <td class="mail-label">
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
              </div>

              <div class="input-text">
                <!-- パスワード -->
                <tr>
                  <td class="password-label">
                    <label>{{
                      $t("screenItemProperties.common.password")
                    }}</label>
                  </td>
                  <td>
                    <input
                      type="password"
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
                    <div class="invalid-feedback">
                      {{ signinPassRequireMsg }}
                    </div>
                  </td>
                </tr>
                <!-- リンク -->
                <router-link to="/resetPassword"
                  ><span class="figcaption"
                    ><u>{{
                      $t("screenItemProperties.signin.resetPassword")
                    }}</u></span
                  ></router-link
                >
              </div>
              <!-- ボタンエリア -->
              <div class="sign-in">
                <button :disabled="signinDisable">
                  {{ $t("screenItemProperties.button.loginBtn") }}
                </button>
              </div>
            </div>
            <!-- mfa を有効にするときに表示する -->
            <div v-if="confirmMFACode">
              <div class="reset-input-text">
                <!-- ワンタイムパスワード -->
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
                          !validVerificationCode(mfaCode) && verifyCodeBlured,
                      }"
                      v-bind:style="[
                        !validVerificationCode(mfaCode) && verifyCodeBlured
                          ? { 'margin-bottom': '0px' }
                          : { 'margin-bottom': '20px' },
                      ]"
                      v-on:blur="verifyCodeBlured = true"
                      autocomplete="false"
                    />
                    <div class="invalid-feedback">
                      {{ verifyCodeRequireMsg }}
                    </div>
                  </td>
                </tr>
              </div>
              <!-- ボタンエリア -->
              <div class="sign-in">
                <button style="margin-left: 170px" :disabled="signinDisable">
                  {{ $t("login") }}
                </button>
              </div>
            </div>
          </form>
        </template>
      </body-display>
    </div>
  </div>
</template>
<style scoped></style>
