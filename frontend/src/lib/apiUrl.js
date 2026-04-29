const LOCAL_API_URL = "http://localhost:3000/api";

export function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return import.meta.env.DEV ? LOCAL_API_URL : "/api";
}

export function getApiOrigin() {
  const baseUrl = getApiBaseUrl();

  return baseUrl.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
}
