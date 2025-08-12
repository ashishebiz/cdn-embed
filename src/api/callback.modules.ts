import { REDIRECT_DELAY, STATES } from "../constants";
import { infoLog, redirectWithDelay } from "../helpers";
import { QRModuleOptions, VerificationState } from "../types";
import { getMessageHTML } from "../ui";

export const callbackModule = (() => {
  let container: HTMLElement | null = null;
  let generateQRCode: () => void;
  let successRedirectURL = "";
  let failRedirectURL = "";

  function setOptions(options: QRModuleOptions) {
    container = document.querySelector(options.qrCodeSelector);
    if (!container) {
      infoLog("QR Container not found", container);
      return;
    }
    generateQRCode = options.generateQRCodeFunction;
    successRedirectURL = options.successRedirectURL || "";
    failRedirectURL = options.failRedirectURL || "";
  }

  function handleState(state: VerificationState) {
    if (!container) {
      infoLog("QR Container not found", container);
      return;
    }
    const html = getMessageHTML(state);
    container.innerHTML = `<div style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        flex-direction: column;
        ">${html}</div>`;

    if (state === STATES.Timeout && generateQRCode) {
      document.getElementById("new-qr-button")?.addEventListener("click", generateQRCode);
    }
    if (state === STATES.Approved && successRedirectURL) {
      redirectWithDelay(successRedirectURL, REDIRECT_DELAY);
    }
    if ((state === STATES.RejectedByUser || state === STATES.RejectedByRequirement) && failRedirectURL) {
      redirectWithDelay(failRedirectURL, REDIRECT_DELAY);
    }
    if (state === STATES.SomethingWentWrong && failRedirectURL) {
      redirectWithDelay(failRedirectURL, REDIRECT_DELAY);
    }
  }

  return {
    setOptions,
    handleState,
    STATES,
  };
})();
