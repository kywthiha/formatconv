/*
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  SPDX-License-Identifier: MIT-0 
*/
import { ref } from "vue";
import { useI18n } from "vue-i18n";

// hooked used to set alert messages in UI
export default function useAlert() {
  const message = ref("");
  const { t } = useI18n();

  function setMessage(msg) {
    message.value = msg;
  }

  function exceptionError(exceptionMessage) {
    if (exceptionMessage === "UserNotConfirmedException") {
      message.value = t("errorMessages.E0008");
    } else if (exceptionMessage === "NotAuthorizedException") {
      message.value = t("errorMessages.E0005");
    } else if (exceptionMessage === "UserNotFoundException") {
      message.value = t("errorMessages.E00011");
    } else if (exceptionMessage === "LimitExceededException") {
      message.value = t("errorMessages.E00012");
    } else if (exceptionMessage === "TooManyRequestsException") {
      message.value = t("errorMessages.E00015");
    } else if (exceptionMessage === "InternalErrorException") {
      message.value = t("errorMessages.E00016");
    } else if (exceptionMessage === "CodeMismatchException") {
      message.value = t("errorMessages.E0006");
    }
  }

  return {
    message,
    setMessage,
    exceptionError,
  };
}
