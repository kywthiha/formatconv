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
import validation from "../../hooks/validation";
import { POOL_DATA } from "../../config/cognito";
import { useI18n } from "vue-i18n";
import { handleKeyDown, exceptionError } from "../common/common";

export default {
  setup() {
    // Vuex ルートにアクセスする
    const route = useRoute();

    // Vuex ルーターにアクセスする
    const router = useRouter();

    // データ入力フィールドへの参照
    const code = ref("");
    const username = ref(route.query.username);
    const verificationCodeBlured = ref(false);
    let disableBtn = ref(false);

    // メッセージアラートのフックを設定する
    let message = ref("");
    let messageType = ref("");

    // 入力チェックのため
    const { validVerificationCode, verificationCodeRequireMsg } = validation();

    // 英語変換対応
    const { t } = useI18n();
    let param = t("errorParams.verificationCode");

    // コードを再送する
    function resendCode() {
      // Cognito ユーザープールデータをセットアップする
      const userPool = new CognitoUserPool(POOL_DATA);

      const userData = {
        Username: username.value,
        Pool: userPool,
      };

      // ユーザー名とユーザープール情報に基づいて Cognito User オブジェクトを作成する
      const cognitoUser = new CognitoUser(userData);

      // コードを再送するため、APIを呼び出す
      cognitoUser.resendConfirmationCode(function (err, result) {
        if (result.CodeDeliveryDetails.Destination != null) {
          messageType.value = "success";
          message.value = t("successMessages.I0001");
        }
        if (err !== null) {
          messageType.value = "danger";
          message.value = exceptionError(err.name, param);
        }
      });
    }

    // アカウントのサインアップ時にコードの使用を確認する
    async function confirmCode() {
      // 連続ボタン対応
      disableBtn.value = true;

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
        if (err !== null) {
          messageType.value = "danger";
          message.value = exceptionError(err.name, param);
          disableBtn.value = false;
        } else {
          router.replace({
            name: "signin",
          });
        }
      });
    }

    // メッセージを隠す
    function hideAlert() {
      message.value = "";
    }

    // 入力チェック対応
    function isValid() {
      if (!validVerificationCode(code.value, param)) {
        verificationCodeBlured.value = true;
        disableBtn.value = false;
        return false;
      }

      return true;
    }

    return {
      resendCode,
      confirmCode,
      code,
      username,
      isValid,
      verificationCodeBlured,
      validVerificationCode,
      verificationCodeRequireMsg,
      hideAlert,
      message,
      handleKeyDown,
      disableBtn,
      messageType,
      param,
    };
  },
};
</script>

<template>
  <form @submit.prevent="confirmCode" @keydown="handleKeyDown">
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
        class="alert alert-dismissible align-items-center fade show"
        :class="[messageType == 'danger' ? 'alert-danger' : 'alert-success']"
        v-if="message"
        style="text-align: center"
      >
        <label>{{ message }}</label>
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>
      <body-display>
        <template v-slot:body>
          <div>
            <table class="reset-pass-table">
              <!-- メール -->
              <tr>
                <td class="confirm-mail-label">
                  <label>{{ $t("screenItemProperties.common.email") }}</label>
                </td>
                <td>
                  <input
                    type="text"
                    maxlength="128"
                    v-model.trim="username"
                    disabled="true"
                    style="margin-bottom: 30px"
                    autocomplete="false"
                  />
                </td>
              </tr>
              <!-- 検証コード -->
              <tr class="table-row">
                <td class="signin-mail-label">
                  <label>{{
                    $t("screenItemProperties.common.verificationCode")
                  }}</label>
                </td>
                <td>
                  <input
                    type="text"
                    v-model.trim="code"
                    maxlength="6"
                    v-bind:class="{
                      'form-control': true,
                      'is-invalid':
                        !validVerificationCode(code, param) &&
                        verificationCodeBlured,
                    }"
                    v-bind:style="[
                      !validVerificationCode(code, param) &&
                      verificationCodeBlured
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
            </table>
            <!-- ボタンエリア -->
            <div class="sign-in">
              <button :disabled="disableBtn">
                {{ $t("screenItemProperties.button.confirmAccountBtn") }}
              </button>
            </div>
            <!-- 新しいコードを送るエリア -->
            <div class="resend-code">
              {{ $t("screenItemProperties.confirmAccount.sentNewCodeLabel") }}

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
