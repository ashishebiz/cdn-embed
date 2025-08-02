import { QR_GENERATION_ENDPOINT, BASE_API_URL, POLLING_INTERVAL, STATES, POLLING_ENDPOINT, REDIRECT_DELAY } from "../constants";
import { errorLog, getElement, infoLog, logData, redirectWithDelay } from "../helpers";
import { VerificationOptions, VerificationState } from "../types";
import { getMessageHTML } from "../ui";
import { getRequest, postRequest } from "./request";

export class IdentityVerifier {
  private options!: VerificationOptions;
  private pollingId: number | null = null;
  private qrContainer: HTMLElement | null = null;

  configure(options: VerificationOptions) {
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
    this.pollingId = window.setInterval(async () => {
      try {
        const url = `${BASE_API_URL}${POLLING_ENDPOINT}/${sessionId}`;
        const data = await getRequest(url, { "x-sign-key": this.options.apiKey });

        logData(getElement(this.options.logContainerSelector || ""), data.scanningState);
        if (data?.scanningState) this.handleState(data.scanningState);
      } catch (err) {
        errorLog("Polling error", err);
        this.handleState(STATES.Timeout);
        this.pollingId && clearInterval(this.pollingId);
      }
    }, POLLING_INTERVAL);
  }

  private handleState(state: VerificationState) {
    const cb: VerificationOptions = this.options;
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
        break;
      case STATES.Approved:
        if (cb.successRedirectURL) redirectWithDelay(cb.successRedirectURL, REDIRECT_DELAY);
        break;
      case STATES.Timeout:
        infoLog(this.options);
        document.getElementById("new-qr-button")?.addEventListener("click", () => this.generateQRCode());
        this.pollingId && clearInterval(this.pollingId);
        break;

      case STATES.SomethingWentWrong:
        if (cb.failRedirectURL) {
          redirectWithDelay(cb.failRedirectURL, REDIRECT_DELAY);
        }
        this.pollingId && clearInterval(this.pollingId);

      case STATES.RejectedByUser:
      case STATES.RejectedByRequirement:
      default:
        errorLog("Invalid state:", state);
        this.pollingId && clearInterval(this.pollingId);
        break;
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
      errorLog("Failed to generate QR code:", err);
    }
  }
}
