import { VerificationState } from "../types";

export const getMessageHTML = (state: VerificationState): string => {
  const messages: Record<VerificationState, string> = {
    Timeout: `<div class='message'>QR expired.</div><a id='new-qr-button' class='button secondary'>New QR</a>`,
    Scanned: `<div class='spinner'></div><div class='message'>Scanning in progress...</div>`,
    Approved: `<div class='checkmark'></div><div class='message'>Access granted in 10s.</div>`,
    RejectedByUser: `<div class='cross'></div><div class='message denied'>Access Denied</div>`,
    RejectedByRequirement: `<div class='cross'></div><div class='message denied'>Access Denied</div>`,
    WaitingForScan: "",
  };
  return messages[state];
};
