<script>
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { useStore } from "vuex";
import { POOL_DATA } from "./config/cognito";
import { useSocket } from "./hooks/useSocket";

export default {
  setup() {
    const store = useStore();
    useSocket();

    // Cognito ユーザープールへの参照を取得する
    const userPool = new CognitoUserPool(POOL_DATA);

    // 現在ログインしているユーザーを取得する
    const cognitoUser = userPool.getCurrentUser();

    // ユーザーのセッションがまだ有効かどうかを確認する
    if (cognitoUser) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          console.log(err.message || JSON.stringify(err));
          return;
        }

        store.dispatch("setIDToken", session.idToken.jwtToken);
        store.dispatch("setAccessToken", session.accessToken.jwtToken);
        store.dispatch("setEmail", session.idToken.payload.email);
        store.dispatch("setSession", session);
        store.dispatch(
          "setUsername",
          session.idToken.payload["cognito:username"]
        );
        store.dispatch("setIsAuthenticated", true);
        store.dispatch("setName", session.idToken.payload.name);

        console.log("session is valid: " + session.isValid());
      });
    } else {
      store.dispatch("setIsAuthenticated", false);
    }
  },
};
</script>

<template>
  <router-view />
</template>
