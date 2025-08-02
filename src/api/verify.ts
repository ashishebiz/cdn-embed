import { AGE_APP_ENDPOINTS, BASE_API_URL, POLLING_INTERVAL, STATES } from "../constants";
import { getElement, logData } from "../helpers";
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
    if (!container) return;
    container.innerHTML = `<div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" /></div>`;
    document.getElementById("qr-code")?.addEventListener("click", () => window.open(deepLink, "_blank"));
  }

  private startPolling(statusUrl: string) {
    this.pollingId && clearInterval(this.pollingId);
    this.pollingId = window.setInterval(async () => {
      try {
        const data = await getRequest(statusUrl, { "x-api-key": this.options.apiKey });
        logData(getElement(this.options.logContainerSelector || ""), data);
        if (data?.scanningState) this.handleState(data.scanningState);
      } catch (err) {
        console.error("Polling error", err);
        this.handleState("Timeout");
      }
    }, POLLING_INTERVAL);
  }

  private handleState(state: VerificationState) {
    const cb = this.options;
    switch (state) {
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
    try {
      const url = `${this.options.apiBaseUrl || BASE_API_URL}${AGE_APP_ENDPOINTS}`;
      const data = await postRequest(url, {}, { "x-api-key": this.options.apiKey });
      this.displayQRCode(data.qrCodeUrl, data.deepLink);
      this.startPolling(data.qrCodeStatusCheckUrl);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  }
}
