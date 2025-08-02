export const getElement = (selector: string) => document.querySelector<HTMLElement>(selector);

export const setHTML = (el: HTMLElement, html: string) => {
  el.innerHTML = html;
};

export function logData(container: HTMLElement | null, data: any): void {
  if (!container) return;
  const logEntry = document.createElement("div");
  logEntry.innerText = JSON.stringify(data, null, 2);
  container.prepend(logEntry);
}

export const delayRedirect = (url: string, delay = 10000) => setTimeout(() => (window.location.href = url), delay);
