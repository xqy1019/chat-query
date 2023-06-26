"use client"
import axios from 'redaxios';

const APi = axios.create({
});

export const backendApi = axios.create({
  "baseURL":  globalThis?.location?.protocol === 'https:' ? '/backend' : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001")
});

export default APi;
