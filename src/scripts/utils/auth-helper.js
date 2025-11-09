export const AuthHelper = {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
  
    login(token) {
      localStorage.setItem('token', token);
      this.updateNavbar();
    },
  
    logout() {
      localStorage.removeItem('token');
      this.updateNavbar();
      window.location.hash = '#/login';
    },
  
    updateNavbar() {
      const loginItem = document.querySelector('#nav-login');
      const logoutItem = document.querySelector('#nav-logout');
  
      if (!loginItem || !logoutItem) return;
  
      if (this.isLoggedIn()) {
        loginItem.style.display = 'none';
        logoutItem.style.display = 'block';
      } else {
        loginItem.style.display = 'block';
        logoutItem.style.display = 'none';
      }
    },
  };
  