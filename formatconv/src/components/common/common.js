/*
    クラス名 : common
    概要 : システム共通機能
    作成者 : GICM
    作成日 : 2022/10/17　 
*/
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
      // 検証コードをまず入力してください。
      message.value = t("errorMessages.E0008");
      break;
    case "NotAuthorizedException":
      if (errrorMessage === "Password attempts exceeded") {
        // パスワード試行やコード検証試行の回数が上限に達しました。
        message.value = t("errorMessages.E0012");
      } else {
        // {param1}が間違えています。
        message.value = t("errorMessages.E0005", {
          param1: param,
        });
      }
      break;
    case "UsernameExistsException":
      // ユーザーが既に存在しています。
      message.value = t("errorMessages.E0010");
      break;
    case "UserNotFoundException":
      // ユーザーが登録されていません。
      message.value = t("errorMessages.E0011");
      break;
    case "InvalidPasswordException":
      // パスワードは半角英数字8文字以上入力してください。
      message.value = t("errorMessages.E0003", {
        param1: t("errorParams.password"),
      });
      break;
    case "CodeMismatchException":
      // 入力された検証コードが間違えています。
      message.value = t("errorMessages.E0006");
      break;
    case "LimitExceededException":
      // パスワード試行やコード検証試行の回数が上限に達しました。
      message.value = t("errorMessages.E0012");
      break;
    case "ExpiredCodeException":
      // 検証コードの有効期限が切れてしまいました。再発行してください。
      message.value = t("errorMessages.E0013");
      break;
    case "CodeDeliveryFailureException":
      // 検証コードが送信できません。システム管理者に問い合わせしてください。
      message.value = t("errorMessages.E0014");
      break;
    case "TooManyRequestsException":
      // リクエスト回数が多すぎます。
      message.value = t("errorMessages.E0015");
      break;
    case "InternalErrorException":
      // システムエラーが発生しました。システム管理者に問い合わせしてください。
      message.value = t("errorMessages.E0016");
      break;
    case "InvalidParameterException":
      // システムエラーが発生しました。システム管理者に問い合わせしてください。
      message.value = t("errorMessages.E0007");
      break;
    case "EnableSoftwareTokenMFAException":
      // 入力された検証コードが間違えています。
      message.value = t("errorMessages.E0006");
      break;
    default:
      // システムエラーが発生しました。システム管理者に問い合わせしてください。
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
