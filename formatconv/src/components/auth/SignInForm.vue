<!--
    クラス名 : SignInForm
    概要 : ログイン処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateSignInForm } from "../../utils/validator";
import useAlert from "../../hooks/alert";
import store from "../../store/index";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import ResetPassword from "./PasswordResetForm.vue";
import { POOL_DATA } from "../../config/cognito";
import MFASettings from "./TotpForm.vue";
import HeaderDisplay from "../common/HeaderDisplay.vue";
import LocaleSelect from "../LocaleSelect.vue";
import BodyDisplay from "../common/BodyDisplay.vue";
import { useI18n } from "vue-i18n";

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

    const { rt, t } = useI18n();
    console.log("test ", t("E001"));

    const email = ref("");
    const username = ref("");
    const password = ref("");
    const mfaCode = ref("");

    const { message, messageStyleType, setMessage } = useAlert();
    const confirmMFACode = ref(false);

    const emailBlured = ref(false);
    const passwordBlured = ref(false);

    const profilename = ref("");

    function validEmail(email) {
      var reMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return reMail.test(email);
    }

    function validPassword(password) {
      var rePassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;

      return rePassword.test(password);
    }

    // ログインする
    function signIn() {
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
          // ユーザーセッション情報を Vue 状態システムに保存する
          setUserSessionInfo(session);

          router.push({
            name: "fileUpload",
          });
        },
        onFailure(error) {
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
            setMessage(error.message, "alert-danger");
          }
          store.dispatch("setIsLoading", false);
        },
        totpRequired(codeDeliveryDetails) {
          confirmMFACode.value = true;
          cognitoUser.sendMFACode(mfaCode.value, this, codeDeliveryDetails);
        },
      });
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
    }

    onMounted(function () {
      if (route.params.message) {
        message.value = route.params.message;
      }
    });

    function isValid() {
      const validationData = validateSignInForm({
        username: username.value,
        password: password.value,
      });

      if (!validationData.valid) {
        setMessage(validationData.message, "alert-danger");
        return false;
      }
      return true;
    }

    return {
      email,
      username,
      password,
      signIn,
      message,
      messageStyleType,
      mfaCode,
      autoTimeout,
      confirmMFACode,
      setUserSessionInfo,
      emailBlured,
      validEmail,
      passwordBlured,
      validPassword,
    };
  },
};
</script>

<template>
  <!-- <locale-select></locale-select> -->
  <form @submit.prevent="signIn">
    <div v-if="!confirmMFACode">
      <div>
        <header-display>
          <template v-slot:register-slot>
            <router-link to="/signup"
              ><button>
                <span class="figcaption">{{ $t("signup") }}</span>
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
            <div class="input-text">
              <!-- メール -->
              <tr>
                <td class="mail-label">
                  <label>{{ $t("screenItemProperties.common.email") }}</label>
                </td>
                <td>
                  <input
                    type="text"
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
                  <div class="invalid-feedback">メールを入力してください。</div>
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
                    v-model.trim="password"
                    autocomplete="false"
                    v-bind:class="{
                      'form-control': true,
                      'is-invalid': !validPassword(password) && passwordBlured,
                    }"
                    v-bind:style="[
                      !validPassword(password) && passwordBlured
                        ? { 'margin-bottom': '0px' }
                        : { 'margin-bottom': '20px' },
                    ]"
                    v-on:blur="passwordBlured = true"
                  />
                  <div class="invalid-feedback">
                    パスワードを入力してください。
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
              <button>
                {{ $t("screenItemProperties.button.loginBtn") }}
              </button>
            </div>
          </template>
        </body-display>
      </div>
    </div>
    <!-- mfa を有効にするときに表示する -->
    <div v-if="confirmMFACode">
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
        <div class="container">
          <div>
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
                    v-model.trim="mfaCode"
                    autocomplete="false"
                    required
                  />
                </td>
              </tr>
            </div>
            <!-- ボタンエリア -->
            <div class="sign-in">
              <button style="margin-left: 170px">
                {{ $t("login") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
