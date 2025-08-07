// export type VerificationState = "WaitingForScan" | "Timeout" | "Scanned" | "Approved" | "RejectedByUser" | "RejectedByRequirement";

export type VerificationState = keyof typeof import("../constants").STATES;

export interface IVerificationOptions {
  apiKey: string;
  qrContainerSelector: string;
  logContainerSelector?: string;
  apiBaseUrl?: string;
  successRedirectURL?: string;
  failRedirectURL?: string;
  notificationURL?: string;
}

export interface IGeolocation {
  latitude: number;
  longitude: number;
}
