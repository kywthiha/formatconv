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
import { POOL_DATA } from "../../config/cognito";

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

    // メッセージアラートのフックを設定する
    const { message, messageStyleType, setMessage } = useAlert();

    // コードを再送する
    function resendCode() {
      const userPool = new CognitoUserPool(POOL_DATA);
      const userData = {
        Username: username.value,
        Pool: userPool,
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.resendConfirmationCode(function (err, result) {
        if (result.CodeDeliveryDetails.Destination != null) {
          disableErrorMsg.value = true;
          successmsg.value =
            "確認コードが" + username.value + "に送信されます。";
        }
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
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
        if (!err) {
          setMessage(err.message, "alert-danger");
          return;
        }

        router.replace({
          name: "signin",
          params: {
            message: "You have successfully confirmed your account",
          },
        });
      });
    }

    function isValid() {
      const validationData = validateConfirmationForm({
        code: code.value,
        username: username.value,
      });

      if (!validationData.valid) {
        setMessage(validationData.message, "alert-danger");
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
      messageStyleType,
      isValid,
      errormsg,
      successmsg,
      disableErrorMsg,
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
      <body-display>
        <template v-slot:body>
          <div class="text-danger errormsg" v-if="!disableErrorMsg">
            <label>{{ errormsg }}</label>
          </div>
          <div class="text-success errormsg">
            <label>{{ successmsg }}</label>
          </div>
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
                <input type="text" v-model.trim="code" autocomplete="false" />
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
