import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SignUp from "../components/auth/SignUpForm.vue";
import FileUpload from "../components/FileChange/FileUploadForm.vue";
import MFASettings from "../components/auth/TotpForm.vue";
import PasswordResetForm from "../components/auth/PasswordResetForm.vue";
import Confirm from "../components/auth/ConfirmAccountForm.vue";
import store from "../store/index.js";
import ChangePasswordForm from "../components/auth/ChangePasswordForm.vue";
import SigninForm from "../views/Signin.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      beforeEnter: isAuthenticated,
    },
    {
      path: "/signin",
      name: "signin",
      component: SigninForm,
    },
    {
      path: "/signup",
      name: "signup",
      component: SignUp,
    },
    {
      path: "/resetPassword",
      name: "resetPassword",
      component: PasswordResetForm,
    },
    {
      path: "/confirm",
      name: "confirm",
      component: Confirm,
    },
    {
      path: "/fileUpload",
      name: "fileUpload",
      component: FileUpload,
      beforeEnter: isAuthenticated,
    },
    {
      path: "/mfa",
      name: "Mfa",
      component: MFASettings,
      beforeEnter: isAuthenticated,
    },
    {
      path: "/changePassword",
      name: "ChangePassword",
      component: ChangePasswordForm,
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
