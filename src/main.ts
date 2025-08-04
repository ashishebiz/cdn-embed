import { IdentityVerifier } from "./api";
import { LOG_CONTAINER_SELECTOR, QR_CONTAINER_SELECTOR } from "./constants";
import { errorLog, extractQueryParams, infoLog } from "./helpers";

(() => {
  const { apiKey, successURL, failureURL, notificationURL } = extractQueryParams();
  infoLog({ apiKey, successURL, failureURL, notificationURL });

  if (!apiKey) return errorLog("Missing 'apiKey' in script tag. Example usage: <script src='...main.js data-api-key=your-api-key'>");

  const verifier = new IdentityVerifier();

  verifier.configure({
    apiKey,
    qrContainerSelector: QR_CONTAINER_SELECTOR,
    logContainerSelector: LOG_CONTAINER_SELECTOR,
    successRedirectURL: successURL,
    failRedirectURL: failureURL,
  });

  verifier.validateIdentityAndGenerateQRCode();
})();
