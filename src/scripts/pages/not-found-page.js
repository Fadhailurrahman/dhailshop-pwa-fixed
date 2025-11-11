import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import ShopPage from '../pages/shop/shop-page.js';
import AddShopPage from '../pages/shop/add-shop-page.js';
import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import OfflinePage from '../pages/offline-page.js';
import NotFoundPage from '../pages/not-found-page.js'; 

const routes = {
  '/': { page: HomePage },  
  '/about': { page: AboutPage },
  '/shop': { page: ShopPage, requiresAuth: true },
  '/shop/add': { page: AddShopPage, requiresAuth: true },
  '/login': { page: LoginPage },
  '/register': { page: RegisterPage },
  '/offline': { page: OfflinePage },
  '*': { page: NotFoundPage },
};

export default routes;
