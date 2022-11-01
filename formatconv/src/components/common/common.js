import { ref } from "vue";
import i18n from "../../main";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";

// Enterキーイベント対応
export function handleKeyDown(e) {
  if (e.keyCode === 13 && e.srcElement.__vnode.type !== "button") {
    e.preventDefault();
  }
}

// 例外エラー対応
export function exceptionError(exceptionMessage, param, errrorMessage) {
  const { t } = i18n.global;
  const message = ref("");
  switch (exceptionMessage) {
    case "UserNotConfirmedException":
      message.value = t("errorMessages.E0008");
      break;
    case "NotAuthorizedException":
      if (errrorMessage === "Password attempts exceeded") {
        message.value = t("errorMessages.E0012");
      } else {
        message.value = t("errorMessages.E0005", {
          param1: param,
        });
      }
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
      // confirm(when edit manually in user pool )
      message.value =
        "Cannot reset password for the user as there is no registered/verified email or phone_number";
      break;
    case "EnableSoftwareTokenMFAException":
      // message.value = ;
      // code ko 1 lone 2 lone wrong htae yin
      message.value = t("errorMessages.E0006");
      break;
    default:
      message.value = t("errorMessages.E0016");
      break;
  }
  return message.value;
}

// トークンを取得する
export const getToken = () =>
  new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(POOL_DATA);
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          reject(err);
        }
        resolve(session.idToken.jwtToken);
      });
    } else {
      reject("Unauthorized");
    }
  });
