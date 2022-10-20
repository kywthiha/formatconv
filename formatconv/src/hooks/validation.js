import { ref } from "vue";
import { useI18n } from "vue-i18n";

// hooked used to set validation messages in UI
export default function FormValidation() {
  let passRequireMsg = ref("");
  let emailRequireMsg = ref("");
  const { t } = useI18n();

  function validPassword(password) {
    var rePassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!rePassword.test(password)) {
      if (password.length === 0) {
        passRequireMsg.value = t("errorMessages.E0001", {
          param1: "パスワード",
        });
      } else if (password.length > 0 && password.length < 8) {
        passRequireMsg.value = t("errorMessages.E0003", {
          param3: "パスワード",
        });
      } else {
        passRequireMsg.value = t("errorMessages.E0002", {
          param2: "パスワード",
        });
      }
    }
    return rePassword.test(password);
  }

  function validEmail(email) {
    var reMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!reMail.test(email)) {
      if (email.length === 0) {
        emailRequireMsg.value = t("errorMessages.E0001", {
          param1: "メール",
        });
      } else {
        emailRequireMsg.value = t("errorMessages.E0002", {
          param2: "メール",
        });
      }
    }
    return reMail.test(email);
  }

  return {
    validPassword,
    passRequireMsg,
    validEmail,
    emailRequireMsg,
  };
}
