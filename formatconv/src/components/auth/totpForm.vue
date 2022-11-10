<!--
    クラス名 : totpForm
    概要 : 多要素認証ONの場合、ワンタイムパスワード入力処理画面
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script>
import { ref, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import store from "../../store/index";
import { POOL_DATA } from "../../config/cognito";
import { useRoute, useRouter } from "vue-router";
import loginHeaderForm from "./loginHeaderForm.vue";
import { useI18n } from "vue-i18n";
import { handleKeyDown, exceptionError } from "../common/common";
import validation from "../../hooks/validation";

export default {
  components: {
    QrcodeVue,
    loginHeaderForm,
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
    // MFAコード
    let param = t("screenItemProperties.totp.mfaCode");
    let disableBtn = ref(false);
    // 半角数字のみ
    const digitpass = t("screenItemProperties.signin.onlyDigit");

    // エラーメッセージエリアを隠す
    function hideAlert() {
      message.value = "";
    }

    // 入力チェック
    function isValid() {
      // 検証コードフォーマットチェック
      if (!validVerificationCode(qrCode.value, param)) {
        qrCodeBlured.value = true;
        disableBtn.value = false;
        return false;
      }
      return true;
    }

    // 新しいQRコードを作成する
    function newQRCode() {
      //　「MFAを有効にする」のチェックを外すと、MFAが無効になる
      if (mfaValue.value === true) {
        // ユーザー アカウントの MFA を無効にする
        setMFA(false);
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
          messageType.value = "success";
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
          // 例外エラー対応
          messageType.value = "danger";
          message.value = exceptionError(err.name);
        },
      });
    }

    // MFAを確認する
    function verifyMFA() {
      // 連続ボタン対応
      disableBtn.value = true;

      // 入力チェック
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
          // ユーザー アカウントの MFA を有効にする
          setMFA(true);
          messageType.value = "success";
          // 多要素認証の有効設定処理が完了しました。
          message.value = t("successMessages.I0002", {
            param1: t("screenItemProperties.totp.enableMultiFactorAuth"),
          });
          showQRCode.value = false;
          disableBtn.value = false;
          qrCode.value = "";
          qrCodeBlured.value = false;
        },
        onFailure: function (err) {
          // 例外エラー対応
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
            // 例外エラー対応
            messageType.value = "danger";
            message.value = exceptionError(err.name);
            disableBtn.value = false;
          }

          store.dispatch("setMFA", isEnabled);
        }
      );
    }

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      return store.getters.isMFAEnabled;
    });

    // キャンセルボタン
    function cancel() {
      router.replace({
        name: "fileUpload",
      });
    }

    // 新しいQRコードを出す
    if (checkedValue.value !== null || checkedValue.value !== undefined) {
      newQRCode();
    }

    return {
      isEnabled,
      setMFA,                       // ユーザー アカウントの MFA を有効または無効にする
      mfaValue,
      qrData,
      newQRCode,                    // 新しいQRコードを作成する
      showQRCode,
      qrCode,
      verifyMFA,                    // MFAを確認する
      cancel,                       // キャンセルボタン処理
      message,
      messageType,
      checkedValue,
      hideAlert,                    // エラーメッセージエリアを隠す
      handleKeyDown,                // Enterキーイベント対応
      validVerificationCode,        // 検証コードフォーマットチェック
      verificationCodeRequireMsg,
      qrCodeBlured,
      param,
      isValid,                      // 入力チェック
      disableBtn,
      digitpass,
    };
  },
};
</script>
<template>
  <div>
    <login-header-form></login-header-form>
    <!-- エラーメッセージ表示 -->
    <div class="alert-container">
      <div
        class="alert alert-dismissible align-items-center fade show"
        :class="[messageType == 'danger' ? 'alert-danger' : 'alert-success']"
        v-if="message"
        style="text-align: center"
      >
        <label>{{ message }}</label>
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>
    </div>
    <body-display>
      <template v-slot:body>
        <form @submit.prevent="verifyMFA" @keydown="handleKeyDown">
          <div class="row">
            <div class="col-12 text-start">
              <div>
                <div class="row">
                  <!-- QAコードを表示 -->
                  <div class="mb-3 text-center">
                    <div class="scanner-lbl">
                      <!-- Authy, Microsoft Authenticator 又は Google Authenticatorを利用して、QAコードをスキャンします。 -->
                      {{ $t("screenItemProperties.totp.title") }}
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
                    <!-- MFAコード -->
                    <p>{{ $t("screenItemProperties.totp.mfaCode") }}</p>
                    <div class="row justify-content-center">
                      <div class="col-auto">
                        <input
                          type="text"
                          v-model.trim="qrCode"
                          maxlength="6"
                          v-bind:class="{
                            'form-control': true,
                            'is-invalid':
                              !validVerificationCode(
                                qrCode,
                                param,
                                digitpass
                              ) && qrCodeBlured,
                          }"
                          v-bind:style="[
                            !validVerificationCode(qrCode, param, digitpass) &&
                            qrCodeBlured
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
                    <!-- ボタンエリア -->
                    <button class="mfa-cancel-btn mt-2" @click="cancel">
                      <!-- キャンセル -->
                      {{ $t("screenItemProperties.button.cancelBtn") }}
                    </button>
                    <button class="mfa-confirm-btn mt-2" :disabled="disableBtn">
                      <!-- 送信 -->
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
