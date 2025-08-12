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
import { renderQRCodeHTML, renderStateMessageHTML, showErrorMessageHTML } from "../ui";
import { getRequest, postRequest } from "../helpers";

export class IdentityVerifier {
  private options!: IVerificationOptions;
  private pollingId: number | null = null;
  private qrContainer: HTMLElement | null = null;
  private location: IGeolocation | null = null;
  private apiKey: string = "";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  configure(options: IVerificationOptions) {
    this.options = options;
  }

  private clearPolling() {
    if (this.pollingId !== null) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  private displayQRCode(qrCodeUrl: string, deepLink: string) {
    this.qrContainer = getElement(this.options.qrContainerSelector);
    if (!this.qrContainer) {
      errorLog("QR Container not found");
      this.clearPolling();
      return;
    }

    this.qrContainer.innerHTML = renderQRCodeHTML(qrCodeUrl);
    document.getElementById("qr-code")?.addEventListener("click", () => window.open(deepLink, "_blank"));
  }

  private startPolling(sessionId: string) {
    this.clearPolling();

    if (!sessionId) throw new Error("Session ID not found");

    this.pollingId = window.setInterval(async () => {
      try {
        const url = `${BASE_API_URL}${AGE_APP_POLLING_ENDPOINT}/${sessionId}`;
        const data = await getRequest(url, {
          [SIGN_KEY_HEADER]: this.apiKey,
        });

        logData(getElement(this.options.logContainerSelector || ""), data.scanningState);

        if (data?.scanningState) await this.handleState(data.scanningState);
      } catch (err) {
        if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();

        errorLog("Polling error", err);
        await this.handleState(STATES.Timeout);
        this.clearPolling();
      }
    }, POLLING_INTERVAL);
  }

  private async handleState(state: VerificationState) {
    const cb = this.options;

    if (!cb.qrContainerSelector) {
      errorLog("QR Container selector not provided");
      this.clearPolling();
      return;
    }
    switch (state) {
      case STATES.WaitingForScan:
        return;
      case STATES.Scanned:
        return cb.onVerificationScanning();
      case STATES.Approved:
        this.clearPolling();
        return cb.onVerificationSuccess();
      case STATES.RejectedByUser:
        this.clearPolling();
        return cb.onVerificationRejectedByUser();
      case STATES.RejectedByRequirement:
        this.clearPolling();
        return cb.onVerificationRejectedByRequirements();
      case STATES.Timeout:
        this.clearPolling();
        return cb.onVerificationTimeout();
      case STATES.SomethingWentWrong:
        this.clearPolling();
        return cb.onVerificationFailure();
    }
  }

  async validateIdentityAndGenerateQRCode() {
    try {
      this.qrContainer = getElement(this.options.qrContainerSelector);
      this.location = await getGeolocation(this.qrContainer);

      const url = `${BASE_API_URL}${VALIDATE_IDENTITY_ENDPOINT}`;
      const response = await postRequest(url, {
        token: this.apiKey,
        successNavigateUrl: this.options.successRedirectURL,
        failureNavigateUrl: this.options.failRedirectURL,
        notificationUrl: this.options.notificationURL,
      });

      if (!response.status || !response.data) {
        throw new Error("Invalid identity");
      }

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

      const data = await getRequest(url, {
        [SIGN_KEY_HEADER]: this.apiKey,
        [ORG_ID_HEADER]: orgId,
      });

      this.displayQRCode(data.qrCodeUrl, data.deepLink);
      this.startPolling(data.sessionId);

      infoLog("QR code generated successfully");
    } catch (err) {
      if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();
      errorLog("Failed to generate Age App QR code:", err);
    }
  }
}
