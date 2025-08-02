"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
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

  // src/api/request.ts
  function getRequest(_0) {
    return __async(this, arguments, function* (url, headers = {}) {
      const res = yield fetch(url, { method: "GET", headers });
      return res.json();
    });
  }
  function postRequest(_0, _1) {
    return __async(this, arguments, function* (url, body, headers = {}) {
      const res = yield fetch(url, {
        method: "POST",
        headers: __spreadValues({
          "Content-Type": "application/json"
        }, headers),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    });
  }

  // src/constants/index.ts
  var BASE_API_URL = "https://develop-api.chainit.online";
  var AGE_APP_ENDPOINTS = "/users/v1/age-verification";
  var POLLING_INTERVAL = 1e4;
  var REDIRECT_DELAY = 1e4;
  var STATES = {
    WaitingForScan: "WaitingForScan",
    Timeout: "Timeout",
    Scanned: "Scanned",
    Approved: "Approved",
    RejectedByUser: "RejectedByUser",
    RejectedByRequirement: "RejectedByRequirement"
  };

  // src/helpers/dom.helper.ts
  var getElement = (selector) => document.querySelector(selector);

  // src/helpers/log.helper.ts
  function logData(container, data) {
    if (!container) return;
    const logEntry = document.createElement("div");
    logEntry.innerText = JSON.stringify(data, null, 2);
    container.prepend(logEntry);
  }

  // src/helpers/utils.ts
  var redirectWithDelay = (url, delay) => {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  };
  var extractQueryParams = () => {
    const script = document.currentScript;
    const src = (script == null ? void 0 : script.src) || "";
    console.log(new URL(src));
    const params = new URL(src).searchParams;
    return {
      apiKey: params.get("apiKey") || "",
      successURL: params.get("successURL") || "",
      failureURL: params.get("failureURL") || "",
      notificationURL: params.get("notificationURL") || ""
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
      if (!container) return;
      container.innerHTML = `<div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" /></div>`;
      (_a = document.getElementById("qr-code")) == null ? void 0 : _a.addEventListener("click", () => window.open(deepLink, "_blank"));
    }
    startPolling(statusUrl) {
      this.pollingId && clearInterval(this.pollingId);
      this.pollingId = window.setInterval(() => __async(this, null, function* () {
        try {
          const data = yield getRequest(statusUrl, { "x-api-key": this.options.apiKey });
          logData(getElement(this.options.logContainerSelector || ""), data);
          if (data == null ? void 0 : data.scanningState) this.handleState(data.scanningState);
        } catch (err) {
          console.error("Polling error", err);
          this.handleState("Timeout");
        }
      }), POLLING_INTERVAL);
    }
    handleState(state) {
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
    generateQRCode() {
      return __async(this, null, function* () {
        try {
          const url = `${this.options.apiBaseUrl || BASE_API_URL}${AGE_APP_ENDPOINTS}`;
          const data = yield postRequest(url, {}, { "x-api-key": this.options.apiKey });
          this.displayQRCode(data.qrCodeUrl, data.deepLink);
          this.startPolling(data.qrCodeStatusCheckUrl);
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
      WaitingForScan: ""
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
    }
    return {
      setOptions,
      handleState,
      STATES
    };
  })();

  // src/main.ts
  (() => {
    const { apiKey, successURL, failureURL } = extractQueryParams();
    console.log("\u{1F680} ~ apiKey, successURL, failureURL 001", apiKey, successURL, failureURL);
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
      onVerificationTimeout: () => callbackModule.handleState(callbackModule.STATES.Timeout)
    });
    verifier.generateQRCode();
    callbackModule.setOptions({
      qrCodeSelector: "#bit-age-verification-qr",
      generateQRCodeFunction: () => verifier.generateQRCode(),
      successRedirectURL: successURL,
      failRedirectURL: failureURL
    });
  })();
})();
