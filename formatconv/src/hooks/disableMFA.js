import { POOL_DATA } from "../config/cognito";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { useStore } from "vuex";
import store from "../store/index";
function disableMFA() {
  // Cognito ユーザープールへの参照を取得する
  const userPool = new CognitoUserPool(POOL_DATA);

  // 現在ログインしているユーザーを取得し、セッションを設定する
  const cognitoUser = userPool.getCurrentUser();

  cognitoUser.setSignInUserSession(store.getters.session);

  const totpMfaSettings = {
    PreferredMfa: false,
    Enabled: false,
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
      store.dispatch("setMFA", false);
      console.log("setUserMfaPreference call result " + result);
    }
  );
}
export default disableMFA;
