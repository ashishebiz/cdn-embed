import { REDIRECT_DELAY, STATES } from "../constants";
import { redirectWithDelay } from "../helpers";
import { QRModuleOptions, VerificationState } from "../types";
import { getMessageHTML } from "../ui";

export const callbackModule = (() => {
  let container: HTMLElement | null = null;
  let generateQRCode: () => void;
  let successURL = "";
  let failURL = "";

  function setOptions(options: QRModuleOptions) {
    container = document.querySelector(options.qrCodeSelector);
    if (!container) return;
    generateQRCode = options.generateQRCodeFunction;
    successURL = options.successRedirectURL || "";
    failURL = options.failRedirectURL || "";
  }

  function handleState(state: VerificationState) {
    if (!container) return;
    const html = getMessageHTML(state);
    container.innerHTML = `<div class='w-100 h-100 align-content-center'>${html}</div>`;

    if (state === STATES.Timeout && generateQRCode) {
      document.getElementById("new-qr-button")?.addEventListener("click", generateQRCode);
    }
    if (state === STATES.Approved && successURL) {
      redirectWithDelay(successURL, REDIRECT_DELAY);
    }
    if ((state === STATES.RejectedByUser || state === STATES.RejectedByRequirement) && failURL) {
      redirectWithDelay(failURL, REDIRECT_DELAY);
    }
    if (state === STATES.SomethingWentWrong && failURL) {
      redirectWithDelay(failURL, REDIRECT_DELAY);
    }
  }

  return {
    setOptions,
    handleState,
    STATES,
  };
})();
