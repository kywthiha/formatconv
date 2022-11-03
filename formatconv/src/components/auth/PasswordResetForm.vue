<!--
    クラス名 : passwordResetForm
    概要 : パスワードリセット処理画面
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script>
import { ref } from "vue";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import { useRouter } from "vue-router";
import validation from "../../hooks/validation";
import { handleKeyDown, exceptionError } from "../common/common";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const code = ref("");
    const confirmCode = ref(false);
    const emailBlured = ref(false);
    const passwordBlured = ref(false);
    const confirmPasswordBlured = ref(false);
    let message = ref("");
    let disableUpdatePasswordBtn = ref(false);
    let disableResetPasswordBtn = ref(false);
    const verificationCodeBlured = ref(false);
    const showNewPassword = ref(false);
    const showNewConfirmPassword = ref(false);

    // 英語変換対応
    const { t } = useI18n();
    const passParam = t("errorParams.newPassword");
    const confirmPasswordParam = t("errorParams.confirmNewPassword");
    let messageType = ref("");
    let param = t("errorParams.verificationCode");
    // 半角数字のみ
    const digitpass = t("screenItemProperties.signin.onlyDigit");

    // 入力チェックのため
    const {
      validEmail,
      emailRequireMsg,
      validVerificationCode,
      verificationCodeRequireMsg,
      validPassword,
      passRequireMsg,
      validConfirmPassword,
      confirmPasswordRequireMsg,
    } = validation();

    // 認証済みメールでコードを送信する
    function sendCode() {
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
          message.value = "";
        },
        onFailure: function (err) {
          if (err !== null) {
            messageType.value = "danger";
            message.value = exceptionError(
              err.name,
              t("errorParams.mailAddress")
            );
            disableResetPasswordBtn.value = false;
          }
        },
      });
    }

    // パスワードの更新
    function resetPassword() {
      // 連続ボタン対応
      disableUpdatePasswordBtn.value = true;

      if (!isValidConfrimPassword()) {
        return;
      }

      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: email.value,
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      //confirmPassword APIを呼び出す
      cognitoUser.confirmPassword(code.value, password.value, {
        onSuccess() {
          router.replace({
            name: "signin",
          });
        },
        onFailure(err) {
          if (err !== null) {
            messageType.value = "danger";
            message.value = exceptionError(
              err.name,
              t("errorParams.mailAddress")
            );
            disableUpdatePasswordBtn.value = false;
          }
        },
      });
    }

    // 入力チェック対応
    function isValidConfrimPassword() {
      if (
        !(
          validVerificationCode(code.value, param) &&
          validPassword(password.value, passParam) &&
          validConfirmPassword(
            confirmPassword.value,
            password.value,
            passParam,
            confirmPasswordParam
          )
        )
      ) {
        verificationCodeBlured.value = true;
        passwordBlured.value = true;
        confirmPasswordBlured.value = true;
        disableUpdatePasswordBtn.value = false;
        return false;
      }
      return true;
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
      validVerificationCode,
      verificationCodeRequireMsg,
      verificationCodeBlured,
      isValidConfrimPassword,
      passParam,
      confirmPasswordParam,
      passwordBlured,
      confirmPasswordBlured,
      validPassword,
      validConfirmPassword,
      passRequireMsg,
      confirmPasswordRequireMsg,
      messageType,
      param,
      showNewPassword,
      showNewConfirmPassword,
      digitpass,
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
        <!-- エラーメッセージ表示 -->
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
            <!-- 認証済みメールでコードを送信する -->
            <div v-if="!confirmCode">
              <form @submit.prevent="sendCode" @keydown="handleKeyDown">
                <table class="reset-pass-table">
                  <!-- メール -->
                  <tr>
                    <td class="signin-mail-label">
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
                  <!-- ログインリンク -->
                  <tr>
                    <td colspan="2">
                      <router-link to="/signin"
                        ><span class="figcaption" style="float: right"
                          ><u>{{
                            $t("screenItemProperties.button.loginBtn")
                          }}</u></span
                        ></router-link
                      >
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <!-- ボタンエリア -->
                      <div class="sign-in">
                        <button :disabled="disableResetPasswordBtn">
                          {{
                            $t("screenItemProperties.button.resetPasswordBtn")
                          }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </table>
              </form>
            </div>
            <!-- パスワードリセット -->
            <div v-if="confirmCode">
              <form @submit.prevent="resetPassword" @keydown="handleKeyDown">
                <table class="reset-pass-tbl">
                  <!-- 検証コード -->
                  <tr>
                    <td class="signin-mail-label">
                      <label style="width: 170px">
                        {{
                          $t("screenItemProperties.common.verificationCode")
                        }}</label
                      >
                    </td>
                    <td>
                      <input
                        type="text"
                        maxlength="6"
                        v-model.trim="code"
                        v-bind:class="{
                          'form-control': true,
                          'is-invalid':
                            !validVerificationCode(code, param, digitpass) &&
                            verificationCodeBlured,
                        }"
                        v-bind:style="[
                          !validVerificationCode(code, param, digitpass) &&
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
                  <!-- 新しいパスワード -->
                  <tr>
                    <td class="password-label">
                      <label style="width: 170px">{{
                        $t("screenItemProperties.passwordReset.newPassword")
                      }}</label>
                    </td>
                    <td>
                      <div class="password-input">
                        <input
                          :type="[showNewPassword ? 'text' : 'password']"
                          v-model.trim="password"
                          maxlength="256"
                          autocomplete="false"
                          v-bind:class="{
                            'form-control': true,
                            'is-invalid':
                              !validPassword(password, passParam) &&
                              passwordBlured,
                          }"
                          v-bind:style="[
                            !validPassword(password, passParam) &&
                            passwordBlured
                              ? { 'margin-bottom': '0px' }
                              : { 'margin-bottom': '20px' },
                          ]"
                          v-on:blur="passwordBlured = true"
                        />
                        <i
                          :class="[
                            showNewPassword
                              ? 'bi-eye-fill'
                              : 'bi-eye-slash-fill',
                          ]"
                          aria-hidden="true"
                          @click="showNewPassword = !showNewPassword"
                        ></i>
                        <div class="invalid-feedback">
                          {{ passRequireMsg }}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <!-- 新しいパスワード確認 -->
                  <tr>
                    <td class="password-label">
                      <label style="width: 170px">{{
                        $t(
                          "screenItemProperties.passwordReset.confirmNewPassword"
                        )
                      }}</label>
                    </td>
                    <td>
                      <div class="password-input">
                        <input
                          :type="[showNewConfirmPassword ? 'text' : 'password']"
                          v-model.trim="confirmPassword"
                          maxlength="256"
                          autocomplete="false"
                          v-bind:class="{
                            'form-control': true,
                            'is-invalid':
                              !validConfirmPassword(
                                confirmPassword,
                                password,
                                passParam,
                                confirmPasswordParam
                              ) && confirmPasswordBlured,
                          }"
                          v-bind:style="[
                            !validConfirmPassword(
                              confirmPassword,
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
                            showNewConfirmPassword
                              ? 'bi-eye-fill'
                              : 'bi-eye-slash-fill',
                          ]"
                          aria-hidden="true"
                          @click="
                            showNewConfirmPassword = !showNewConfirmPassword
                          "
                        ></i>
                        <div class="invalid-feedback">
                          {{ confirmPasswordRequireMsg }}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <!-- ボタンエリア -->
                      <div class="sign-in">
                        <button :disabled="disableUpdatePasswordBtn">
                          {{
                            $t("screenItemProperties.button.updatePasswordBtn")
                          }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </table>
              </form>
            </div>
          </template>
        </body-display>
      </div>
    </div>
  </form>
</template>
