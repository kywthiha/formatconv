<!--
    クラス名 : ChangePasswordForm
    概要 : パスワード変更処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/18　 
-->
<script>
import { ref } from "vue";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const oldPassword = ref("");
    const newPassword = ref("");
    let name = ref(null);

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
            // cognitoUser.getUserAttributes(function (err, result) {
            //   if (err) {
            //     alert(err.message || JSON.stringify(err));
            //     return;
            //   }

            //   for (var i = 0; i < result.length; i++) {
            //     if (result[i].getName() === "name") {
            //       name = result[i].getValue();
            //       console.log("name ", name);
            //     }
            //     console.log(
            //       "attribute " +
            //         result[i].getName() +
            //         " has value " +
            //         result[i].getValue()
            //     );
            //   }
            // });

            router.replace({
              name: "fileUpload",
            });
          }
        }
      );
    }

    return {
      changePassword,
      oldPassword,
      newPassword,
      name,
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
                              type="text"
                              v-model.trim="oldPassword"
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
                              v-model.trim="newPassword"
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
