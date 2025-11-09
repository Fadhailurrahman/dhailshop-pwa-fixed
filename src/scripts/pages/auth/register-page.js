import { register } from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container" style="padding:50px 0; max-width:400px; margin:auto;">
        <h1 style="text-align:center; color:#1e3a8a; margin-bottom:20px;">Daftar</h1>
        <form id="register-form" style="display:flex; flex-direction:column; gap:15px;">
          <label for="name">Nama Lengkap:</label>
          <input type="text" id="name" placeholder="Nama Lengkap" required style="padding:10px; border-radius:6px; border:1px solid #ccc;" />
  
          <label for="email">Email:</label>
          <input type="email" id="email" placeholder="Email" required style="padding:10px; border-radius:6px; border:1px solid #ccc;" />
  
          <label for="password">Password:</label>
          <input type="password" id="password" placeholder="Password" required style="padding:10px; border-radius:6px; border:1px solid #ccc;" />
  
          <button type="submit" style="background:#1e3a8a; color:#fff; padding:10px; border:none; border-radius:6px; cursor:pointer;">Daftar</button>
  
          <p style="text-align:center;">Sudah punya akun? <a href="#/login" style="color:#2563eb;">Login di sini</a></p>
          <p id="register-message" style="text-align:center; color:red;" aria-live="polite"></p>
        </form>
      </section>
    `;
  }  

  waitForElement(selector, timeout = 3000) {
    const interval = 50;
    let elapsed = 0;
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(check);
          resolve(el);
        } else {
          elapsed += interval;
          if (elapsed >= timeout) {
            clearInterval(check);
            reject(`Elemen ${selector} tidak ditemukan dalam ${timeout}ms`);
          }
        }
      }, interval);
    });
  }

  async afterRender() {
    let form, msg;
    try {
      form = await this.waitForElement('#register-form');
      msg = await this.waitForElement('#register-message');
    } catch (err) {
      return console.error(err);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = 'Memproses pendaftaran...';
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await register({ name, email, password });
        if (!response.error) {
          msg.style.color = 'green';
          msg.textContent = 'Pendaftaran berhasil! Mengalihkan ke login...';
          setTimeout(() => window.location.hash = '#/login', 1000);
        } else {
          msg.style.color = 'red';
          msg.textContent = response.message;
        }
      } catch (err) {
        msg.style.color = 'red';
        msg.textContent = 'Terjadi kesalahan server';
      }
    });
  }
}
