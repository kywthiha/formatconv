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

export default {
  setup() {
    const router = useRouter();
    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const code = ref("");
    const confirmCode = ref(false);

    // 認証済みメールでコードを送信する
    function sendCode() {
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: username.value,
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      // パスワードを忘れたリクエスト
      cognitoUser.forgotPassword({
        onSuccess: function (data) {
          confirmCode.value = true;
        },
        onFailure: function (err) {},
      });
    }

    // パスワードの更新
    function resetPassword() {
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: username.value,
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
        },
      });
    }

    return {
      username,
      code,
      confirmPassword,
      sendCode,
      resetPassword,
      password,
      confirmCode,
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
        <body-display>
          <template v-slot:body>
            <!-- 認証済みメールでコードを送信する -->
            <div v-if="!confirmCode">
              <form @submit.prevent="sendCode">
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
                            type="text"
                            v-model.trim="username"
                            autocomplete="false"
                          />
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
                      <button>
                        {{ $t("screenItemProperties.button.resetPasswordBtn") }}
                      </button>
                    </div>
                  </template>
                </body-display>
              </form>
            </div>
            <!-- パスワードの更新 -->
            <div v-if="confirmCode">
              <form @submit.prevent="resetPassword">
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
                              autocomplete="false"
                            />
                          </td>
                        </tr>
                      </div>
                      <!-- ボタンエリア -->
                      <div class="sign-in" style="margin-left: 70px">
                        <button>
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
