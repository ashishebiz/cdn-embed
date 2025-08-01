import { AGE_APP_ENDPOINTS, BASE_API_URL } from "../constants";
import { request } from "./request.js";

export const createQRCodeSession = (apiKey: string) => request(`${BASE_API_URL}${AGE_APP_ENDPOINTS}`, "POST", {}, { "x-api-key": apiKey });

export const checkQRCodeStatus = (url: string, apiKey: string) => request(url, "GET", {}, { "x-api-key": apiKey });
