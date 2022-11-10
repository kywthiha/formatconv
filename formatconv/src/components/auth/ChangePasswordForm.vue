<!--
    クラス名 : changePasswordForm
    概要 : パスワード変更処理画面
    作成者 : GICM
    作成日 : 2022/10/18　 
-->
<script>
import { ref } from "vue";
import { computed } from "@vue/reactivity";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import validation from "../../hooks/validation";
import loginHeaderForm from "./loginHeaderForm.vue";
import { handleKeyDown, exceptionError, getToken } from "../common/common";

export default {
  components: { loginHeaderForm },
  setup() {
    const store = useStore();
    const { t } = useI18n();
    let oldPassword = ref("");
    let oldPasswordBlured = ref(false);
    let newPassword = ref("");
    let newPasswordBlured = ref(false);
    let confirmNewPassword = ref("");
    let confirmNewPasswordBlured = ref(false);

    const {
      validPassword,
      passRequireMsg,
      signinValidPassword,
      signinPassRequireMsg,
      validConfirmPassword,
      confirmPasswordRequireMsg,
    } = validation();

    const username = computed(() => store.state.authModule.cognitoUserName);
    const currentPassParam = t("errorParams.currentPassword");
    const newPassParam = t("errorParams.newPassword");
    const confirmNewPassParam = t("errorParams.confirmNewPassword");
    let message = ref("");
    let messageType = ref("");
    let changePasswordDisable = ref(false);
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showNewConfirmPassword = ref(false);

    // 認証済みメールでコードを送信する
    function changePassword() {
      changePasswordDisable.value = true;

      if (!isValid()) {
        return;
      }

      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: username.value,
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      // ユーザーを認証するには getSession を呼び出す必要がある
      // cognito ユーザーのセッションを取得する
      // 取得できないと、「User is not authenticated」エラーが発生した
      cognitoUser.getSession(function (err, session) {
        if (err) {
          message.value = exceptionError(
            err.name,
            t("errorParams.currentPassword")
          );
          messageType.value = "danger";
          return;
        }
      });

      // 現在のcognitoユーザーのパスワードを更新する
      cognitoUser.changePassword(
        oldPassword.value,
        newPassword.value,
        function (err, result) {
          if (err) {
            message.value = exceptionError(
              err.name,
              t("errorParams.currentPassword")
            );
            messageType.value = "danger";
            changePasswordDisable.value = false;
            return;
          }

          // call result: SUCCESS
          if (result === "SUCCESS") {
            sendMail();
          }
        }
      );
    }

    //　パスワード変更処理が終わった後、完了メールを送信する。
    async function sendMail() {
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/change-password-sucess-mail`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (response.ok) {
          oldPassword.value = "";
          newPassword.value = "";
          confirmNewPassword.value = "";
          oldPasswordBlured.value = false;
          newPasswordBlured.value = false;
          confirmNewPasswordBlured.value = false;
          message.value = t("successMessages.I0002", {
            param1: t("errorParams.changePassword"),
          });
          changePasswordDisable.value = false;
          messageType.value = "success";
        } else {
          // パスワード変更処理の成功メールが送信できませんでした。
          message.value = t("errorMessages.E0019");
          messageType.value = "danger";
        }
      } catch (e) {
        // システムエラーが発生しました。システム管理者に問い合わせしてください。
        message.value = t("errorMessages.E0016");
        messageType.value = "danger";
      }
    }

    // メッセージを隠す
    function hideAlert() {
      message.value = "";
    }

    // 入力チェック対応
    function isValid() {
      if (
        !(
          signinValidPassword(oldPassword.value, currentPassParam) &&
          validPassword(newPassword.value, newPassParam) &&
          validConfirmPassword(
            confirmNewPassword.value,
            newPassword.value,
            newPassParam,
            confirmNewPassParam
          )
        )
      ) {
        oldPasswordBlured.value = true;
        newPasswordBlured.value = true;
        confirmNewPasswordBlured.value = true;
        changePasswordDisable.value = false;
        return false;
      }
      return true;
    }

    return {
      changePassword,
      oldPassword,
      oldPasswordBlured,
      newPassword,
      newPasswordBlured,
      confirmNewPassword,
      confirmNewPasswordBlured,
      validPassword,
      passRequireMsg,
      username,
      signinValidPassword,
      signinPassRequireMsg,
      currentPassParam,
      newPassParam,
      validConfirmPassword,
      confirmPasswordRequireMsg,
      confirmNewPassParam,
      isValid,
      exceptionError,
      message,
      handleKeyDown,
      hideAlert,
      changePasswordDisable,
      messageType,
      getToken,
      sendMail,
      showCurrentPassword,
      showNewPassword,
      showNewConfirmPassword,
    };
  },
};
</script>
<template>
  <form>
    <div>
      <div>
        <login-header-form></login-header-form>
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
            <!-- 認証済みメールでコードを送信する -->
            <form @submit.prevent="changePassword" @keydown="handleKeyDown">
              <div>
                <table class="change-pass-table">
                  <!-- メール -->
                  <tr>
                    <td class="mail-label">
                      <label>
                        {{
                          $t("screenItemProperties.changePassword.oldPassword")
                        }}</label
                      >
                    </td>
                    <td>
                      <div class="password-input">
                        <input
                          :type="[showCurrentPassword ? 'text' : 'password']"
                          maxlength="256"
                          v-model.trim="oldPassword"
                          autocomplete="false"
                          v-bind:class="{
                            'form-control': true,
                            'is-invalid':
                              !signinValidPassword(
                                oldPassword,
                                currentPassParam
                              ) && oldPasswordBlured,
                          }"
                          v-bind:style="[
                            !signinValidPassword(
                              oldPassword,
                              currentPassParam
                            ) && oldPasswordBlured
                              ? { 'margin-bottom': '0px' }
                              : { 'margin-bottom': '20px' },
                          ]"
                          v-on:blur="oldPasswordBlured = true"
                        />
                        <i
                          :class="[
                            showCurrentPassword
                              ? 'bi-eye-fill'
                              : 'bi-eye-slash-fill',
                          ]"
                          aria-hidden="true"
                          @click="showCurrentPassword = !showCurrentPassword"
                        ></i>
                        <div class="invalid-feedback">
                          {{ signinPassRequireMsg }}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <!-- 新しいパスワード -->
                  <tr>
                    <td class="mail-label">
                      <label>{{
                        $t("screenItemProperties.passwordReset.newPassword")
                      }}</label>
                    </td>
                    <td>
                      <div class="password-input">
                        <input
                          :type="[showNewPassword ? 'text' : 'password']"
                          maxlength="256"
                          v-model.trim="newPassword"
                          autocomplete="false"
                          v-bind:class="{
                            'form-control': true,
                            'is-invalid':
                              !validPassword(newPassword, newPassParam) &&
                              newPasswordBlured,
                          }"
                          v-bind:style="[
                            !validPassword(newPassword, newPassParam) &&
                            newPasswordBlured
                              ? { 'margin-bottom': '0px' }
                              : { 'margin-bottom': '20px' },
                          ]"
                          v-on:blur="newPasswordBlured = true"
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
                    <td class="mail-label">
                      <label class="confirm-newpass-label">{{
                        $t(
                          "screenItemProperties.passwordReset.confirmNewPassword"
                        )
                      }}</label>
                    </td>
                    <td>
                      <div class="password-input">
                        <input
                          :type="[showNewConfirmPassword ? 'text' : 'password']"
                          maxlength="256"
                          v-model.trim="confirmNewPassword"
                          autocomplete="false"
                          v-bind:class="{
                            'form-control': true,
                            'is-invalid':
                              !validConfirmPassword(
                                confirmNewPassword,
                                newPassword,
                                newPassParam,
                                confirmNewPassParam
                              ) && confirmNewPasswordBlured,
                          }"
                          v-bind:style="[
                            !validConfirmPassword(
                              confirmNewPassword,
                              newPassword,
                              newPassParam,
                              confirmNewPassParam
                            ) && confirmNewPasswordBlured
                              ? { 'margin-bottom': '0px' }
                              : { 'margin-bottom': '20px' },
                          ]"
                          v-on:blur="confirmNewPasswordBlured = true"
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
                        <button :disabled="changePasswordDisable">
                          {{
                            $t(
                              "screenItemProperties.changePassword.changePassword"
                            )
                          }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </form>
          </template>
        </body-display>
      </div>
    </div>
  </form>
</template>
