import CONFIG from '../config.js';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getStories(token) {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal mengambil produk');
    return { listStory: data.listStory || [] };
  } catch (error) {
    console.error('❌ Gagal mengambil produk:', error);
    return { listStory: [] };
  }
}

export async function addStory(token, formData) {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('❌ Response error:', data);
      throw new Error(data.message || 'Gagal menambahkan produk');
    }

    return data;
  } catch (error) {
    console.error('❌ Gagal menambahkan produk:', error);
    return { error: true, message: error.message || 'Tidak bisa menambahkan produk.' };
  }
}

export async function login({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login gagal');
    return data;
  } catch (error) {
    console.error('❌ Login gagal:', error);
    return { error: true, message: error.message || 'Tidak bisa login sekarang.' };
  }
}

export async function register({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registrasi gagal');
    return data;
  } catch (error) {
    console.error('❌ Registrasi gagal:', error);
    return { error: true, message: error.message || 'Tidak bisa mendaftar sekarang.' };
  }
}
