import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "https://api-uat.taprootcrm.com/",
  // baseURL: "http://10.30.188.27:1234",
});

// Add a request interceptor to attach the token from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  if (token) {
    config.headers["Authorization"] = `Token ${token}`; // Add the token to the request headers
  }

  // config.headers["domain"] = "uat.taprootcrm.com";
  // config.headers["domain"] = "10.30.188.27";
  config.headers["domain"] = window.location.hostname.replace("www.", "");
  return config;
});

export default axiosInstance;
