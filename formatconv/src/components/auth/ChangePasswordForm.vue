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

export default {
  setup() {
    const router = useRouter();
    const store = useStore();
    const oldPassword = ref("");
    const newPassword = ref("");
    let name = ref(null);

    const profilename = computed(() => store.state.authModule.name);

    // 認証済みメールでコードを送信する
    function changePassword() {
      const userPool = new CognitoUserPool(POOL_DATA);
      let cognitoUser = userPool.getCurrentUser();
      console.log(cognitoUser);

      // cognito ユーザーのセッションを取得する
      // 取得できないと、「User is not authenticated」エラーが発生した
      cognitoUser.getSession(function (err, session) {
        console.log("hello ", session.idToken.payload.name);
        name = session.idToken.payload.name;
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

    function validPassword(password) {
      var rePassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!rePassword.test(password)) {
        // if (password.length === 0) {
        //   passRequireMsg.value = t("errorMessages.E0001", {
        //     requireValue: "パスワード",
        //   });
        // } else if (password.length > 0 && password.length < 8) {
        //   passRequireMsg.value = "パスワードは8文字以上でなければなりません。";
        // } else {
        //   passRequireMsg.value = t("errorMessages.E0002", {
        //     fromatValue: "パスワード",
        //   });
        // }
      }
      return rePassword.test(password);
    }

    function enableMFAStatus(event) {
      console.log("checkbox value ", event.target.checked);

      router.replace({
        name: "Mfa",
        query: { checkedValue: event.target.checked },
      });
    }

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      console.log(" in file upload ", store.getters.isMFAEnabled);
      return store.getters.isMFAEnabled;
    });

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    return {
      changePassword,
      oldPassword,
      newPassword,
      name,
      profilename,
      validPassword,
      enableMFAStatus,
      mfaValue,
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
                            <!-- <input
                              type="text"
                              v-model.trim="oldPassword"
                              autocomplete="false"
                            /> -->
                            <input
                              type="password"
                              v-model.trim="password"
                              autocomplete="false"
                              v-bind:class="{
                                'form-control': true,
                                'is-invalid':
                                  !validPassword(password) && passwordBlured,
                              }"
                              v-bind:style="[
                                !validPassword(password) && passwordBlured
                                  ? { 'margin-bottom': '0px' }
                                  : { 'margin-bottom': '20px' },
                              ]"
                              v-on:blur="passwordBlured = true"
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
                              v-model.trim="newPassword"
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
