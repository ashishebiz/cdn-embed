import { GeolocationNotSupportedMessage, LocationErrorMessage, DEFAULT_HEADERS } from "../constants";
import { IGeolocation } from "../types";
import { showErrorMessageHTML } from "../ui";

export const sleep = (seconds: number): Promise<void> => {
  const ms = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const extractQueryParams = () => {
  const script = document.currentScript as HTMLScriptElement;

  return {
    apiKey: script?.dataset.apiKey || "",
    successRedirectURL: script?.dataset.successUrl || "",
    failRedirectURL: script?.dataset.failureUrl || "",
    notificationURL: script?.dataset.notificationUrl || "",
  };
};

export const getGeolocation = async (qrContainer: HTMLElement | null): Promise<IGeolocation> => {
  const permissionStatus = await checkGeolocationPermission();

  if (permissionStatus === "denied") {
    if (qrContainer) qrContainer.innerHTML = showErrorMessageHTML(LocationErrorMessage);
    alert(LocationErrorMessage);
    throw new Error(LocationErrorMessage);
  }

  return new Promise((res, rej) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // The latitude and longitude are available in the position.coords object
          const latitude = position.coords.latitude ?? 0;
          const longitude = position.coords.longitude ?? 0;

          res({
            latitude,
            longitude,
          });
        },
        (error) => {
          if (qrContainer) qrContainer.innerHTML = showErrorMessageHTML(LocationErrorMessage);
          rej(`ERR_LOC : Error getting location: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      if (qrContainer) qrContainer.innerHTML = showErrorMessageHTML(GeolocationNotSupportedMessage);
      rej(GeolocationNotSupportedMessage);
    }
  });
};

const checkGeolocationPermission = async (): Promise<PermissionState> => {
  if (!navigator.permissions) return "prompt";

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state; // 'granted', 'prompt', or 'denied'
  } catch {
    return "prompt";
  }
};

export async function getRequest(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    const message = (await res.json())?.message;
    alert("Something Went Wrong");
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
    alert("Something Went Wrong");
    throw new Error(`${res.status} : ${message}`);
  }
  return res.json();
}
