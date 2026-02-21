import axios from "axios";


export const api = axios.create({
    // DEV
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});