import { ref } from "vue";
import { useI18n } from "vue-i18n";

// hooked used to set validation messages in UI
export default function FormValidation() {
  let passRequireMsg = ref("");
  let confirmPasswordRequireMsg = ref("");
  let emailRequireMsg = ref("");
  let usernameRequireMsg = ref("");
  let verificationCodeRequireMsg = ref("");
  let validConfirmPwd = ref(true);
  let isValidVerificationCode = ref(true);

  const { t } = useI18n();

  function validPassword(password) {
    // var rePassword = /^(?=.{8,}$)[a-z0-9]+$/;

    var rePassword = /^(?=.*[0-9])(?=.*[a-z])(?!.* ).{8,}$/;
    // var rePassword =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;
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

    console.log("hello test password validation ", rePassword.test(password));

    return rePassword.test(password);
  }

  function validConfirmPassword(confirmPassword, password) {
    var rePassword = /^(?=.*[0-9])(?=.*[a-z])(?!.* ).{8,}$/;

    if (confirmPassword.length === 0) {
      validConfirmPwd.value = false;
      confirmPasswordRequireMsg.value = t("errorMessages.E0001", {
        param1: t("errorParams.confirmPassword"),
      });
    } else if (confirmPassword.length > 0 && confirmPassword.length < 8) {
      validConfirmPwd.value = false;
      confirmPasswordRequireMsg.value = t("errorMessages.E0003", {
        param1: t("errorParams.confirmPassword"),
      });
    } else if (confirmPassword !== password) {
      console.log("not same else if");
      validConfirmPwd.value = false;
      confirmPasswordRequireMsg.value = t("errorMessages.E0004", {
        param1: t("errorParams.password"),
        param2: t("errorParams.confirmPassword"),
      });
    } else if (!rePassword.test(confirmPassword)) {
      validConfirmPwd.value = false;
      confirmPasswordRequireMsg.value = t("errorMessages.E0002", {
        param1: t("errorParams.confirmPassword"),
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
    // var reUsername = /^(?=.{3,63}$)(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$/;

    var reUsername = /^(?=.{3,63}$)[a-z0-9]+$/;

    if (username.length === 0) {
      console.log(" in required errror");
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

  function validVerificationCode(code) {
    console.log(code);
    console.log(code.length);
    if (code.length === 0) {
      console.log("heelllo");
      isValidVerificationCode.value = false;
      verificationCodeRequireMsg.value = t("errorMessages.E0001", {
        param1: t("errorParams.verificationCode"),
      });
    } else {
      isValidVerificationCode.value = true;
    }
    console.log(" valid ", isValidVerificationCode.value);
    return isValidVerificationCode.value;
  }

  return {
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
