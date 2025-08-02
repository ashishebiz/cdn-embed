import { AgeVerification, callbackModule } from "./api";
import { extractQueryParams } from "./helpers";

(() => {
  const { apiKey, successURL, failureURL } = extractQueryParams();
  if (!apiKey) return console.error("Missing apiKey");

  const verifier = new AgeVerification();

  verifier.configure({
    apiKey,
    qrContainerSelector: "#bit-age-verification-qr",
    logContainerSelector: "#bit-age-verification-logs",
    onVerificationSuccess: () => callbackModule.handleState(callbackModule.STATES.Approved),
    onVerificationFailure: () => callbackModule.handleState(callbackModule.STATES.Timeout),
    onVerificationScanning: () => callbackModule.handleState(callbackModule.STATES.Scanned),
    onVerificationRejectedByUser: () => callbackModule.handleState(callbackModule.STATES.RejectedByUser),
    onVerificationRejectedByRequirements: () => callbackModule.handleState(callbackModule.STATES.RejectedByRequirement),
    onVerificationTimeout: () => callbackModule.handleState(callbackModule.STATES.Timeout),
  });

  verifier.generateQRCode();

  callbackModule.setOptions({
    qrCodeSelector: "#bit-age-verification-qr",
    generateQRCodeFunction: () => verifier.generateQRCode(),
    successRedirectURL: successURL,
    failRedirectURL: failureURL,
  });
})();
