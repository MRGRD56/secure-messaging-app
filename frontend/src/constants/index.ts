const {hostname, protocol} = window.location;

export const BASE_URI = window.origin;
export const API_BASE_URI = `${protocol}//${hostname}:9021`;
