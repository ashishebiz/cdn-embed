export const BASE_API_URL = "https://develop-api.chainit.online";
export const AGE_APP_ENDPOINTS = "/users/v1/age-verification";

export const API_KEY_HEADER_NAME = "x-api-key";
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const POLLING_INTERVAL = 10000;
export const REDIRECT_DELAY = 10000;

export const STATES = {
  WaitingForScan: "WaitingForScan",
  Timeout: "Timeout",
  Scanned: "Scanned",
  Approved: "Approved",
  RejectedByUser: "RejectedByUser",
  RejectedByRequirement: "RejectedByRequirement",
} as const;
