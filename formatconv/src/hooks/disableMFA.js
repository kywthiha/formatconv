import { POOL_DATA } from "../config/cognito";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import store from "../store/index";

// MFA ステータスを無効にする
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
  cognitoUser.setUserMfaPreference(null, totpMfaSettings, function (err) {
    if (err) {
      console.log(err);
    }
    store.dispatch("setMFA", false);
  });
}
export default disableMFA;
