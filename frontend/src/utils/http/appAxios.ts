import axios from 'axios';

const {hostname, protocol} = window.location;

const appAxios = axios.create({
    baseURL: `${protocol}//${hostname}:9021`
});

export default appAxios;
