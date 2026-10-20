
import axios from "axios";
const api = axios.create({
 baseURL: "https://tabula-core.onrender.com",
  withCredentials: true,
});

export default api;
