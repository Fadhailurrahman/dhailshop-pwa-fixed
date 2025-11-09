import { login } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container" style="padding:50px 0; max-width:400px; margin:auto;">
        <h1 style="text-align:center; color:#1e3a8a; margin-bottom:20px;">Login</h1>
        <form id="login-form" style="display:flex; flex-direction:column; gap:15px;">
          <label for="email">Email:</label>
          <input type="email" id="email" placeholder="Email" required style="padding:10px; border-radius:6px; border:1px solid #ccc;" />
  
          <label for="password">Password:</label>
          <input type="password" id="password" placeholder="Password" required style="padding:10px; border-radius:6px; border:1px solid #ccc;" />
  
          <button type="submit" style="background:#1e3a8a; color:#fff; padding:10px; border:none; border-radius:6px; cursor:pointer;">Login</button>
  
          <p style="text-align:center;">Belum punya akun? <a href="#/register" style="color:#2563eb;">Daftar di sini</a></p>
          <p id="login-message" style="text-align:center; color:red;" aria-live="polite"></p>
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
      form = await this.waitForElement('#login-form');
      msg = await this.waitForElement('#login-message');
    } catch (err) {
      return console.error(err);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = 'Memproses login...';
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await login({ email, password });
        if (!response.error) {
          localStorage.setItem('token', response.loginResult.token);
          msg.style.color = 'green';
          msg.textContent = 'Login berhasil! Mengalihkan...';
          setTimeout(() => window.location.hash = '#/', 1000);
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
