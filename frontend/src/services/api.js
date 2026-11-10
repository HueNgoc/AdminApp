import Constants from 'expo-constants';
import { Platform } from 'react-native';

const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const defaultHost = Platform.OS === 'web' ? browserHost : (metroHost || 'localhost');
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:5000/api`;
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(image) {
  if (!image) return '';
  const value = String(image).trim();
  if (value.startsWith('/')) return `${API_ORIGIN}${value}`;
  if (!/^https?:\/\//i.test(value)) return `${API_ORIGIN}/uploads/${value}`;
  const localAddress = value.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i);
  return localAddress ? `${API_ORIGIN}${value.slice(localAddress[0].length)}` : value;
}

async function request(path, options = {}) {
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Kh\u00F4ng th\u1EC3 k\u1EBFt n\u1ED1i m\u00E1y ch\u1EE7.');
  return body;
}

async function saveUser(path, method, user, token) {
  const { imageFile, ...fields } = user;
  if (!imageFile) {
    return request(path, { method, headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(fields) });
  }

  const formData = new FormData();
  for (const field of ['name', 'email', 'password']) {
    if (fields[field]) formData.append(field, fields[field]);
  }
  if (fields.image) formData.append('image', fields.image);

  if (typeof window !== 'undefined') {
    const file = imageFile.file || await fetch(imageFile.uri).then((response) => response.blob());
    formData.append('image', file, imageFile.name);
  } else {
    formData.append('image', { uri: imageFile.uri, name: imageFile.name, type: imageFile.type });
  }
  return request(path, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getUsers: (token) => request('/users', { headers: { Authorization: `Bearer ${token}` } }),
  createUser: (user, token) => saveUser('/users', 'POST', user, token),
  updateUser: (id, user, token) => saveUser(`/users/${id}`, 'PUT', user, token),
  deleteUser: (id, token) => request(`/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};
