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
import validation from "../../hooks/validation";

export default {
  setup() {
    const router = useRouter();
    const store = useStore();
    const oldPassword = ref("");
    let oldPasswordBlured = ref(false);
    const newPassword = ref("");
    let newPasswordBlured = ref(false);
    const confirmNewPassword = ref("");
    let confirmNewPasswordBlured = ref(false);
    let name = ref(null);
    const { validPassword, passRequireMsg } = validation();

    const profilename = computed(() => store.state.authModule.name);

    // 認証済みメールでコードを送信する
    function changePassword() {
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: "myathtet44@gmail.com",
        Pool: userPool,
      };
      const cognitoUser = new CognitoUser(userData);
      // let cognitoUser = userPool.getCurrentUser();
      console.log(" cognito user in change password ", cognitoUser);

      // cognito ユーザーのセッションを取得する
      // 取得できないと、「User is not authenticated」エラーが発生した
      cognitoUser.getSession(function (err, session) {
        if (err) {
          alert(err);
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
            return;
          }

          // call result: SUCCESS
          console.log("call result: " + result);

          if (result === "SUCCESS") {
            router.replace({
              name: "fileUpload",
            });
          }
        }
      );
    }

    function enableMFAStatus(event) {
      router.replace({
        name: "Mfa",
        query: { checkedValue: event.target.checked },
      });
    }

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      return store.getters.isMFAEnabled;
    });

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    const logout = () => {
      store.dispatch("logout");
      router.push({
        name: "signin",
        params: { message: "You have logged out" },
      });
    };

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
      profilename,
      enableMFAStatus,
      mfaValue,
      logout,
    };
  },
};
</script>
<template>
  <form>
    <div>
      <div>
        <header-display>
          <template v-slot:totp-slot>
            <button>
              <div class="form-switch" style="padding-left: 0em">
                <label class="form-check-label" for="flexSwitchCheckDefault">
                  {{ $t("screenItemProperties.common.mfaOnOff") }}</label
                >
                <input
                  class="form-check-input"
                  style="margin-left: 0em"
                  type="checkbox"
                  id="flexSwitchCheckDefault"
                  :value="mfaValue"
                  v-model="mfaValue"
                  @change="enableMFAStatus($event)"
                />
              </div>
            </button>
          </template>
          <template v-slot:register-slot>
            <div class="dropdown">
              <button
                class="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ profilename }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <a class="dropdown-item" href="#" @click="changePassword">{{
                    $t("screenItemProperties.changePassword.changePassword")
                  }}</a>
                </li>
                <li>
                  <a class="dropdown-item" href="#">{{
                    $t("screenItemProperties.common.serviceConfirmMenu")
                  }}</a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout"
                    >ログアウト</a
                  >
                </li>
              </ul>
            </div>
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
            <!-- 認証済みメールでコードを送信する -->
            <div>
              <form @submit.prevent="changePassword">
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
                              v-model.trim="oldPassword"
                              autocomplete="false"
                              v-bind:class="{
                                'form-control': true,
                                'is-invalid':
                                  !validPassword(oldPassword) &&
                                  oldPasswordBlured,
                              }"
                              v-bind:style="[
                                !validPassword(oldPassword) && oldPasswordBlured
                                  ? { 'margin-bottom': '0px' }
                                  : { 'margin-bottom': '20px' },
                              ]"
                              v-on:blur="oldPasswordBlured = true"
                            />
                            <div class="invalid-feedback">
                              {{ passRequireMsg }}
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
                              v-model.trim="newPassword"
                              autocomplete="false"
                              v-bind:class="{
                                'form-control': true,
                                'is-invalid':
                                  !validPassword(newPassword) &&
                                  newPasswordBlured,
                              }"
                              v-bind:style="[
                                !validPassword(newPassword) && newPasswordBlured
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
                              v-model.trim="confirmNewPassword"
                              autocomplete="false"
                              v-bind:class="{
                                'form-control': true,
                                'is-invalid':
                                  !validPassword(confirmNewPassword) &&
                                  confirmNewPasswordBlured,
                              }"
                              v-bind:style="[
                                !validPassword(confirmNewPassword) &&
                                confirmNewPasswordBlured
                                  ? { 'margin-bottom': '0px' }
                                  : { 'margin-bottom': '20px' },
                              ]"
                              v-on:blur="confirmNewPasswordBlured = true"
                            />
                            <div class="invalid-feedback">
                              {{ passRequireMsg }}
                            </div>
                          </td>
                        </tr>
                      </div>
                      <!-- ボタンエリア -->
                      <div class="sign-in" style="margin-left: 70px">
                        <button>
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
