/*
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  SPDX-License-Identifier: MIT-0 
*/
import { ref } from "vue";
import { useI18n } from "vue-i18n";

// hooked used to set alert messages in UI
export default function useAlert() {
  const message = ref("");
  const messageStyleType = ref("alert-success");
  const { t } = useI18n();

  function setMessage(msg, type) {
    message.value = msg;
    messageStyleType.value = type;
  }

  function exceptionError(exceptionMessage) {
    if (exceptionMessage === "User is not confirmed.") {
      message.value = t("errorMessages.E0008");
    } else if (exceptionMessage === "Incorrect username or password.") {
      message.value = t("errorMessages.E0005");
    } else if (exceptionMessage === "User does not exist.") {
      message.value = t("errorMessages.E00011");
    } else if (
      exceptionMessage === "Attempt limit exceeded, please try after some time."
    ) {
      message.value = t("errorMessages.E00012");
    }
  }

  return {
    message,
    messageStyleType,
    setMessage,
    exceptionError,
  };
}
