'use client';
import { set } from 'lodash';
import axios from 'redaxios';

const APi = axios.create({});

export const backendApi = axios.create({
    baseURL:globalThis?.sessionStorage?.getItem("baseURL") || '/backend',
});

(() => {
  if (globalThis.sessionStorage && !sessionStorage.getItem("baseURL")) {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    axios.get((url) + "/schema/all").then(
        () => {
          set(backendApi.defaults, "baseURL", url)
          sessionStorage.setItem("baseURL", url)
        },
        err => {
          console.log(err);
          sessionStorage.setItem("baseURL",'/backend')
        }
    );
  }
})();

export default APi;
