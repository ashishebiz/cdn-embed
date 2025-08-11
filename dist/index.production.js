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
  var BASE_API_URL = "https://api.chainit.online";
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
  var LocationErrorMessage = "Location permission denied. Please enable it manually in browser settings.";
  var GeolocationNotSupportedMessage = "Geolocation is not supported by this browser";

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
      WaitingForScan: "",
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
  var showErrorMessageHTML = (message = "Something went wrong") => `<div style="background:#111;color:#fff;padding:10px 14px;border-radius:6px;font-size:14px;">${message}</div>`;
  function renderQRCodeHTML(qrCodeUrl) {
    return `
    <div id="qr-code" class="w-100 h-100" style="cursor:pointer;text-align:center;">
      <img src="${qrCodeUrl}" alt="QR Code" style="width:100%;height:100%;" />
    </div>
    `;
  }
  function renderStateMessageHTML(state) {
    const html = getMessageHTML(state);
    return `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex-direction: column;">
      ${html}
    </div>
  `;
  }

  // src/helpers/dom.helper.ts
  var getElement = (selector) => document.querySelector(selector);
  function logData(container, state) {
    if (!container) return;
    const p = document.createElement("p");
    p.innerHTML = getLogMessageHTML(state);
    p.style.cssText = "margin-bottom:10px;padding:8px;";
    container.prepend(p);
  }
  var redirectWithDelay = (url, delay) => setTimeout(() => window.location.href = url, delay);

  // src/helpers/log.helper.ts
  var infoLog = (...args) => console.log("[cdn-embed]", ...args);
  var errorLog = (...args) => console.error("[cdn-embed]", ...args);

  // src/helpers/utils.ts
  var sleep = (seconds) => {
    const ms = seconds * 1e3;
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  var extractQueryParams = () => {
    const script = document.currentScript;
    return {
      apiKey: (script == null ? void 0 : script.dataset.apiKey) || "",
      successRedirectURL: (script == null ? void 0 : script.dataset.successUrl) || "",
      failRedirectURL: (script == null ? void 0 : script.dataset.failureUrl) || "",
      notificationURL: (script == null ? void 0 : script.dataset.notificationUrl) || ""
    };
  };
  var getGeolocation = (qrContainer) => __async(null, null, function* () {
    const permissionStatus = yield checkGeolocationPermission();
    if (permissionStatus === "denied") {
      if (qrContainer) qrContainer.innerHTML = showErrorMessageHTML(LocationErrorMessage);
      alert(LocationErrorMessage);
      throw new Error(LocationErrorMessage);
    }
    return new Promise((res, rej) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            var _a, _b;
            const latitude = (_a = position.coords.latitude) != null ? _a : 0;
            const longitude = (_b = position.coords.longitude) != null ? _b : 0;
            res({
              latitude,
              longitude
            });
          },
          (error) => {
            if (qrContainer) qrContainer.innerHTML = showErrorMessageHTML(LocationErrorMessage);
            rej(`ERR_LOC : Error getting location: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 1e4,
            maximumAge: 0
          }
        );
      } else {
        if (qrContainer) qrContainer.innerHTML = showErrorMessageHTML(GeolocationNotSupportedMessage);
        rej(GeolocationNotSupportedMessage);
      }
    });
  });
  var checkGeolocationPermission = () => __async(null, null, function* () {
    if (!navigator.permissions) return "prompt";
    try {
      const result = yield navigator.permissions.query({ name: "geolocation" });
      return result.state;
    } catch (e) {
      return "prompt";
    }
  });
  function getRequest(_0) {
    return __async(this, arguments, function* (url, headers = {}) {
      var _a;
      const res = yield fetch(url, { method: "GET", headers });
      if (!res.ok) {
        const message = (_a = yield res.json()) == null ? void 0 : _a.message;
        alert("Something Went Wrong");
        throw new Error(`${res.status} : ${message}`);
      }
      return res.json();
    });
  }
  function postRequest(_0, _1) {
    return __async(this, arguments, function* (url, body, headers = {}) {
      var _a;
      const res = yield fetch(url, {
        method: "POST",
        headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), headers),
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const message = (_a = yield res.json()) == null ? void 0 : _a.message;
        alert("Something Went Wrong");
        throw new Error(`${res.status} : ${message}`);
      }
      return res.json();
    });
  }

  // src/api/verify.ts
  var IdentityVerifier = class {
    constructor(apiKey) {
      this.pollingId = null;
      this.qrContainer = null;
      this.location = null;
      this.apiKey = "";
      this.apiKey = apiKey;
    }
    configure(options) {
      this.options = options;
    }
    clearPolling() {
      if (this.pollingId !== null) {
        clearInterval(this.pollingId);
        this.pollingId = null;
      }
    }
    displayQRCode(qrCodeUrl, deepLink) {
      var _a;
      this.qrContainer = getElement(this.options.qrContainerSelector);
      if (!this.qrContainer) {
        errorLog("QR Container not found");
        this.clearPolling();
        return;
      }
      this.qrContainer.innerHTML = renderQRCodeHTML(qrCodeUrl);
      (_a = document.getElementById("qr-code")) == null ? void 0 : _a.addEventListener("click", () => window.open(deepLink, "_blank"));
    }
    startPolling(sessionId) {
      this.clearPolling();
      if (!sessionId) throw new Error("Session ID not found");
      this.pollingId = window.setInterval(() => __async(this, null, function* () {
        try {
          const url = `${BASE_API_URL}${AGE_APP_POLLING_ENDPOINT}/${sessionId}`;
          const data = yield getRequest(url, {
            [SIGN_KEY_HEADER]: this.apiKey
          });
          logData(getElement(this.options.logContainerSelector || ""), data.scanningState);
          if (data == null ? void 0 : data.scanningState) yield this.handleState(data.scanningState);
        } catch (err) {
          if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();
          errorLog("Polling error", err);
          yield this.handleState(STATES.Timeout);
          this.clearPolling();
        }
      }), POLLING_INTERVAL);
    }
    handleState(state) {
      return __async(this, null, function* () {
        var _a;
        const cb = this.options;
        if (!cb.qrContainerSelector) {
          errorLog("QR Container selector not provided");
          this.clearPolling();
          return;
        }
        if (this.qrContainer && state !== STATES.WaitingForScan) {
          this.qrContainer.innerHTML = renderStateMessageHTML(state);
        }
        switch (state) {
          case STATES.WaitingForScan:
            return;
          case STATES.Scanned:
            infoLog(state);
            break;
          case STATES.Approved:
            this.clearPolling();
            if (cb.successRedirectURL) redirectWithDelay(cb.successRedirectURL, REDIRECT_DELAY);
            break;
          case STATES.Timeout:
            infoLog(cb);
            this.clearPolling();
            (_a = document.getElementById("new-qr-button")) == null ? void 0 : _a.addEventListener("click", () => this.validateIdentityAndGenerateQRCode());
            break;
          case STATES.SomethingWentWrong:
            this.clearPolling();
            if (cb.failRedirectURL) {
              redirectWithDelay(cb.failRedirectURL, REDIRECT_DELAY);
            }
            break;
          case STATES.RejectedByUser:
          case STATES.RejectedByRequirement:
            this.clearPolling();
            yield sleep(10);
            yield this.validateIdentityAndGenerateQRCode();
            break;
          default:
            errorLog("Invalid state:", state);
            this.clearPolling();
            break;
        }
      });
    }
    validateIdentityAndGenerateQRCode() {
      return __async(this, null, function* () {
        try {
          this.qrContainer = getElement(this.options.qrContainerSelector);
          this.location = yield getGeolocation(this.qrContainer);
          const url = `${BASE_API_URL}${VALIDATE_IDENTITY_ENDPOINT}`;
          const response = yield postRequest(url, {
            token: this.apiKey,
            successNavigateUrl: this.options.successRedirectURL,
            failureNavigateUrl: this.options.failRedirectURL,
            notificationUrl: this.options.notificationURL
          });
          if (!response.status || !response.data) {
            throw new Error("Invalid identity");
          }
          const { contextType, entityId, orgId } = response.data;
          switch (contextType) {
            case CONTEXT_TYPES.AGE_APP:
              yield this.generateAgeAppQRCode(entityId, orgId);
              break;
            default:
              errorLog("Unknown context type");
              break;
          }
          return;
        } catch (err) {
          if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();
          errorLog("Failed to generate QR code:", err);
        }
      });
    }
    generateAgeAppQRCode(eventId, orgId) {
      return __async(this, null, function* () {
        var _a, _b;
        try {
          const url = `${BASE_API_URL}${AGE_APP_QR_GENERATION_ENDPOINT}/${eventId}?notificationURL=${this.options.notificationURL}&latitude=${(_a = this.location) == null ? void 0 : _a.latitude}&longitude=${(_b = this.location) == null ? void 0 : _b.longitude}`;
          const data = yield getRequest(url, {
            [SIGN_KEY_HEADER]: this.apiKey,
            [ORG_ID_HEADER]: orgId
          });
          this.displayQRCode(data.qrCodeUrl, data.deepLink);
          this.startPolling(data.sessionId);
          infoLog("QR code generated successfully");
        } catch (err) {
          if (this.qrContainer) this.qrContainer.innerHTML = showErrorMessageHTML();
          errorLog("Failed to generate Age App QR code:", err);
        }
      });
    }
  };

  // src/api/callback.modules.ts
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
    const { apiKey, successRedirectURL, failRedirectURL, notificationURL } = extractQueryParams();
    infoLog({ apiKey, successRedirectURL, failRedirectURL, notificationURL });
    if (!apiKey) return errorLog("Missing 'apiKey' in script tag. Example usage: <script src='...main.js data-api-key=your-api-key'>");
    const verifier = new IdentityVerifier(apiKey);
    verifier.configure({
      qrContainerSelector: QR_CONTAINER_SELECTOR,
      logContainerSelector: LOG_CONTAINER_SELECTOR,
      successRedirectURL,
      failRedirectURL,
      notificationURL,
      onVerificationWaitingForScan: () => callbackModule.handleState(callbackModule.STATES.WaitingForScan),
      onVerificationSuccess: () => callbackModule.handleState(callbackModule.STATES.Approved),
      onVerificationFailure: () => callbackModule.handleState(callbackModule.STATES.Timeout),
      onVerificationScanning: () => callbackModule.handleState(callbackModule.STATES.Scanned),
      onVerificationRejectedByUser: () => callbackModule.handleState(callbackModule.STATES.RejectedByUser),
      onVerificationRejectedByRequirements: () => callbackModule.handleState(callbackModule.STATES.RejectedByRequirement),
      onVerificationTimeout: () => callbackModule.handleState(callbackModule.STATES.Timeout)
    });
    callbackModule.setOptions({
      qrCodeSelector: QR_CONTAINER_SELECTOR,
      generateQRCodeFunction: () => verifier.validateIdentityAndGenerateQRCode(),
      successRedirectURL,
      failRedirectURL
    });
    window["bitIdentityVerification"] = verifier;
    verifier.validateIdentityAndGenerateQRCode();
  })();
})();
