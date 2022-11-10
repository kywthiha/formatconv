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

  // パスワード長さチェック
  function signinValidPassword(password, param) {
    if (password.length === 0) {
      // {param1}を入力してください。
      signinPassRequireMsg.value = t("errorMessages.E0001", {
        param1: param,
      });
      return false;
    } else {
      return true;
    }
  }

  // パスワードフォマットチェック
  function validPassword(password, param) {
    var rePassword = /^(?=.*[0-9])(?=.*[a-z])(?!.* ).{8,}$/;

    if (password.length === 0) {
      // {param1}を入力してください。
      passRequireMsg.value = t("errorMessages.E0001", {
        param1: param,
      });
    } else if (password.length > 0 && password.length < 8) {
      // {param1}は半角英数字8文字以上入力してください。
      passRequireMsg.value = t("errorMessages.E0003", {
        param1: param,
      });
    }
    return rePassword.test(password);
  }

  // パスワードやパスワード確認一致チェック
  function validConfirmPassword(
    confirmPassword,
    password,
    newPassParam,
    confirmPassParam
  ) {
    if (confirmPassword.length === 0) {
      validConfirmPwd.value = false;
      // {param1}を入力してください。
      confirmPasswordRequireMsg.value = t("errorMessages.E0001", {
        param1: confirmPassParam,
      });
    } else if (confirmPassword !== password) {
      validConfirmPwd.value = false;
      // {param1}や{param2}が不一致しています。
      confirmPasswordRequireMsg.value = t("errorMessages.E0004", {
        param1: newPassParam,
        param2: confirmPassParam,
      });
    } else {
      validConfirmPwd.value = true;
    }
    return validConfirmPwd.value;
  }

  // メールアドレスフォーマットチェック
  function validEmail(email) {
    var reMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (email.length === 0) {
      // メールアドレスを入力してください。
      emailRequireMsg.value = t("errorMessages.E0001", {
        param1: t("errorParams.mailAddress"),
      });
    } else if (!reMail.test(email)) {
      // メールアドレスフォーマットが正しくありません。
      emailRequireMsg.value = t("errorMessages.E0002", {
        param1: t("errorParams.mailAddress"),
      });
    }

    return reMail.test(email);
  }

  // アカウントユーザー名フォーマット変換
  function validUsername(username) {
    var reUsername = /^(?=.{3,63}$)[a-z0-9]+$/;

    if (username.length === 0) {
      // アカウント名を入力してください。
      usernameRequireMsg.value = t("errorMessages.E0001", {
        param1: t("errorParams.username"),
      });
    } else if (!reUsername.test(username)) {
      // アカウント名フォーマットが正しくありません。
      usernameRequireMsg.value = t("errorMessages.E0002", {
        param1: t("errorParams.username"),
      });
    }
    return reUsername.test(username);
  }

  // 検証コードフォーマットチェック
  function validVerificationCode(code, param, digitParam) {
    var regCode = /^[0-9]+$/;

    if (code.length === 0) {
      isValidVerificationCode.value = false;
      // {param1}を入力してください。
      verificationCodeRequireMsg.value = t("errorMessages.E0001", {
        param1: param,
      });
    } else if (!regCode.test(code)) {
      isValidVerificationCode.value = false;
      // {param1}を入力してください。
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
    signinValidPassword,                // パスワード長さチェック
    signinPassRequireMsg,
    validPassword,                      // パスワードフォマットチェック
    validConfirmPassword,               // パスワードやパスワード確認一致チェック
    passRequireMsg,
    confirmPasswordRequireMsg,
    validEmail,
    emailRequireMsg,
    validUsername,
    usernameRequireMsg,
    validVerificationCode,              // 検証コードフォーマットチェック
    verificationCodeRequireMsg,
  };
}
