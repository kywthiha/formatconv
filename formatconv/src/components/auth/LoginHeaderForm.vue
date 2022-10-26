<script>
import { computed } from "@vue/reactivity";
import { onBeforeMount, onBeforeUpdate } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import disableMFA from "../../hooks/disableMFA";

export default {
  setup() {
    const router = useRouter();
    const store = useStore();

    //　ユーザーに対して MFA が有効か無効かを格納する計算プロパティ
    const mfaValue = computed(() => {
      return store.getters.isMFAEnabled;
    });

    const profilename = computed(() => store.state.authModule.name);

    const logout = () => {
      store.dispatch("logout");
      router.push({
        name: "signin",
        params: { message: "You have logged out" },
      });
    };

    //　ログインしたユーザーの mFA の現在の状態を確認する
    onBeforeMount(function () {
      store.dispatch("fetchMFAValue");
    });

    onBeforeUpdate(function () {
      store.dispatch("fetchMFAValue");
    });

    function enableMFAStatus(event) {
      if (event.target.checked === true) {
        store.dispatch("setStatus", event.target.checked);
        router.replace({
          name: "Mfa",
        });
      } else {
        store.dispatch("setStatus", event.target.checked);
        disableMFA();
      }
    }

    function changePassword() {
      router.replace({
        name: "ChangePassword",
      });
    }

    return {
      mfaValue,
      enableMFAStatus,
      changePassword,
      profilename,
      logout,
    };
  },
};
</script>

<template>
  <header-display>
    <!-- <template v-slot:totp-slot>
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
    </template> -->
    <template v-slot:register-slot>
      <div class="row">
        <div class="col-6">
          <router-link to="/fileUpload"
            ><button style="width: 100px; margin-left: 70px">
              <span class="figcaption">ホーム</span>
            </button></router-link
          >
        </div>
        <div class="col-6">
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
              <li class="dropdown-item">
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
              </li>
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
                <a class="dropdown-item" href="#" @click.prevent="logout">{{
                  $t("screenItemProperties.common.logout")
                }}</a>
              </li>
            </ul>
          </div>
        </div>
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
</template>
