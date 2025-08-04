export const BASE_API_URL = process?.env?.BASE_API_URL || "http://localhost:8888";
export const AGE_APP_QR_GENERATION_ENDPOINT = "/rule-engine/v1/age-app-embed/generate-qr";
export const AGE_APP_POLLING_ENDPOINT = "/rule-engine/v1/age-app-embed/get-qr";
export const VALIDATE_IDENTITY_ENDPOINT = "/public-base/v1/embed/validate";

export const SIGN_KEY_HEADER = "x-sign-key";
export const ORG_ID_HEADER = "x-organization-id";
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const CONTEXT_TYPES = {
  AGE_APP: "age_app",
  CHECK_IN: "check_in",
};

export const QR_CONTAINER_SELECTOR = "#embed-qr-code";
export const LOG_CONTAINER_SELECTOR = "#embed-qr-code-logs";

export const POLLING_INTERVAL = 5000;
export const REDIRECT_DELAY = 10000;

export const STATES = {
  WaitingForScan: "WaitingForScan",
  Timeout: "Timeout",
  Scanned: "Scanned",
  Approved: "Approved",
  RejectedByUser: "RejectedByUser",
  RejectedByRequirement: "RejectedByRequirement",
  SomethingWentWrong: "SomethingWentWrong",
} as const;
