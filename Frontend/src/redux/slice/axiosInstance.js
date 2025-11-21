import axios from "axios";
import { API_BASE_URL } from "../../config";
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;