export const redirectWithDelay = (url: string, delay: number): void => {
  setTimeout(() => {
    window.location.href = url;
  }, delay);
};

// export const extractQueryParams = () => {
//   const script = document.currentScript as HTMLScriptElement;
//   const src = script?.src || "";
//   const params = new URL(src).searchParams;

//   return {
//     apiKey: params.get("apiKey") || "",
//     successURL: params.get("successURL") || "",
//     failureURL: params.get("failureURL") || "",
//     notificationURL: params.get("notificationURL") || "",
//   };
// };

export const extractQueryParams = () => {
  const script = document.currentScript as HTMLScriptElement;

  return {
    apiKey: script?.dataset.apiKey || "",
    successRedirectURL: script?.dataset.successUrl || "",
    failRedirectURL: script?.dataset.failureUrl || "",
    notificationURL: script?.dataset.notificationUrl || "",
  };
};
