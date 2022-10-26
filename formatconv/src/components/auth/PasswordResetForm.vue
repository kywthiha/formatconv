<!--
    クラス名 : PasswordResetForm
    概要 : パスワードリセット処理画面
    作成者 : GICM_KZP/GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref } from "vue";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import { useRouter } from "vue-router";
import validation from "../../hooks/validation";
import { handleKeyDown, exceptionError } from "../common/common";

export default {
  setup() {
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const code = ref("");
    const confirmCode = ref(false);
    const emailBlured = ref(false);
    let message = ref("");
    let disableUpdatePasswordBtn = ref(false);
    let disableResetPasswordBtn = ref(false);

    // 入力チェックのため
    const { validEmail, emailRequireMsg } = validation();

    // 認証済みメールでコードを送信する
    function sendCode() {
      alert("send code");
      disableResetPasswordBtn.value = true;
      if (!isValid()) {
        return;
      }

      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: email.value,
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      // パスワードを忘れたリクエスト
      cognitoUser.forgotPassword({
        onSuccess: function (data) {
          confirmCode.value = true;
          disableResetPasswordBtn.value = false;
        },
        onFailure: function (err) {
          if (err !== null) {
            message.value = exceptionError(err.name);
            disableResetPasswordBtn.value = false;
          }
        },
      });
    }

    // パスワードの更新
    function resetPassword() {
      alert("reset Password");
      disableUpdatePasswordBtn.value = true;
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: email.value,
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmPassword(code.value, password.value, {
        onSuccess() {
          router.replace({
            name: "signin",
          });
        },
        onFailure(err) {
          console.log("err in reset funtion ", err.message);
          if (err !== null) {
            message.value = exceptionError(err.name);
            disableUpdatePasswordBtn.value = false;
          }
        },
      });
    }

    // 入力チェック対応
    function isValid() {
      if (!validEmail(email.value)) {
        emailBlured.value = true;
        disableResetPasswordBtn.value = false;
        return false;
      }
      return true;
    }

    // メッセージを隠す
    function hideAlert() {
      message.value = "";
    }

    return {
      email,
      code,
      confirmPassword,
      sendCode,
      resetPassword,
      password,
      confirmCode,
      validEmail,
      emailRequireMsg,
      emailBlured,
      isValid,
      handleKeyDown,
      exceptionError,
      message,
      hideAlert,
      disableUpdatePasswordBtn,
      disableResetPasswordBtn,
    };
  },
};
</script>
<template>
  <form>
    <div>
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
            <!-- 認証済みメールでコードを送信する -->
            <div v-if="!confirmCode">
              <form @submit.prevent="sendCode" @keydown="handleKeyDown">
                <body-display>
                  <template v-slot:body>
                    <div class="input-text">
                      <!-- メール -->
                      <tr>
                        <td class="mail-label">
                          <label>{{
                            $t("screenItemProperties.common.email")
                          }}</label>
                        </td>
                        <td>
                          <input
                            maxlength="128"
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
                          <div class="invalid-feedback">
                            {{ emailRequireMsg }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td colspan="2">
                          <router-link to="/signin"
                            ><span class="figcaption" style="font-size: 14px"
                              ><u>{{
                                $t("screenItemProperties.button.loginBtn")
                              }}</u></span
                            ></router-link
                          >
                        </td>
                      </tr>
                    </div>
                    <!-- ボタンエリア -->
                    <div class="sign-in">
                      <button :disabled="disableResetPasswordBtn">
                        {{ $t("screenItemProperties.button.resetPasswordBtn") }}
                      </button>
                    </div>
                  </template>
                </body-display>
              </form>
            </div>
            <!-- パスワードの更新 -->
            <div v-if="confirmCode">
              <form @submit.prevent="resetPassword" @keydown="handleKeyDown">
                <body-display>
                  <template v-slot:body style="margin-right: 170px">
                    <div style="margin-right: 70px">
                      <div class="input-text">
                        <!-- 検証コード -->
                        <tr>
                          <td class="mail-label">
                            <label style="width: 170px">
                              {{
                                $t(
                                  "screenItemProperties.common.verificationCode"
                                )
                              }}</label
                            >
                          </td>
                          <td>
                            <input
                              type="text"
                              maxlength="6"
                              v-model.trim="code"
                              autocomplete="false"
                            />
                          </td>
                        </tr>
                      </div>
                      <div class="input-text">
                        <!-- 新しいパスワード -->
                        <tr>
                          <td class="mail-label">
                            <label style="width: 170px">{{
                              $t(
                                "screenItemProperties.passwordReset.newPassword"
                              )
                            }}</label>
                          </td>
                          <td>
                            <input
                              type="password"
                              v-model.trim="password"
                              maxlength="256"
                              autocomplete="false"
                            />
                          </td>
                        </tr>
                      </div>
                      <div class="input-text">
                        <!-- 新しいパスワード確認 -->
                        <tr>
                          <td class="mail-label">
                            <label style="width: 170px">{{
                              $t(
                                "screenItemProperties.passwordReset.confirmNewPassword"
                              )
                            }}</label>
                          </td>
                          <td>
                            <input
                              type="password"
                              v-model.trim="confirmPassword"
                              maxlength="256"
                              autocomplete="false"
                            />
                          </td>
                        </tr>
                      </div>
                      <!-- ボタンエリア -->
                      <div class="sign-in" style="margin-left: 70px">
                        <button :disabled="disableUpdatePasswordBtn">
                          {{
                            $t("screenItemProperties.button.updatePasswordBtn")
                          }}
                        </button>
                      </div>
                    </div>
                  </template>
                </body-display>
              </form>
            </div>
          </template>
        </body-display>
      </div>
    </div>
  </form>
</template>
