import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    withCredentials: true //by default, axios does not send cookies in cross-origin requests. Setting withCredentials to true allows cookies to be sent in cross-origin requests, which is necessary for authentication and session management when the frontend and backend are hosted on different domains or ports.
});
export default axiosInstance;