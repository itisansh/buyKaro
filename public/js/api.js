const BASE_URL = "/api";

// Every call includes credentials so the session cookie is sent automatically.
async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    credentials: "include",
    headers: {},
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  try {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, ...data };
  } catch { return { ok: false, status: 0, message: "Could not connect. Please try again." }; }
}

export { apiRequest };
