import { fetchData } from "./api/client";
import { startPolling } from "./api/poller";

(async function main() {
  try {
    console.log("CDN script loaded");
    const response = await fetchData();
    console.log("Initial API response:", response);

    // Optional: start polling
    startPolling();
  } catch (error) {
    console.log("Error initializing script", error);
  }
})();
