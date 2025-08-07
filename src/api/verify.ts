import {
  BASE_API_URL,
  POLLING_INTERVAL,
  STATES,
  AGE_APP_POLLING_ENDPOINT,
  REDIRECT_DELAY,
  VALIDATE_IDENTITY_ENDPOINT,
  SIGN_KEY_HEADER,
  ORG_ID_HEADER,
  CONTEXT_TYPES,
  AGE_APP_QR_GENERATION_ENDPOINT,
} from "../constants";
import { errorLog, getElement, getGeolocation, infoLog, logData, redirectWithDelay, sleep } from "../helpers";
import { IGeolocation, IVerificationOptions, VerificationState } from "../types";
import { getMessageHTML, showErrorMessageHTML } from "../ui";
import { getRequest, postRequest } from "./request";

export class IdentityVerifier {
  private options!: IVerificationOptions;
  private pollingId: number | null = null;
  private qrContainer: HTMLElement | null = null;
  private location: IGeolocation | null = null;

  configure(options: IVerificationOptions) {
    this.options = options;
  }

  private displayQRCode(qrCodeUrl: string, deepLink: string) {
    this.qrContainer = getElement(this.options.qrContainerSelector);
    if (!this.qrContainer) {
      errorLog("QR Container not found");
      this.pollingId && clearInterval(this.pollingId);
      return;
    }
    this.qrContainer.innerHTML = `<div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" /></div>`;
    document.getElementById("qr-code")?.addEventListener("click", () => window.open(deepLink, "_blank"));
  }

  private startPolling(sessionId: string) {
    this.pollingId && clearInterval(this.pollingId);

    if (!sessionId) throw new Error("Session ID not found");

    this.pollingId = window.setInterval(async () => {
      try {
        const url = `${BASE_API_URL}${AGE_APP_POLLING_ENDPOINT}/${sessionId}`;
        const data = await getRequest(url, { [SIGN_KEY_HEADER]: this.options.apiKey });

        logData(getElement(this.options.logContainerSelector || ""), data.scanningState);
        if (data?.scanningState) await this.handleState(data.scanningState);
      } catch (err) {
        if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();
        errorLog("Polling error", err);
        await this.handleState(STATES.Timeout);
        this.pollingId && clearInterval(this.pollingId);
      }
    }, POLLING_INTERVAL);
  }

  private async handleState(state: VerificationState) {
    const cb: IVerificationOptions = this.options;
    if (!cb.qrContainerSelector) {
      errorLog("QR Container not found");
      this.pollingId && clearInterval(this.pollingId);
    }
    const html = getMessageHTML(state);

    if (this.qrContainer && state !== STATES.WaitingForScan) {
      this.qrContainer.innerHTML = `<div  style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        flex-direction: column;
        ">${html}</div>`;
    }

    switch (state) {
      case STATES.WaitingForScan:
      case STATES.Scanned:
        infoLog(state);
        break;
      case STATES.Approved:
        if (cb.successRedirectURL) redirectWithDelay(cb.successRedirectURL, REDIRECT_DELAY);
        break;
      case STATES.Timeout:
        infoLog(this.options);
        document.getElementById("new-qr-button")?.addEventListener("click", () => this.validateIdentityAndGenerateQRCode());
        this.pollingId && clearInterval(this.pollingId);
        break;

      case STATES.SomethingWentWrong:
        if (cb.failRedirectURL) {
          redirectWithDelay(cb.failRedirectURL, REDIRECT_DELAY);
        }
        this.pollingId && clearInterval(this.pollingId);

      case STATES.RejectedByUser:
      case STATES.RejectedByRequirement:
        await sleep(10);
        this.validateIdentityAndGenerateQRCode();
        break;
      default:
        errorLog("Invalid state:", state);
        this.pollingId && clearInterval(this.pollingId);
        break;
    }
  }

  async validateIdentityAndGenerateQRCode() {
    try {
      this.qrContainer = getElement(this.options.qrContainerSelector);

      this.location = await getGeolocation(this.qrContainer);

      const url = `${BASE_API_URL}${VALIDATE_IDENTITY_ENDPOINT}`;
      const response = await postRequest(url, {
        token: this.options.apiKey,
        successNavigateUrl: this.options.successRedirectURL,
        failureNavigateUrl: this.options.failRedirectURL,
        notificationUrl: this.options.notificationURL,
      });
      if (!response.status || !response.data) throw new Error("Invalid identity");

      const { contextType, entityId, orgId } = response.data;

      switch (contextType) {
        case CONTEXT_TYPES.AGE_APP:
          await this.generateAgeAppQRCode(entityId, orgId);
          break;
        default:
          errorLog("Unknown context type");
          break;
      }

      return;
    } catch (err) {
      errorLog("Failed to generate QR code:", err);
    }
  }

  async generateAgeAppQRCode(eventId: string, orgId: string) {
    try {
      const url = `${BASE_API_URL}${AGE_APP_QR_GENERATION_ENDPOINT}/${eventId}?notificationURL=${this.options.notificationURL}&latitude=${this.location?.latitude}&longitude=${this.location?.longitude}`;

      const data = await getRequest(url, { [SIGN_KEY_HEADER]: this.options.apiKey, [ORG_ID_HEADER]: orgId });
      this.displayQRCode(data.qrCodeUrl, data.deepLink);
      this.startPolling(data.sessionId);
      infoLog("QR code generated successfully");
    } catch (err) {
      if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();
      errorLog("Failed to generate Age App QR code:", err);
    }
  }
}
