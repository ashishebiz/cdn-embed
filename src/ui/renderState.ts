import { STATE_HTML, STATES } from "../constants";
import { delayRedirect, getElement, setHTML } from "../helpers";

export const renderState = (
  selector: string,
  state: keyof typeof STATES,
  {
    successURL,
    failURL,
    onNewQR,
  }: {
    successURL?: string;
    failURL?: string;
    onNewQR?: () => void;
  } = {},
) => {
  const el = getElement(selector);
  if (!el) return;

  const html = STATE_HTML[state];
  if (!html) return;

  setHTML(el, `<div class="w-100 h-100 align-content-center">${html}</div>`);

  if (state === STATES.Timeout && onNewQR) {
    document.getElementById("new-qr-button")?.addEventListener("click", onNewQR);
  }

  if ([STATES.Approved, STATES.RejectedByUser, STATES.RejectedByRequirement].includes(state)) {
    const redirectURL = state === STATES.Approved ? successURL : failURL;
    if (redirectURL) delayRedirect(redirectURL);
  }
};
