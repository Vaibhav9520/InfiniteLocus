const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => "");
    throw new Error(errorMessage || `Request failed with status ${response.status}`);
  }

  // Handle no-content responses
  if (response.status === 204) return null;

  return response.json();
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
