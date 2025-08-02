import { AgeVerification, callbackModule } from "./api";
import { extractQueryParams, infoLog } from "./helpers";

(() => {
  const { apiKey, successURL, failureURL, notificationURL } = extractQueryParams();
  infoLog({ apiKey, successURL, failureURL, notificationURL });

  if (!apiKey) return console.error("Missing apiKey");

  const verifier = new AgeVerification();

  verifier.configure({
    apiKey,
    qrContainerSelector: "#embed-qr-code",
    logContainerSelector: "#embed-qr-code-logs",
    onVerificationWaitingForScan: () => callbackModule.handleState(callbackModule.STATES.WaitingForScan),
    onVerificationSuccess: () => callbackModule.handleState(callbackModule.STATES.Approved),
    onVerificationFailure: () => callbackModule.handleState(callbackModule.STATES.Timeout),
    onVerificationScanning: () => callbackModule.handleState(callbackModule.STATES.Scanned),
    onVerificationRejectedByUser: () => callbackModule.handleState(callbackModule.STATES.RejectedByUser),
    onVerificationRejectedByRequirements: () => callbackModule.handleState(callbackModule.STATES.RejectedByRequirement),
    onVerificationTimeout: () => callbackModule.handleState(callbackModule.STATES.Timeout),
  });

  verifier.generateQRCode();

  callbackModule.setOptions({
    qrCodeSelector: "#embed-qr-code-qr",
    generateQRCodeFunction: () => verifier.generateQRCode(),
    successRedirectURL: successURL,
    failRedirectURL: failureURL,
  });
})();
