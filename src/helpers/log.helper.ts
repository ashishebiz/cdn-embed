export const log = (...args: unknown[]) => console.log("[bit-age-verification]", ...args);

export function logData(container: HTMLElement | null, data: any): void {
  if (!container) return;
  const logEntry = document.createElement("div");
  logEntry.innerText = JSON.stringify(data, null, 2);
  container.prepend(logEntry);
}
