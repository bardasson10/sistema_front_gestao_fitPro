import axios from "axios";


export const api = axios.create({
    // DEV
    baseURL: "http://localhost:3333/",
});