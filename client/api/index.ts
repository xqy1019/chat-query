'use client';
import { set } from 'lodash';
import axios from 'redaxios';

const APi = axios.create({});

export const backendApi = axios.create({
    baseURL: '/backend',
});

(() => {
    axios.get((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + "/schema/all").then(
        () => {
        set(backendApi.defaults, "baseURL", process.env.NEXT_PUBLIC_BACKEND_URL)
        },
        err => {
            console.log(err);
        }
    );
})();

export default APi;
