import axios from "axios";
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
client.interceptors.request.use((c) => {
  const s = JSON.parse(localStorage.getItem("ql_session") || "{}");
  if (s.token) c.headers.Authorization = `Bearer ${s.token}`;
  return c;
});

const isDemoLogin = (data) =>
  data.password === "demo1234" &&
  ["demo@queueless.app", "owner@queueless.app"].includes(data.email);

const makeRequest = async (method, url, data, config) => {
  try {
    const response = await client({ method, url, data, ...config });
    return response.data;
  } catch (error) {
    const err = new Error(
      error.response?.data?.message ||
        "Unable to reach QueueLess. Check that the API and database are running.",
    );
    if (error.response) err.response = error.response;
    throw err;
  }
};

export const api = {
  get: (url, config) => makeRequest("get", url, undefined, config),
  post: (url, data, config) => makeRequest("post", url, data, config),
  patch: (url, data, config) => makeRequest("patch", url, data, config),
  delete: (url, config) => makeRequest("delete", url, undefined, config),
  auth: async ({ mode, ...data }) => {
    try {
      return await makeRequest(
        "post",
        `/auth/${mode === "register" ? "register" : "login"}`,
        data,
      );
    } catch (error) {
      if (mode === "login" && isDemoLogin(data)) {
        return {
          token: "demo-token",
          user: {
            id: data.email.startsWith("owner") ? "demo-owner" : "demo-customer",
            name: data.email.startsWith("owner")
              ? "Maya Kapoor"
              : "Aarav Sharma",
            email: data.email,
            role: data.email.startsWith("owner") ? "owner" : "customer",
          },
        };
      }
      throw error;
    }
  },
};
