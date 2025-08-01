export const request = async (url: string, method: "GET" | "POST" = "GET", body: any = null, headers: Record<string, string> = {}) => {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (method === "POST" && body) config.body = JSON.stringify(body);

  const response = await fetch(url, config);
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return await response.json();
};
