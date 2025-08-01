import { checkQRCodeStatus, createQRCodeSession } from "./api";
import { STATES } from "./constants";
import { getElement, log } from "./helpers";
import { renderState } from "./ui";

let poller: ReturnType<typeof setInterval> | null = null;

const init = async () => {
  const script = document.currentScript as HTMLScriptElement;
  const params = new URL(script.src).searchParams;

  const apiKey = params.get("apiKey");
  const successURL = params.get("successURL");
  const failURL = params.get("failureURL");
  const qrContainer = "#bit-age-verification-qr";

  if (!apiKey) return log("Missing apiKey");

  const startPolling = (statusUrl: string) => {
    poller && clearInterval(poller);
    poller = setInterval(async () => {
      try {
        const res = await checkQRCodeStatus(statusUrl, apiKey);
        const state = res?.scanningState;

        if (!state) return;

        renderState(qrContainer, state, {
          successURL: successURL ?? "",
          failURL: failURL ?? "",
          onNewQR: generate,
        });

        if (state !== STATES.Scanned && state !== STATES.WaitingForScan) {
          clearInterval(poller!);
        }
      } catch (err) {
        log("Polling error:", err);
        clearInterval(poller!);
      }
    }, 10000);
  };

  const generate = async () => {
    try {
      const { qrCodeUrl, deepLink, qrCodeStatusCheckUrl } = await createQRCodeSession(apiKey);
      const qrEl = getElement(qrContainer);
      if (!qrEl) return;

      qrEl.innerHTML = `
        <div class="w-100 h-100" id="qr-code" style="cursor:pointer; text-align:center;">
          <img src="${qrCodeUrl}" style="width:100%;height:100%;" alt="QR Code" />
        </div>
      `;

      document.getElementById("qr-code")?.addEventListener("click", () => window.open(deepLink, "_blank"));

      startPolling(qrCodeStatusCheckUrl);
    } catch (err) {
      log("QR generation error:", err);
    }
  };

  generate();
};

init();
