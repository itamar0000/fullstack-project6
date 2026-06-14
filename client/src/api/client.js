import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const MEMORY_CACHE = new Map();
const CACHE_STORAGE_KEY = "project5.apiCache";

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
  const payload = text ? JSON.parse(text) : null;

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

  const headers = {
    "Content-Type": "application/json",
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
    const response = await axiosClient.get(path);
    const payload = {
      data: response.data,
      totalCount: Number(response.headers["x-total-count"] || response.data.length || 0)
    };

    setCached(cacheKey, payload);
    return cloneData(payload);
  } catch (error) {
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
