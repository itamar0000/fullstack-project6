import axios from "axios";

function getDefaultApiBaseUrl() {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  return "http://127.0.0.1:3001";
}

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (!configuredUrl) {
    return getDefaultApiBaseUrl();
  }

  if (typeof window === "undefined") {
    return configuredUrl;
  }

  try {
    const url = new URL(configuredUrl, window.location.origin);
    const pointsAtFrontend =
      url.hostname === window.location.hostname && url.port === window.location.port;

    return pointsAtFrontend ? getDefaultApiBaseUrl() : configuredUrl;
  } catch {
    return getDefaultApiBaseUrl();
  }
}

export const API_BASE_URL = getApiBaseUrl();

const MEMORY_CACHE = new Map();
const CACHE_STORAGE_KEY = "project5.apiCache";
const TOKEN_STORAGE_KEY = "project6.authToken";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export class ApiError extends Error {
  constructor(message, status, path) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

function readStoredCache() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.sessionStorage.getItem(CACHE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStoredCache(cacheEntries) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheEntries));
  } catch {
    window.sessionStorage.removeItem(CACHE_STORAGE_KEY);
  }
}

function cloneData(data) {
  return data == null ? data : JSON.parse(JSON.stringify(data));
}

function getCached(cacheKey) {
  if (MEMORY_CACHE.has(cacheKey)) {
    return cloneData(MEMORY_CACHE.get(cacheKey));
  }

  const stored = readStoredCache();
  if (Object.prototype.hasOwnProperty.call(stored, cacheKey)) {
    MEMORY_CACHE.set(cacheKey, stored[cacheKey]);
    return cloneData(stored[cacheKey]);
  }

  return null;
}

function setCached(cacheKey, data) {
  MEMORY_CACHE.set(cacheKey, cloneData(data));
  const stored = readStoredCache();
  stored[cacheKey] = cloneData(data);
  writeStoredCache(stored);
}

export function clearCache(match = "") {
  const stored = readStoredCache();

  for (const key of Array.from(MEMORY_CACHE.keys())) {
    if (!match || key.includes(match)) {
      MEMORY_CACHE.delete(key);
    }
  }

  for (const key of Object.keys(stored)) {
    if (!match || key.includes(match)) {
      delete stored[key];
    }
  }

  writeStoredCache(stored);
}

async function parseResponse(response, path) {
  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      const looksLikeHtml = text.trim().startsWith("<");
      const message = looksLikeHtml
        ? "API returned HTML instead of JSON. Make sure the Express server is running on port 3001 and VITE_API_BASE_URL is not pointing to the React dev server."
        : "API returned an invalid JSON response.";

      throw new ApiError(message, response.status, path);
    }
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText || "Request failed";
    throw new ApiError(message, response.status, path);
  }

  return payload;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}`;

  if (method === "GET") {
    const cached = getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers
  });
  const payload = await parseResponse(response, path);

  if (method === "GET") {
    setCached(cacheKey, payload);
  }

  return payload;
}

export const axiosClient = axios.create({
  baseURL: API_BASE_URL
});

export async function apiAxiosGet(path) {
  const cacheKey = `AXIOS:${path}`;
  const cached = getCached(cacheKey);

  if (cached !== null) {
    return cached;
  }

  try {
    const token = getAuthToken();
    const response = await axiosClient.get(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (typeof response.data === "string" && response.data.trim().startsWith("<")) {
      throw new ApiError(
        "API returned HTML instead of JSON. Make sure the Express server is running on port 3001 and VITE_API_BASE_URL is not pointing to the React dev server.",
        response.status,
        path
      );
    }

    const payload = {
      data: response.data,
      totalCount: Number(response.headers["x-total-count"] || response.data.length || 0)
    };

    setCached(cacheKey, payload);
    return cloneData(payload);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const status = error.response?.status || 0;
    const message = error.response?.statusText || error.message || "Request failed";
    throw new ApiError(message, status, path);
  }
}

export function buildQuery(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
