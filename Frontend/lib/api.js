const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

const getHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(options.token),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  signup: (payload) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  signin: (payload) =>
    request("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createProfile: (payload, token) =>
    request("/api/profile/create", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  getProfile: (token) =>
    request("/api/profile", {
      method: "GET",
      token,
    }),

  generateChart: (payload, token) =>
    request("/api/birth-chart/generate", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  getCharts: (token) =>
    request("/api/birth-chart/user", {
      method: "GET",
      token,
    }),

  getDoshaTypes: () =>
    request("/api/dosha/types", {
      method: "GET",
    }),

  checkDosha: (payload, token) =>
    request("/api/dosha/check", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
};
