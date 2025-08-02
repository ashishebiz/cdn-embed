export const getElement = (selector: string) => document.querySelector<HTMLElement>(selector);

export const setHTML = (el: HTMLElement, html: string) => {
  el.innerHTML = html;
};

export const delayRedirect = (url: string, delay = 10000) => setTimeout(() => (window.location.href = url), delay);
