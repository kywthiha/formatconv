<script>
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { useStore } from "vuex";
import { POOL_DATA } from "./config/cognito";

export default {
  setup() {
    const store = useStore();

    // gets reference to the Cognito user pool
    const userPool = new CognitoUserPool(POOL_DATA);

    //gets current logged in user
    const cognitoUser = userPool.getCurrentUser();

    console.log(cognitoUser);

    // logic to check if users session is still valid
    if (cognitoUser) {
      console.log(cognitoUser);
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
