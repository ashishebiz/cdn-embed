import { BASE_API_URL, ENDPOINTS } from "../config.js";
import { request } from "./request.js";

export const createQRCodeSession = (apiKey: string) => request(`${BASE_API_URL}${ENDPOINTS.ageVerification}`, "POST", {}, { "x-api-key": apiKey });

export const checkQRCodeStatus = (url: string, apiKey: string) => request(url, "GET", {}, { "x-api-key": apiKey });
