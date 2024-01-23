import axios from "axios";

const BASE_URL = 'https://mate.academy/students-api';

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
});