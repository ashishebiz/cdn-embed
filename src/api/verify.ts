import { QR_GENERATION_ENDPOINT, BASE_API_URL, POLLING_INTERVAL, STATES, POLLING_ENDPOINT } from "../constants";
import { errorLog, getElement, logData } from "../helpers";
import { VerificationOptions, VerificationState } from "../types";
import { getRequest, postRequest } from "./request";

export class AgeVerification {
  private options!: VerificationOptions;
  private pollingId: number | null = null;

  configure(options: VerificationOptions) {
    this.options = options;
  }

  private displayQRCode(qrCodeUrl: string, deepLink: string) {
    const container = getElement(this.options.qrContainerSelector);
    if (!container) {
      errorLog("QR Container not found");
      return;
    }
    container.innerHTML = `<div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" /></div>`;
    document.getElementById("qr-code")?.addEventListener("click", () => window.open(deepLink, "_blank"));
  }

  private startPolling(sessionId: string) {
    this.pollingId && clearInterval(this.pollingId);
    this.pollingId = window.setInterval(async () => {
      try {
        const url = `${BASE_API_URL}${POLLING_ENDPOINT}/${sessionId}`;
        const data = await getRequest(url, { "x-sign-key": this.options.apiKey });

        logData(getElement(this.options.logContainerSelector || ""), data.scanningState);
        if (data?.scanningState) this.handleState(data.scanningState);
      } catch (err) {
        errorLog("Polling error", err);
        this.handleState(STATES.Timeout);
      }
    }, POLLING_INTERVAL);
  }

  private handleState(state: VerificationState) {
    const cb = this.options;
    switch (state) {
      case STATES.WaitingForScan:
        return cb.onVerificationWaitingForScan();
      case STATES.Scanned:
        return cb.onVerificationScanning();
      case STATES.Approved:
        return cb.onVerificationSuccess();
      case STATES.RejectedByUser:
        return cb.onVerificationRejectedByUser();
      case STATES.RejectedByRequirement:
        return cb.onVerificationRejectedByRequirements();
      case STATES.Timeout:
        return cb.onVerificationTimeout();
      default:
        return cb.onVerificationFailure();
    }
  }

  async generateQRCode() {
    const eventId = "/e42cb048-4a64-4826-af03-5e7eb3a9fa9c";
    try {
      const url = `${BASE_API_URL}${QR_GENERATION_ENDPOINT}/${eventId}`;
      const data = await getRequest(url, { "x-sign-key": this.options.apiKey });
      this.displayQRCode(data.qrCodeUrl, data.deepLink);
      this.startPolling(data.sessionId);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  }
}
