// export type VerificationState = "WaitingForScan" | "Timeout" | "Scanned" | "Approved" | "RejectedByUser" | "RejectedByRequirement";

export type VerificationState = keyof typeof import("../constants").STATES;

export interface QRModuleOptions {
  qrCodeSelector: string;
  generateQRCodeFunction: () => void;
  successRedirectURL?: string;
  failRedirectURL?: string;
}

export interface IVerificationOptions {
  qrContainerSelector: string;
  logContainerSelector?: string;
  apiBaseUrl?: string;
  successRedirectURL?: string;
  failRedirectURL?: string;
  notificationURL?: string;
  onVerificationWaitingForScan: () => void;
  onVerificationSuccess: () => void;
  onVerificationFailure: () => void;
  onVerificationScanning: () => void;
  onVerificationRejectedByUser: () => void;
  onVerificationRejectedByRequirements: () => void;
  onVerificationTimeout: () => void;
}

export interface IGeolocation {
  latitude: number;
  longitude: number;
}
