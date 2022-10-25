<!--
    クラス名 : ConfirmAccountForm
    概要 : 検証コード入力処理画面
    作成者 : GICM_KZP/GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { validateConfirmationForm } from "../../utils/validator";
import useAlert from "../../hooks/alert";
import validation from "../../hooks/validation";
import { POOL_DATA } from "../../config/cognito";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    // Vuex ルートにアクセスする
    const route = useRoute();

    // Vuex ルーターにアクセスする
    const router = useRouter();

    // データ入力フィールドへの参照
    const code = ref("");
    const successmsg = ref("");
    const username = ref(route.query.username);
    const errormsg = ref(route.query.errormsg);
    const disableErrorMsg = ref(false);
    const verificationCodeBlured = ref(false);

    const { validVerificationCode, verificationCodeRequireMsg } = validation();

    // メッセージアラートのフックを設定する
    const { message, setMessage } = useAlert();
    const { t } = useI18n();

    // コードを再送する
    function resendCode() {
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: username.value,
        Pool: userPool,
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.resendConfirmationCode(function (err, result) {
        console.log("resend code ", err);
        if (result.CodeDeliveryDetails.Destination != null) {
          setMessage(t("successMessages.S0001"));
          // disableErrorMsg.value = true;
          // successmsg.value =
          //   "確認コードが" + username.value + "に送信されます。";
        }
        if (err !== null) {
          //
          if (err.name === "NotAuthorizedException") {
            setMessage("SignUp is not permitted for this user pool");
          }

          //
          if (err.name === "UserNotFoundException") {
            setMessage(t("errorMessages.E0011"));
          }

          //
          if (err.name === "LimitExceededException") {
            setMessage(t("errorMessages.E0012"));
          }

          //
          if (err.name === "CodeDeliveryFailureException") {
            setMessage(t("errorMessages.E0014"));
          }

          if (err.name === "TooManyRequestsException") {
            setMessage(t("errorMessages.E0015"));
          }

          if (err.name === "InternalErrorException") {
            setMessage(t("errorMessages.E0016"));
          }
        }
        // if (err) {
        //   alert(err.message || JSON.stringify(err));
        //   return;
        // }
        console.log("call result: " + result.CodeDeliveryDetails.Destination);
      });
    }

    // アカウントのサインアップ時にコードの使用を確認する
    async function confirmCode() {
      if (!isValid()) {
        return;
      }

      // Cognito ユーザープールデータをセットアップする
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: username.value,
        Pool: userPool,
      };

      // ユーザー名とユーザープール情報に基づいて Cognito User オブジェクトを作成する
      const cognitUser = new CognitoUser(userData);

      // Cognito 確認登録メソッドを呼び出す
      await cognitUser.confirmRegistration(code.value, true, (err, result) => {
        console.log("in confirm ", err);
        if (err !== null) {
          //
          if (err.name === "CodeMismatchException") {
            setMessage(t("errorMessages.E0006"));
          }

          if (err.name === "LimitExceededException") {
            setMessage(t("errorMessages.E0012"));
          }

          if (err.name === "ExpiredCodeException") {
            setMessage(t("errorMessages.E0013"));
          }

          if (err.name === "TooManyRequestsException") {
            setMessage(t("errorMessages.E0015"));
          }

          if (err.name === "InternalErrorException") {
            setMessage(t("errorMessages.E0016"));
          }

          if (err.name === "UserNotFoundException") {
            setMessage(t("errorMessages.E0011"));
          }
        } else {
          router.replace({
            name: "signin",
            params: {
              message: "You have successfully confirmed your account",
            },
          });
        }
      });
    }

    function hideAlert() {
      message.value = "";
    }

    function isValid() {
      if (!validVerificationCode(code.value)) {
        verificationCodeBlured.value = true;
        return false;
      }

      return true;
    }

    return {
      resendCode,
      confirmCode,
      code,
      username,
      message,
      isValid,
      errormsg,
      successmsg,
      disableErrorMsg,
      verificationCodeBlured,
      validVerificationCode,
      verificationCodeRequireMsg,
      hideAlert,
      message,
    };
  },
};
</script>

<template>
  <form @submit.prevent="confirmCode">
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
          <div class="input-text">
            <!-- メール -->
            <tr>
              <td class="mail-label">
                <label>{{ $t("screenItemProperties.common.email") }}</label>
              </td>
              <td>
                <input
                  type="text"
                  v-model.trim="username"
                  autocomplete="false"
                />
              </td>
            </tr>
          </div>

          <div class="input-text">
            <!-- 検証コード -->
            <tr>
              <td class="password-label">
                <label>{{
                  $t("screenItemProperties.common.verificationCode")
                }}</label>
              </td>
              <td>
                <input
                  type="text"
                  v-model.trim="code"
                  v-bind:class="{
                    'form-control': true,
                    'is-invalid':
                      !validVerificationCode(code) && verificationCodeBlured,
                  }"
                  v-bind:style="[
                    !validVerificationCode(code) && verificationCodeBlured
                      ? { 'margin-bottom': '0px' }
                      : { 'margin-bottom': '20px' },
                  ]"
                  v-on:blur="verificationCodeBlured = true"
                  autocomplete="false"
                />
                <div class="invalid-feedback">
                  {{ verificationCodeRequireMsg }}
                </div>
              </td>
            </tr>
          </div>
          <!-- ボタンエリア -->
          <div class="sign-in">
            <button>
              {{ $t("screenItemProperties.button.confirmAccountBtn") }}
            </button>
          </div>
          <!-- 新しいコードを送るエリア -->
          <div class="resend-code">
            {{ $t("screenItemProperties.confirmAccount.sentNewCodeLabel") }}
            <div>
              <a @click="resendCode" class="resend-code-atag"
                ><span class="figcaption"
                  ><u>
                    {{
                      $t("screenItemProperties.confirmAccount.sentNewCodeLink")
                    }}</u
                  ></span
                ></a
              >
            </div>
          </div>
        </template>
      </body-display>
    </div>
  </form>
</template>

<style>
.confrimDiv {
  width: 1000px;
}
</style>
