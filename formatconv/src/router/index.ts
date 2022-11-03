import { createRouter, createWebHistory } from "vue-router";
import homeView from "../views/homeView.vue";
import signUpForm from "../components/auth/signUpForm.vue";
import fileUploadForm from "../components/fileConvert/fileUploadForm.vue";
import totpForm from "../components/auth/totpForm.vue";
import passwordResetForm from "../components/auth/passwordResetForm.vue";
import confirmAccountForm from "../components/auth/confirmAccountForm.vue";
import store from "../store/index.js";
import changePasswordForm from "../components/auth/changePasswordForm.vue";
import signInView from "../views/signInView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: homeView,
      beforeEnter: isAuthenticated,
    },
    {
      path: "/signin",
      name: "signin",
      component: signInView,
    },
    {
      path: "/signup",
      name: "signup",
      component: signUpForm,
    },
    {
      path: "/resetPassword",
      name: "resetPassword",
      component: passwordResetForm,
    },
    {
      path: "/confirm",
      name: "confirm",
      component: confirmAccountForm,
    },
    {
      path: "/fileUpload",
      name: "fileUpload",
      component: fileUploadForm,
      beforeEnter: isAuthenticated,
    },
    {
      path: "/mfa",
      name: "Mfa",
      component: totpForm,
      beforeEnter: isAuthenticated,
    },
    {
      path: "/changePassword",
      name: "ChangePassword",
      component: changePasswordForm,
      beforeEnter: isAuthenticated,
    },
  ],
});

function isAuthenticated(to, from, next) {
  if (store.getters.isAuthenticated) {
    next();
  } else {
    next("/signin");
  }
}

export default router;
