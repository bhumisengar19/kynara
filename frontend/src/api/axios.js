import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:5005/api",
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
