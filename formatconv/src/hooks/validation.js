import { ref } from "vue";
import { useI18n } from "vue-i18n";

// UI で検証メッセージを設定するために使用されるフック
export default function FormValidation() {
  let signinPassRequireMsg = ref("");
  let passRequireMsg = ref("");
  let confirmPasswordRequireMsg = ref("");
  let emailRequireMsg = ref("");
  let usernameRequireMsg = ref("");
  let verificationCodeRequireMsg = ref("");
  let validConfirmPwd = ref(true);
  let isValidVerificationCode = ref(true);

  const { t } = useI18n();

  function signinValidPassword(password, param) {
    if (password.length === 0) {
      signinPassRequireMsg.value = t("errorMessages.E0001", {
        param1: param,
      });
      return false;
    } else {
      return true;
    }
  }

  function validPassword(password, param) {
    var rePassword = /^(?=.*[0-9])(?=.*[a-z])(?!.* ).{8,}$/;

    if (password.length === 0) {
      passRequireMsg.value = t("errorMessages.E0001", {
        param1: param,
      });
    } else if (password.length > 0 && password.length < 8) {
      passRequireMsg.value = t("errorMessages.E0003", {
        param1: param,
      });
    }
    return rePassword.test(password);
  }

  function validConfirmPassword(
    confirmPassword,
    password,
    newPassParam,
    confirmPassParam
  ) {
    if (confirmPassword.length === 0) {
      validConfirmPwd.value = false;
      confirmPasswordRequireMsg.value = t("errorMessages.E0001", {
        param1: confirmPassParam,
      });
    } else if (confirmPassword !== password) {
      validConfirmPwd.value = false;
      confirmPasswordRequireMsg.value = t("errorMessages.E0004", {
        param1: newPassParam,
        param2: confirmPassParam,
      });
    } else {
      validConfirmPwd.value = true;
    }
    return validConfirmPwd.value;
  }

  function validEmail(email) {
    var reMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (email.length === 0) {
      emailRequireMsg.value = t("errorMessages.E0001", {
        param1: t("errorParams.email"),
      });
    } else if (!reMail.test(email)) {
      emailRequireMsg.value = t("errorMessages.E0002", {
        param1: t("errorParams.email"),
      });
    }

    return reMail.test(email);
  }

  function validUsername(username) {
    var reUsername = /^(?=.{3,63}$)[a-z0-9]+$/;

    if (username.length === 0) {
      usernameRequireMsg.value = t("errorMessages.E0001", {
        param1: t("errorParams.username"),
      });
    } else if (!reUsername.test(username)) {
      usernameRequireMsg.value = t("errorMessages.E0002", {
        param1: t("errorParams.username"),
      });
    }
    return reUsername.test(username);
  }

  function validVerificationCode(code, param, digitParam) {
    var regCode = /^[0-9]+$/;

    if (code.length === 0) {
      isValidVerificationCode.value = false;
      verificationCodeRequireMsg.value = t("errorMessages.E0001", {
        param1: param,
      });
    } else if (!regCode.test(code)) {
      isValidVerificationCode.value = false;
      verificationCodeRequireMsg.value = t("errorMessages.E0001", {
        param1: digitParam,
      });
      return false;
    } else {
      isValidVerificationCode.value = true;
    }
    return isValidVerificationCode.value;
  }

  return {
    signinValidPassword,
    signinPassRequireMsg,
    validPassword,
    validConfirmPassword,
    passRequireMsg,
    confirmPasswordRequireMsg,
    validEmail,
    emailRequireMsg,
    validUsername,
    usernameRequireMsg,
    validVerificationCode,
    verificationCodeRequireMsg,
  };
}
