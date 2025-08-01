export const STATES = {
  WaitingForScan: "WaitingForScan",
  Timeout: "Timeout",
  Scanned: "Scanned",
  Approved: "Approved",
  RejectedByUser: "RejectedByUser",
  RejectedByRequirement: "RejectedByRequirement",
};

export const STATE_HTML = {
  [STATES.Timeout]: `<div class="message">QR code expired.</div><a href="#" id="new-qr-button" class="button secondary">New QR</a>`,
  [STATES.Scanned]: `<div class="spinner"></div><div class="message">Scanning in progress...</div>`,
  [STATES.Approved]: `<div class="checkmark"></div><div class="message w-100">CHAIN<span class='green-text'>IT</span> ID</div><div class='label w-100'>Your age was validated. You will gain access in 10 seconds</div>`,
  [STATES.RejectedByUser]: `<div class="cross"></div><div class="message denied">Access Denied</div>`,
  [STATES.RejectedByRequirement]: `<div class="cross"></div><div class="message denied">Access Denied</div>`,
  [STATES.WaitingForScan]: "",
};
