"use strict";
var IdentityVerificationCDN = (() => {
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

  // src/constants/index.ts
  var BASE_API_URL = "http://localhost:8888";
  var AGE_APP_QR_GENERATION_ENDPOINT = "/rule-engine/v1/age-app-embed/generate-qr";
  var AGE_APP_POLLING_ENDPOINT = "/rule-engine/v1/age-app-embed/get-qr";
  var VALIDATE_IDENTITY_ENDPOINT = "/public-base/v1/embed/validate";
  var SIGN_KEY_HEADER = "x-sign-key";
  var ORG_ID_HEADER = "x-organization-id";
  var DEFAULT_HEADERS = {
    "Content-Type": "application/json"
  };
  var CONTEXT_TYPES = {
    AGE_APP: "age_app",
    CHECK_IN: "check_in"
  };
  var QR_CONTAINER_SELECTOR = "#embed-qr-code";
  var LOG_CONTAINER_SELECTOR = "#embed-qr-code-logs";
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
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    });
  }
  function postRequest(_0, _1) {
    return __async(this, arguments, function* (url, body, headers = {}) {
      const res = yield fetch(url, {
        method: "POST",
        headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), headers),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    });
  }

  // src/ui/templates.ts
  var getMessageHTML = (state) => {
    const messages = {
      Timeout: `
    <div style="margin-bottom: 10px; color: #fff;">QR expired.</div>
    <a id='new-qr-button' style="
      margin-top: 10px;
      display: inline-block;
      padding: 10px 20px;
      background-color: #000;
      border: 1px solid #fff;
      color: #fff;
      border-radius: 6px;
      text-decoration: none;
      cursor:pointer;
    ">New QR</a>
  `,
      Scanned: `
    <div style="font-size: 30px; margin-bottom: 10px;">\u23F3</div>
    <div style="color: #fff;">Scanning in progress...</div>
  `,
      Approved: `
    <div style="font-size: 30px; margin-bottom: 10px;">\u2705</div>
    <div style="color: #00ff99;">Access granted in 10s.</div>
  `,
      RejectedByUser: `
    <div style="font-size: 30px; margin-bottom: 10px;">\u274C</div>
    <div style="color: #ff4444;">Access Denied</div>
  `,
      RejectedByRequirement: `
    <div style="font-size: 30px; margin-bottom: 10px;">\u274C</div>
    <div style="color: #ff4444;">Access Denied</div>
  `,
      WaitingForScan: `
    <div style="font-size: 30px; margin-bottom: 10px;">\u{1F4F7}</div>
    <div style="color: #fff;">Waiting for scan...</div>
  `,
      SomethingWentWrong: `
    <div style="font-size: 30px; margin-bottom: 10px;">\u26A0\uFE0F</div>
    <div style="color: #ff4444;">Something went wrong</div>
  `
    };
    return messages[state];
  };
  var getLogMessageHTML = (state) => {
    const messages = {
      Timeout: `QR Expired`,
      Scanned: `Scanning in progress`,
      Approved: `Access Granted`,
      RejectedByUser: `Access Denied`,
      RejectedByRequirement: `Access Denied`,
      WaitingForScan: `Waiting for scan`,
      SomethingWentWrong: `Something went wrong`
    };
    return messages[state];
  };

  // src/helpers/dom.helper.ts
  var getElement = (selector) => document.querySelector(selector);
  function logData(container, state) {
    if (!container) return;
    const p = document.createElement("p");
    p.innerHTML = getLogMessageHTML(state);
    p.style.cssText = "margin-bottom:10px;padding:8px;";
    container.prepend(p);
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
  var IdentityVerifier = class {
    constructor() {
      this.pollingId = null;
      this.qrContainer = null;
    }
    configure(options) {
      this.options = options;
    }
    displayQRCode(qrCodeUrl, deepLink) {
      var _a;
      this.qrContainer = getElement(this.options.qrContainerSelector);
      if (!this.qrContainer) {
        errorLog("QR Container not found");
        this.pollingId && clearInterval(this.pollingId);
        return;
      }
      this.qrContainer.innerHTML = `<div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" /></div>`;
      (_a = document.getElementById("qr-code")) == null ? void 0 : _a.addEventListener("click", () => window.open(deepLink, "_blank"));
    }
    startPolling(sessionId) {
      this.pollingId && clearInterval(this.pollingId);
      if (!sessionId) throw new Error("Session ID not found");
      this.pollingId = window.setInterval(() => __async(this, null, function* () {
        try {
          const url = `${BASE_API_URL}${AGE_APP_POLLING_ENDPOINT}/${sessionId}`;
          const data = yield getRequest(url, { "x-sign-key": this.options.apiKey });
          logData(getElement(this.options.logContainerSelector || ""), data.scanningState);
          if (data == null ? void 0 : data.scanningState) this.handleState(data.scanningState);
        } catch (err) {
          errorLog("Polling error", err);
          this.handleState(STATES.Timeout);
          this.pollingId && clearInterval(this.pollingId);
        }
      }), POLLING_INTERVAL);
    }
    handleState(state) {
      var _a;
      const cb = this.options;
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
          (_a = document.getElementById("new-qr-button")) == null ? void 0 : _a.addEventListener("click", () => this.validateIdentityAndGenerateQRCode());
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
    validateIdentityAndGenerateQRCode() {
      return __async(this, null, function* () {
        try {
          const url = `${VALIDATE_IDENTITY_ENDPOINT}${VALIDATE_IDENTITY_ENDPOINT}?token=${this.options.apiKey}`;
          const response = yield postRequest(url, {});
          if (!response.status || !response.data) throw new Error("Invalid identity");
          const { contextType, entityId, orgId, id } = response.data;
          switch (contextType) {
            case CONTEXT_TYPES.AGE_APP:
              yield this.generateAgeAppQRCode(entityId, orgId);
              infoLog("QR code generated successfully");
              break;
            default:
              errorLog("Unknown context type");
              break;
          }
          return;
        } catch (err) {
          errorLog("Failed to generate QR code:", err);
        }
      });
    }
    generateAgeAppQRCode(eventId, orgId) {
      return __async(this, null, function* () {
        try {
          const url = `${BASE_API_URL}${AGE_APP_QR_GENERATION_ENDPOINT}/${eventId}`;
          const data = yield getRequest(url, { [SIGN_KEY_HEADER]: this.options.apiKey, [ORG_ID_HEADER]: orgId });
          this.displayQRCode(data.qrCodeUrl, data.deepLink);
          this.startPolling(data.sessionId);
        } catch (err) {
          errorLog("Failed to generate QR code:", err);
        }
      });
    }
  };

  // src/main.ts
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
      failRedirectURL: failureURL
    });
    verifier.validateIdentityAndGenerateQRCode();
  })();
})();
