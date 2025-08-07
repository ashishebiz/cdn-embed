import { VerificationState } from "../types";
import { getLogMessageHTML } from "../ui";

export const getElement = (selector: string) => document.querySelector<HTMLElement>(selector);

export const setHTML = (el: HTMLElement, html: string) => {
  el.innerHTML = html;
};

export function logData(container: HTMLElement | null, state: VerificationState): void {
  if (!container) return;
  const p = document.createElement("p");
  p.innerHTML = getLogMessageHTML(state);
  p.style.cssText = "margin-bottom:10px;padding:8px;";
  container.prepend(p);
}

export const delayRedirect = (url: string, delay = 10000) => setTimeout(() => (window.location.href = url), delay);
