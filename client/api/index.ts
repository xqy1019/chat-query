import axios from 'redaxios';

const APi = axios.create({
});

export const backendApi = axios.create({
  "baseURL":process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
});

export default APi;