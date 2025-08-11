import { callbackModule, IdentityVerifier } from "./api";
import { LOG_CONTAINER_SELECTOR, QR_CONTAINER_SELECTOR } from "./constants";
import { errorLog, extractQueryParams, infoLog } from "./helpers";

declare global {
  interface Window {
    bitIdentityVerification: InstanceType<typeof IdentityVerifier>;
  }
}

(() => {
  const { apiKey, successRedirectURL, failRedirectURL, notificationURL } = extractQueryParams();
  infoLog({ apiKey, successRedirectURL, failRedirectURL, notificationURL });

  if (!apiKey) return errorLog("Missing 'apiKey' in script tag. Example usage: <script src='...main.js data-api-key=your-api-key'>");

  const verifier = new IdentityVerifier(apiKey);

  verifier.configure({
    qrContainerSelector: QR_CONTAINER_SELECTOR,
    logContainerSelector: LOG_CONTAINER_SELECTOR,
    successRedirectURL,
    failRedirectURL,
    notificationURL,
    onVerificationWaitingForScan: () => callbackModule.handleState(callbackModule.STATES.WaitingForScan),
    onVerificationSuccess: () => callbackModule.handleState(callbackModule.STATES.Approved),
    onVerificationFailure: () => callbackModule.handleState(callbackModule.STATES.SomethingWentWrong),
    onVerificationScanning: () => callbackModule.handleState(callbackModule.STATES.Scanned),
    onVerificationRejectedByUser: () => callbackModule.handleState(callbackModule.STATES.RejectedByUser),
    onVerificationRejectedByRequirements: () => callbackModule.handleState(callbackModule.STATES.RejectedByRequirement),
    onVerificationTimeout: () => callbackModule.handleState(callbackModule.STATES.Timeout),
  });

  callbackModule.setOptions({
    qrCodeSelector: QR_CONTAINER_SELECTOR,
    generateQRCodeFunction: () => verifier.validateIdentityAndGenerateQRCode(),
    successRedirectURL,
    failRedirectURL,
  });

  // Set it in global scope
  window["bitIdentityVerification"] = verifier;

  verifier.validateIdentityAndGenerateQRCode();
})();
