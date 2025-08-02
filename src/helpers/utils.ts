export const redirectWithDelay = (url: string, delay: number): void => {
  setTimeout(() => {
    window.location.href = url;
  }, delay);
};

export const extractQueryParams = () => {
  const script = document.currentScript as HTMLScriptElement;
  console.log("🚀 ~ script 001", script);
  const src = script?.src || "";
  console.log(new URL(src));
  const params = new URL(src).searchParams;

  return {
    apiKey: params.get("apiKey") || "",
    successURL: params.get("successURL") || "",
    failureURL: params.get("failureURL") || "",
    notificationURL: params.get("notificationURL") || "",
  };
};
