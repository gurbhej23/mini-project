import axios from "axios";

const host = window.location.hostname;
const API = axios.create({
  baseURL: `http://${host}:5000/api`,
});

export default API;
