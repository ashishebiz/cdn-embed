"use strict";
var AgeVerificationCDN = (() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/constants/index.ts
  var BASE_API_URL = "http://localhost:8888";
  var QR_GENERATION_ENDPOINT = "/rule-engine/v1/age-app-embedded/generate-qr";
  var POLLING_ENDPOINT = "/rule-engine/v1/age-app-embedded/get-qr";
  var POLLING_INTERVAL = 5e3;
  var REDIRECT_DELAY = 1e4;
  var STATES = {
    WaitingForScan: "WaitingForScan",
    Timeout: "Timeout",
    Scanned: "Scanned",
    Approved: "Approved",
    RejectedByUser: "RejectedByUser",
    RejectedByRequirement: "RejectedByRequirement",
    SomethingWentWrong: "SomethingWentWrong"
  };

  // src/api/request.ts
  function getRequest(_0) {
    return __async(this, arguments, function* (url, headers = {}) {
      const res = yield fetch(url, { method: "GET", headers });
      return res.json();
    });
  }

  // src/helpers/dom.helper.ts
  var getElement = (selector) => document.querySelector(selector);
  function logData(container, data) {
    if (!container) return;
    const logEntry = document.createElement("div");
    logEntry.innerText = JSON.stringify(data, null, 2);
    container.prepend(logEntry);
  }

  // src/helpers/log.helper.ts
  var infoLog = (...args) => console.log("[cdn-embed]", ...args);
  var errorLog = (...args) => console.error("[cdn-embed]", ...args);

  // src/helpers/utils.ts
  var redirectWithDelay = (url, delay) => {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  };
  var extractQueryParams = () => {
    const script = document.currentScript;
    return {
      apiKey: (script == null ? void 0 : script.dataset.apiKey) || "",
      successURL: (script == null ? void 0 : script.dataset.successUrl) || "",
      failureURL: (script == null ? void 0 : script.dataset.failureUrl) || "",
      notificationURL: (script == null ? void 0 : script.dataset.notificationUrl) || ""
    };
  };

  // src/api/verify.ts
  var AgeVerification = class {
    constructor() {
      this.pollingId = null;
    }
    configure(options) {
      this.options = options;
    }
    displayQRCode(qrCodeUrl, deepLink) {
      var _a;
      const container = getElement(this.options.qrContainerSelector);
      if (!container) {
        errorLog("QR Container not found");
        return;
      }
      container.innerHTML = `<div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" /></div>`;
      (_a = document.getElementById("qr-code")) == null ? void 0 : _a.addEventListener("click", () => window.open(deepLink, "_blank"));
    }
    startPolling(sessionId) {
      this.pollingId && clearInterval(this.pollingId);
      this.pollingId = window.setInterval(() => __async(this, null, function* () {
        try {
          const url = `${BASE_API_URL}${POLLING_ENDPOINT}/${sessionId}`;
          const data = yield getRequest(url, { "x-sign-key": this.options.apiKey });
          logData(getElement(this.options.logContainerSelector || ""), data.scanningState);
          if (data == null ? void 0 : data.scanningState) this.handleState(data.scanningState);
        } catch (err) {
          errorLog("Polling error", err);
          this.handleState(STATES.Timeout);
        }
      }), POLLING_INTERVAL);
    }
    handleState(state) {
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
    generateQRCode() {
      return __async(this, null, function* () {
        const eventId = "/e42cb048-4a64-4826-af03-5e7eb3a9fa9c";
        try {
          const url = `${BASE_API_URL}${QR_GENERATION_ENDPOINT}/${eventId}`;
          const data = yield getRequest(url, { "x-sign-key": this.options.apiKey });
          this.displayQRCode(data.qrCodeUrl, data.deepLink);
          this.startPolling(data.sessionId);
        } catch (err) {
          console.error("Failed to generate QR code:", err);
        }
      });
    }
  };

  // src/ui/templates.ts
  var getMessageHTML = (state) => {
    const messages = {
      Timeout: `<div class='message'>QR expired.</div><a id='new-qr-button' class='button secondary'>New QR</a>`,
      Scanned: `<div class='spinner'></div><div class='message'>Scanning in progress...</div>`,
      Approved: `<div class='checkmark'></div><div class='message'>Access granted in 10s.</div>`,
      RejectedByUser: `<div class='cross'></div><div class='message denied'>Access Denied</div>`,
      RejectedByRequirement: `<div class='cross'></div><div class='message denied'>Access Denied</div>`,
      WaitingForScan: "<div class='spinner'></div><div class='message'>Waiting for scan...</div>",
      SomethingWentWrong: `<div class='cross'></div><div class='message denied'>Something went wrong</div>`
    };
    return messages[state];
  };

  // src/api/callback.module.ts
  var callbackModule = /* @__PURE__ */ (() => {
    let container = null;
    let generateQRCode;
    let successURL = "";
    let failURL = "";
    function setOptions(options) {
      container = document.querySelector(options.qrCodeSelector);
      if (!container) return;
      generateQRCode = options.generateQRCodeFunction;
      successURL = options.successRedirectURL || "";
      failURL = options.failRedirectURL || "";
    }
    function handleState(state) {
      var _a;
      if (!container) return;
      const html = getMessageHTML(state);
      container.innerHTML = `<div class='w-100 h-100 align-content-center'>${html}</div>`;
      if (state === STATES.Timeout && generateQRCode) {
        (_a = document.getElementById("new-qr-button")) == null ? void 0 : _a.addEventListener("click", generateQRCode);
      }
      if (state === STATES.Approved && successURL) {
        redirectWithDelay(successURL, REDIRECT_DELAY);
      }
      if ((state === STATES.RejectedByUser || state === STATES.RejectedByRequirement) && failURL) {
        redirectWithDelay(failURL, REDIRECT_DELAY);
      }
      if (state === STATES.SomethingWentWrong && failURL) {
        redirectWithDelay(failURL, REDIRECT_DELAY);
      }
    }
    return {
      setOptions,
      handleState,
      STATES
    };
  })();

  // src/main.ts
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
      onVerificationTimeout: () => callbackModule.handleState(callbackModule.STATES.Timeout)
    });
    verifier.generateQRCode();
    callbackModule.setOptions({
      qrCodeSelector: "#embed-qr-code-qr",
      generateQRCodeFunction: () => verifier.generateQRCode(),
      successRedirectURL: successURL,
      failRedirectURL: failureURL
    });
  })();
})();
