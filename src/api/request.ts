import { DEFAULT_HEADERS } from "../constants";

export async function getRequest(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    const message = (await res.json())?.message;
    alert(message);
    throw new Error(`${res.status} : ${message}`);
  }
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
  if (!res.ok) {
    const message = (await res.json())?.message;
    alert(message);
    throw new Error(`${res.status} : ${message}`);
  }
  return res.json();
}
