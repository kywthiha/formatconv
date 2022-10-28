<!--
    クラス名 : TotpForm
    概要 : 多要素認証ONの場合、ワンタイムパスワード入力処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import { ref, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import store from "../../store/index";
import { POOL_DATA } from "../../config/cognito";
import { useRoute, useRouter } from "vue-router";
import LoginHeaderForm from "../auth/LoginHeaderForm.vue";
import { useI18n } from "vue-i18n";
import { handleKeyDown, exceptionError } from "../common/common";
import validation from "../../hooks/validation";

export default {
  components: {
    QrcodeVue,
    LoginHeaderForm,
  },
  setup() {
    const route = useRoute();
    let router = useRouter();
    const isEnabled = ref(false);
    const qrData = ref("");
    const showQRCode = ref(false);
    const qrCode = ref("");
    const checkedValue = computed(() => store.state.authModule.toggleStatus);
    // 英語変換対応
    const { t } = useI18n();
    let message = ref("");
    let messageType = ref("");
    const { validVerificationCode, verificationCodeRequireMsg } = validation();
    const qrCodeBlured = ref(false);
    let param = t("screenItemProperties.totpForm.mfaCode");
    let disableBtn = ref(false);

    // メッセージを隠す
    function hideAlert() {
      message.value = "";
    }

    function isValid() {
      if (!validVerificationCode(qrCode.value, param)) {
        qrCodeBlured.value = true;
        disableBtn.value = false;
        return false;
      }

      return true;
    }

    // 新しい Qr コードを作成する
    function newQRCode() {
      //　「MFAを有効にする」のチェックを外すと、MFAが無効になる
      if (mfaValue.value === true) {
        setMFA(false);
        return;
      }

      showQRCode.value = true;

      // Cognito ユーザープールへの参照を取得する
      const userPool = new CognitoUserPool(POOL_DATA);

      //　現在ログインしているユーザーを取得する
      const cognitoUser = userPool.getCurrentUser();
      // cognitoUser.setSignInUserSession(store.getters.session);
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
          messageType.value = "danger";
          message.value = exceptionError(err.name);
        },
      });
    }

    // MFA を確認する
    function verifyMFA() {
      disableBtn.value = true;

      if (!isValid()) {
        return;
      }
      // Cognito ユーザープールへの参照を取得する
      const userPool = new CognitoUserPool(POOL_DATA);

      //　現在ログインしているユーザーを取得する
      const cognitoUser = userPool.getCurrentUser();
      cognitoUser.setSignInUserSession(store.getters.session);

      // MFA コードを検証し、ソフトウェア トークンをユーザー プロファイルにリンクする
      cognitoUser.verifySoftwareToken(qrCode.value, "SoftwareToken", {
        onSuccess: function (result) {
          setMFA(true);
          message.value = t("successMessages.I0002", {
            param1: t("screenItemProperties.totpForm.enableMultiFactorAuth"),
          });
          showQRCode.value = false;
          disableBtn.value = false;
        },
        onFailure: function (err) {
          messageType.value = "danger";
          message.value = exceptionError(err.name);
          disableBtn.value = false;
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
          if (err) {
            messageType.value = "danger";
            message.value = exceptionError(err.name);
            disableBtn.value = false;
          }

          store.dispatch("setMFA", isEnabled);
          console.log("setUserMfaPreference call result " + result);
        }
      );
    }

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      return store.getters.isMFAEnabled;
    });

    function cancel() {
      router.replace({
        name: "fileUpload",
      });
    }

    if (checkedValue.value !== null || checkedValue.value !== undefined) {
      newQRCode();
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
      messageType,
      checkedValue,
      hideAlert,
      handleKeyDown,
      validVerificationCode,
      verificationCodeRequireMsg,
      qrCodeBlured,
      param,
      isValid,
      disableBtn,
    };
  },
};
</script>
<template>
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
        <form @submit.prevent="verifyMFA" @keydown="handleKeyDown">
          <div class="row">
            <div class="col-12 text-start">
              <div>
                <div class="row">
                  <div class="mb-3 text-center">
                    <div class="scanner-lbl">
                      {{ $t("screenItemProperties.totpForm.title") }}
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
                  <div class="mt-1 text-center">
                    <p>{{ $t("screenItemProperties.totpForm.mfaCode") }}</p>
                    <div class="row text-center">
                      <div class="col-4 offset-md-4 mb-2">
                        <div class="input-group">
                          <input
                            type="text"
                            v-model.trim="qrCode"
                            maxlength="6"
                            v-bind:class="{
                              'form-control': true,
                              'is-invalid':
                                !validVerificationCode(qrCode, param) &&
                                qrCodeBlured,
                            }"
                            v-bind:style="[
                              !validVerificationCode(qrCode, param) &&
                              qrCodeeBlured
                                ? { 'margin-bottom': '0px' }
                                : { 'margin-bottom': '20px' },
                            ]"
                            v-on:blur="qrCodeBlured = true"
                            autocomplete="false"
                          />
                          <div class="invalid-feedback">
                            {{ verificationCodeRequireMsg }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- ボタンエリア -->
                    <button class="mfa-cancel-btn mt-2 me-2" @click="cancel">
                      {{ $t("screenItemProperties.button.cancelBtn") }}
                    </button>
                    <button
                      class="mfa-confirm-btn mt-2 me-2"
                      :disabled="disableBtn"
                    >
                      {{ $t("screenItemProperties.button.sendBtn") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
    </body-display>
  </div>
</template>

<style>
.mfa {
  width: 900px;
}
</style>
