import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import ShopPage from '../pages/shop/shop-page.js';
import AddShopPage from '../pages/shop/add-shop-page.js';
import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import OfflinePage from '../pages/save-product-page.js';
import NotFoundPage from '../pages/not-found-page.js';
import SaveProductPage from '../pages/save-product-page.js';

const routes = {
  '/': { page: HomePage, requiresAuth: false },
  '/about': { page: AboutPage, requiresAuth: false },
  '/shop': { page: ShopPage, requiresAuth: true },
  '/shop/add': { page: AddShopPage, requiresAuth: true },
  '/shop/:id': { page: ShopPage, requiresAuth: true },
  '/login': { page: LoginPage, requiresAuth: false },
  '/register': { page: RegisterPage, requiresAuth: false },
  '/offline': { page: SaveProductPage, requiresAuth: true },
  '*': { page: NotFoundPage, requiresAuth: false },
};

export default routes;