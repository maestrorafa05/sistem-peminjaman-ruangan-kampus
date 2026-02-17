import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5238";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("paras_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore localStorage access error
  }

  return config;
});

// Helpful in dev when backend is down / https redirect breaks.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // keep original error
    return Promise.reject(err);
  }
);
