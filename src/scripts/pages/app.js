import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { AuthHelper } from '../utils/auth-helper.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #previousRoute = null;
  #logoutListenerAttached = false;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    if (this.#drawerButton && this.#navigationDrawer) {
      this.#setupDrawer();
    }

    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', isOpen);
    });

    this.#navigationDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  async renderPage() {
    if (!this.#content) {
      this.#content = document.querySelector('#main-content');
      if (!this.#content) return;
    }

    const url = getActiveRoute();
    const route = routes[url] || routes['*'];

    const token = localStorage.getItem('token');
    if (route.requiresAuth && !token) {
      window.location.hash = '#/login';
      return;
    }

    let pageInstance;
    try {
      pageInstance = typeof route.page === 'function' ? new route.page() : route.page;
    } catch {
      window.location.hash = '#/*';
      return;
    }

    const currentContent = this.#content;

    const applyTransition = async () => {
      currentContent.classList.remove('active');
      await new Promise(r => setTimeout(r, 50));
      currentContent.innerHTML = await pageInstance.render();
      currentContent.classList.add('active');

      if (pageInstance.afterRender) {
        try {
          await pageInstance.afterRender();
        } catch {}
      }
    };

    if (document.startViewTransition) {
      await document.startViewTransition(applyTransition);
    } else {
      await applyTransition();
    }

    AuthHelper.updateNavbar();

    const navList = document.querySelector('#nav-list');
    if (token && !document.querySelector('#nav-offline')) {
      const offlineLi = document.createElement('li');
      offlineLi.innerHTML = `<a href="#/offline" id="nav-offline">Simpan Cerita</a>`;
      navList.insertBefore(offlineLi, navList.querySelector('li:last-child'));
    }

    const logoutItem = document.querySelector('#nav-logout');
    if (logoutItem && !this.#logoutListenerAttached) {
      logoutItem.addEventListener('click', (e) => {
        e.preventDefault();
        AuthHelper.logout();
      });
      this.#logoutListenerAttached = true;
    }

    this.#previousRoute = url;
  }
}

export default App;
