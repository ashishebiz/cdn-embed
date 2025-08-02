// export const BASE_API_URL = "https://develop-api.chainit.online";
// export const QR_GENERATION_ENDPOINT = "/rule-engine/v1/age-app-embedded/generate-qr/";

export const BASE_API_URL = "http://localhost:8888";
export const QR_GENERATION_ENDPOINT = "/rule-engine/v1/age-app-embedded/generate-qr";
export const POLLING_ENDPOINT = "/rule-engine/v1/age-app-embedded/get-qr";

export const SIGN_KEY_HEADER = "x-sign-key";
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

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
