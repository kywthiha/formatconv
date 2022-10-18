import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SignUp from "../components/auth/SignUpForm.vue";
import FileUpload from "../components/FileChange/FileUploadForm.vue";
import MFASettings from "../components/auth/TotpForm.vue";
import PasswordResetForm from "../components/auth/PasswordResetForm.vue";
import Confirm from "../components/auth/ConfirmAccountForm.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/signin",
      name: "signin",
      component: () => import("../views/Signin.vue"),
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
    },
    {
      path: "/mfa",
      name: "Mfa",
      component: MFASettings,
    },
  ],
});

export default router;
