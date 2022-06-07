import axios from 'axios';
import {API_BASE_URI} from '../../constants';

const appAxios = axios.create({
    baseURL: API_BASE_URI
});

export default appAxios;
