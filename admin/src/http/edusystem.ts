import axios from "axios";

const baseURL = import.meta.env.VITE_EDUSYSTEM_CORE_URL;

const $edu = axios.create({
  baseURL,
  timeout: 15000,
});

export const isEduConfigured = !!baseURL;

export default $edu;
