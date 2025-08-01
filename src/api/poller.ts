import { fetchData } from "./client";
import { POLL_INTERVAL_MS } from "../config";

export function startPolling() {
  setInterval(async () => {
    try {
      const data = await fetchData();
      console.log("Polled data:", data);
    } catch (err) {
      console.log("Polling error:", err);
    }
  }, POLL_INTERVAL_MS);
}
