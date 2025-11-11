function extractPathnameSegments(path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const splitUrl = cleanPath.split('/');

  return {
    resource: splitUrl[0] || null,
    subpath: splitUrl[1] || null,
    remaining: splitUrl.slice(2) || [],
  };
}

function constructRouteFromSegments(segments) {
  if (segments.resource === 'shop' && segments.subpath === 'add') return '/shop/add';
  if (segments.resource === 'shop' && segments.subpath) return '/shop/:id';
  if (segments.resource === 'about') return '/about';
  if (segments.resource === 'login') return '/login';
  if (segments.resource === 'register') return '/register';
  if (segments.resource === 'offline') return '/offline';
  if (!segments.resource) return '/';
  return '*';
}

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const segments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(segments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const segments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(segments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
