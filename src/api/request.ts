import { DEFAULT_HEADERS } from "../constants";

export async function getRequest(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { method: "GET", headers });
  return res.json();
}

export async function postRequest(url: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
