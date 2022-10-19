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
import { useRoute, useRouter } from "vue-router";

export default {
  components: {
    QrcodeVue,
  },
  setup() {
    const route = useRoute();
    let router = useRouter();
    const isEnabled = ref(false);
    const qrData = ref("");
    const showQRCode = ref(false);
    const qrCode = ref("");

    const checkedValue = ref(route.query.checkedValue);
    console.log("tet ", checkedValue.value);

    const { message, messageStyleType, setMessage } = useAlert();

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    const profilename = computed(() => store.state.authModule.name);

    // 新しい Qr コードを作成する
    function newQRCode() {
      //　「MFAを有効にする」のチェックを外すと、MFAが無効になる
      if (mfaValue.value === true) {
        console.log("hello ", mfaValue.value);
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

    //  const checkedValue = computed(() => {
    //     'checkedValue': function(data) {
    //       console.log("checkedValue",data)
    //     // do your stuff here
    // }
    //  });

    // onMounted(() => {
    //   this.$root.$on("checkedValue", (msg) => {
    //     console.log(msg);
    //   });
    // });

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      console.log(`MFA enabled - ${store.getters.isMFAEnabled}`);
      return store.getters.isMFAEnabled;
    });

    function cancel() {
      showQRCode.value = false;
      setMessage("MFA setup cancelled", "alert-success");
    }

    if (checkedValue.value !== null || checkedValue.value !== undefined) {
      newQRCode();
    }

    function enableMFAStatus(event) {
      newQRCode();
    }

    function changePassword() {
      router.replace({
        name: "ChangePassword",
      });
    }

    const logout = () => {
      store.dispatch("logout");
      router.push({
        name: "signin",
        params: { message: "You have logged out" },
      });
    };

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
      profilename,
      checkedValue,
      enableMFAStatus,
      changePassword,
      logout,
    };
  },
};
</script>
<template>
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
        <div class="row">
          <div class="col-12 text-start">
            <div>
              <div class="row">
                <!-- <div class="row" v-if="!showQRCode">
                  <table> -->
                <!-- Enabled MFA checkbox -->
                <!-- <tr>
                      <td><label class="enable-label">Enabled MFA</label></td>
                      <td> -->
                <!-- <input
                          type="checkbox"
                          :value="mfaValue"
                          v-model="mfaValue"
                          @change="newQRCode($event)"
                        /> -->
                <!-- </td>
                    </tr>
                  </table>
                </div> -->
                <div v-if="showQRCode" class="mb-3 text-center">
                  <div class="scanner-lbl">
                    Authy, Microsoft Authenticator 又は Google Authenticator
                    を利用して、QAコードをスキャンします。
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
                  <p>MFAコード</p>
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
                    キャンセル
                  </button>
                  <button class="mfa-confirm-btn mt-2 me-2" @click="verifyMFA">
                    送信
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
