import axios from "axios";
import { API_BASE_URL } from "../../config";
axios.defaults.baseURL = "https://nasalogistic.onrender.com";
axios.defaults.withCredentials = true;