import { VerificationState } from "../types";

export const getMessageHTML = (state: VerificationState): string => {
  const messages: Record<VerificationState, string> = {
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
    <div style="font-size: 30px; margin-bottom: 10px;">⏳</div>
    <div style="color: #fff;">Scanning in progress...</div>
  `,

    Approved: `
    <div style="font-size: 30px; margin-bottom: 10px;">✅</div>
    <div style="color: #00ff99;">Access granted in 10s.</div>
  `,

    RejectedByUser: `
    <div style="font-size: 30px; margin-bottom: 10px;">❌</div>
    <div style="color: #ff4444;">Access Denied</div>
  `,

    RejectedByRequirement: `
    <div style="font-size: 30px; margin-bottom: 10px;">❌</div>
    <div style="color: #ff4444;">Access Denied</div>
  `,

    WaitingForScan: `
    <div style="font-size: 30px; margin-bottom: 10px;">📷</div>
    <div style="color: #fff;">Waiting for scan...</div>
  `,

    SomethingWentWrong: `
    <div style="font-size: 30px; margin-bottom: 10px;">⚠️</div>
    <div style="color: #ff4444;">Something went wrong</div>
  `,
  };
  return messages[state];
};

export const getLogMessageHTML = (state: VerificationState): string => {
  const messages: Record<VerificationState, string> = {
    Timeout: `QR Expired`,
    Scanned: `Scanning in progress`,
    Approved: `Access Granted`,
    RejectedByUser: `Access Denied`,
    RejectedByRequirement: `Access Denied`,
    WaitingForScan: `Waiting for scan`,
    SomethingWentWrong: `Something went wrong`,
  };
  return messages[state];
};

export const showErrorMessageHTML = (message: string = "Something went wrong") =>
  `<div style="background:#111;color:#fff;padding:10px 14px;border-radius:6px;font-size:14px;">${message}</div>`;

export const locationMessageHTML = `<div style="background:#111;color:#fff;padding:10px 14px;border-radius:6px;font-size:14px;">Location permission denied. Please enable it manually in browser settings and refresh this page.</div>`;
