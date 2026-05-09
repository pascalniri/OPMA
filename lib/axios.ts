import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// You can add interceptors here later (e.g., for logging or global error handling)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., redirect to login on 401)
    return Promise.reject(error);
  }
);

export default axiosInstance;
