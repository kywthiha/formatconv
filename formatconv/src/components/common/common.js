import { ref } from "vue";
import i18n from "../../main";

// Enterキーイベント対応
export function handleKeyDown(e) {
  if (e.keyCode === 13 && e.srcElement.__vnode.type !== "button") {
    e.preventDefault();
  }
}

// 例外エラー対応
export function exceptionError(exceptionMessage) {
  // alert("helo");

  const { t } = i18n.global;
  const message = ref("");
  switch (exceptionMessage) {
    case "UserNotConfirmedException":
      message.value = t("errorMessages.E0008");
      break;
    case "NotAuthorizedException":
      message.value = t("errorMessages.E0005");
      break;
    case "UsernameExistsException":
      message.value = t("errorMessages.E0010");
      break;
    case "UserNotFoundException":
      message.value = t("errorMessages.E0011");
      break;
    case "InvalidPasswordException":
      message.value = t("errorMessages.E0003", {
        param1: t("errorParams.password"),
      });
      break;
    case "CodeMismatchException":
      message.value = t("errorMessages.E0006");
      break;
    case "LimitExceededException":
      message.value = t("errorMessages.E0012");
      break;
    case "ExpiredCodeException":
      message.value = t("errorMessages.E0013");
      break;
    case "CodeDeliveryFailureException":
      message.value = t("errorMessages.E0014");
      break;
    case "TooManyRequestsException":
      message.value = t("errorMessages.E0015");
      break;
    case "InternalErrorException":
      message.value = t("errorMessages.E0016");
      break;
    case "InvalidParameterException":
      // message.value = t("errorMessages.E0016");
      message.value =
        "Cannot reset password for the user as there is no registered/verified email or phone_number";
      break;
    default:
      message.value = t("errorMessages.E0016");
      break;
  }
  return message.value;
}
