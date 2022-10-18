<!--
    クラス名 : TotpForm
    概要 : 多要素認証ONの場合、ワンタイムパスワード入力処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref, computed, onBeforeMount, onBeforeUpdate } from "vue";
import QrcodeVue from "qrcode.vue";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import useAlert from "../../hooks/alert";
import store from "../../store/index";
import { POOL_DATA } from "../../config/cognito";

export default {
  components: {
    QrcodeVue,
  },
  setup() {
    const isEnabled = ref(false);
    const qrData = ref("");
    const showQRCode = ref(false);
    const qrCode = ref("");

    const { message, messageStyleType, setMessage } = useAlert();

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    // 新しい Qr コードを作成する
    function newQRCode() {
      //　「MFAを有効にする」のチェックを外すと、MFAが無効になる
      if (mfaValue.value === true) {
        setMFA(false);
        setMessage(
          "MFA has successfully been disabled for your account.",
          "alert-success"
        );
        return;
      }

      showQRCode.value = true;

      // Cognito ユーザープールへの参照を取得する
      const userPool = new CognitoUserPool(POOL_DATA);

      //　現在ログインしているユーザーを取得する
      const cognitoUser = userPool.getCurrentUser();
      cognitoUser.setSignInUserSession(store.getters.session);

      //　ユーザーがスキャンするQRコードの画像データを作成する
      cognitoUser.associateSoftwareToken({
        onSuccess: function (result) {
          console.log(result);
        },
        associateSecretCode: function (secretCode) {
          qrData.value =
            "otpauth://totp/CognitoMFA:" +
            store.getters.email +
            "?secret=" +
            secretCode +
            "&issuer=CognitoJSPOC";
        },
        onFailure: function (err) {
          console.log(err);
          setMessage(
            "There was a problem generating MFA QR Code.",
            "alert-danger"
          );
        },
      });
    }

    // MFA を確認する
    function verifyMFA() {
      // Cognito ユーザープールへの参照を取得する
      const userPool = new CognitoUserPool(POOL_DATA);

      //　現在ログインしているユーザーを取得する
      const cognitoUser = userPool.getCurrentUser();
      cognitoUser.setSignInUserSession(store.getters.session);
      console.log(" store.getters.email ", store.getters.email);

      // MFA コードを検証し、ソフトウェア トークンをユーザー プロファイルにリンクする
      cognitoUser.verifySoftwareToken(qrCode.value, "SoftwareToken", {
        onSuccess: function (result) {
          setMFA(true);
          setMessage(
            "MFA has successfully been setup for your account.",
            "alert-success"
          );
          showQRCode.value = false;
        },
        onFailure: function (err) {
          console.log(err);
          setMessage(
            err.message || "There was a problem confirming MFA Code.",
            "alert-danger"
          );
        },
      });
    }

    // ユーザー アカウントの MFA を有効または無効にするメソッド
    function setMFA(isEnabled) {
      // Cognito ユーザープールへの参照を取得する
      const userPool = new CognitoUserPool(POOL_DATA);

      // 現在ログインしているユーザーを取得し、セッションを設定する
      const cognitoUser = userPool.getCurrentUser();

      cognitoUser.setSignInUserSession(store.getters.session);

      const totpMfaSettings = {
        PreferredMfa: isEnabled,
        Enabled: isEnabled,
      };

      // ユーザーの MFA プリファレンスを設定する
      cognitoUser.setUserMfaPreference(
        null,
        totpMfaSettings,
        function (err, result) {
          console.log("sets a users MFA preference ", totpMfaSettings);
          if (err) {
            console.log(err);
          }

          store.dispatch("setMFA", isEnabled);
          console.log("setUserMfaPreference call result " + result);
        }
      );
    }

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      console.log(`MFA enabled - ${store.getters.isMFAEnabled}`);
      return store.getters.isMFAEnabled;
    });

    function cancel() {
      showQRCode.value = false;
      setMessage("MFA setup cancelled", "alert-success");
    }

    return {
      isEnabled,
      setMFA,
      mfaValue,
      qrData,
      newQRCode,
      showQRCode,
      qrCode,
      verifyMFA,
      cancel,
      message,
      messageStyleType,
      setMessage,
    };
  },
};
</script>
<template>
  <div>
    <header-display>
      <template v-slot:register-slot>
        <router-link to="#"
          ><button>
            <span class="figcaption">アカウント名：ｘｘｘ</span>
          </button></router-link
        >
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
        <div class="row">
          <div class="col-12 text-start">
            <div>
              <div class="row">
                <div class="row" v-if="!showQRCode">
                  <table>
                    <!-- Enabled MFA checkbox -->
                    <tr>
                      <td><label class="enable-label">Enabled MFA</label></td>
                      <td>
                        <input
                          type="checkbox"
                          :value="mfaValue"
                          v-model="mfaValue"
                          @change="newQRCode($event)"
                        />
                      </td>
                    </tr>
                  </table>
                </div>
                <div v-if="showQRCode" class="mb-3 text-center">
                  <div class="scanner-lbl">
                    Scan QR Code using Authy, Microsoft Authenticator or Google
                    Authenticator
                  </div>
                  <div class="mt-3">
                    <qrcode-vue
                      :value="qrData"
                      :size="200"
                      level="H"
                    ></qrcode-vue>
                  </div>
                </div>
                <hr />
                <div v-if="showQRCode" class="mt-1 text-center">
                  <p>Enter MFA Code</p>
                  <div class="row text-center">
                    <div class="col-4 offset-md-4 mb-2">
                      <div class="input-group">
                        <input
                          type="text"
                          v-model="qrCode"
                          class="form-control form-control-sm"
                          maxlength="6"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <!-- ボタンエリア -->
                  <button class="mfa-cancel-btn mt-2 me-2" @click="cancel">
                    Cancel
                  </button>
                  <button class="mfa-confirm-btn mt-2 me-2" @click="verifyMFA">
                    Confirm MFA Setup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </body-display>
  </div>
</template>

<style>
.mfa {
  width: 900px;
}
</style>
