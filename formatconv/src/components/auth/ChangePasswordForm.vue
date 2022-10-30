<!--
    クラス名 : ChangePasswordForm
    概要 : パスワード変更処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/18　 
-->
<script>
import { ref, onBeforeMount, onBeforeUpdate } from "vue";
import { computed } from "@vue/reactivity";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import validation from "../../hooks/validation";
import disableMFA from "../../hooks/disableMFA";
import LoginHeaderForm from "../auth/LoginHeaderForm.vue";
import { handleKeyDown, exceptionError, getToken } from "../common/common";

export default {
  components: { LoginHeaderForm },
  setup() {
    const router = useRouter();
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
    console.log("in change password ", username.value);
    console.log("confirm pass ", confirmNewPassParam);
    console.log("getToken ", getToken);

    // sendMail();
    // 認証済みメールでコードを送信する
    function changePassword() {
      console.log("...", isValid());
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
      console.log(" cognito user in change password ", cognitoUser);

      // ユーザーを認証するには getSession を呼び出す必要がある
      // cognito ユーザーのセッションを取得する
      // 取得できないと、「User is not authenticated」エラーが発生した
      cognitoUser.getSession(function (err, session) {
        console.log("in Change pass", err);
        console.log("in Change pass session", session);
        if (err) {
          alert(err);
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
            alert(err.message || JSON.stringify(err));
            message.value = exceptionError(
              err.name,
              t("errorParams.currentPassword")
            );
            messageType.value = "danger";
            changePasswordDisable.value = false;
            return;
          }
          // call result: SUCCESS
          console.log("call result: " + result);
          if (result === "SUCCESS") {
            sendMail();
          }
        }
      );
    }

    async function sendMail() {
      try {
        const token = await getToken();
        const response = await fetch(
          "https://wdduz75b1m.execute-api.us-east-1.amazonaws.com/test/change-password-mail",
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
          message.value = t("errorMessages.E0019");
          messageType.value = "danger";
        }
      } catch (e) {
        message.value = t("errorMessages.E0016");
        messageType.value = "danger";
      }
    }

    function hideAlert() {
      message.value = "";
    }

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
        // alert("isvalid totp if...");
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
    };
  },
};
</script>
<template>
  <form>
    <div>
      <div>
        <login-header-form></login-header-form>
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
            <!-- 認証済みメールでコードを送信する -->
            <div>
              <form @submit.prevent="changePassword" @keydown="handleKeyDown">
                <body-display>
                  <template v-slot:body style="margin-right: 170px">
                    <div style="margin-right: 70px">
                      <div class="input-text">
                        <!-- メール -->
                        <tr>
                          <td class="mail-label">
                            <label style="width: 170px">
                              {{
                                $t(
                                  "screenItemProperties.changePassword.oldPassword"
                                )
                              }}</label
                            >
                          </td>
                          <td>
                            <input
                              type="password"
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
                            <div class="invalid-feedback">
                              {{ signinPassRequireMsg }}
                            </div>
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
                            <div class="invalid-feedback">
                              {{ passRequireMsg }}
                            </div>
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
                            <div class="invalid-feedback">
                              {{ confirmPasswordRequireMsg }}
                            </div>
                          </td>
                        </tr>
                      </div>
                      <!-- ボタンエリア -->
                      <div class="sign-in" style="margin-left: 70px">
                        <button :disabled="changePasswordDisable">
                          {{
                            $t(
                              "screenItemProperties.changePassword.changePassword"
                            )
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
