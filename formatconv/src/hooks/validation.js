import { ref } from "vue";
import { useI18n } from "vue-i18n";

// hooked used to set validation messages in UI
export default function FormValidation() {
  let passRequireMsg = ref("");
  let emailRequireMsg = ref("");
  let usernameRequireMsg = ref("");
  const { t } = useI18n();

  function validPassword(password) {
    var rePassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!rePassword.test(password)) {
      if (password.length === 0) {
        passRequireMsg.value = t("errorMessages.E0001", {
          param1: t("errorParams.password"),
        });
      } else if (password.length > 0 && password.length < 8) {
        passRequireMsg.value = t("errorMessages.E0003", {
          param1: t("errorParams.password"),
        });
      } else {
        passRequireMsg.value = t("errorMessages.E0002", {
          param1: t("errorParams.password"),
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
          param1: t("errorParams.email"),
        });
      } else {
        emailRequireMsg.value = t("errorMessages.E0002", {
          param1: t("errorParams.email"),
        });
      }
    }
    return reMail.test(email);
  }

  function validUsername(username) {
    var reUsername =
      /^(?=.{3,63}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
    if (!reUsername.test(username)) {
      usernameRequireMsg.value = t("errorMessages.E0002", {
        param1: t("errorParams.username"),
      });
    }
    return reUsername.test(username);
  }

  return {
    validPassword,
    passRequireMsg,
    validEmail,
    emailRequireMsg,
    validUsername,
    usernameRequireMsg,
  };
}
