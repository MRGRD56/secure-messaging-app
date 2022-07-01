const {hostname, protocol} = window.location;

export const API_PORT = process.env['REACT_APP_API_PORT'] ?? '80';
export const BASE_URI = window.origin;
export const API_BASE_URI = `${protocol}//${hostname}:${API_PORT}`;
