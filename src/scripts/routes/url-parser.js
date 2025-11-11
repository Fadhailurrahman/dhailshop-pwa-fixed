function extractPathnameSegments(path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const splitUrl = cleanPath.split('/');

  return {
    resource: splitUrl[0] || null,
    subpath: splitUrl[1] || null,
    remaining: splitUrl.slice(2),
  };
}

function constructRouteFromSegments(segments) {
  if (!segments || !segments.resource) return '/';

  switch (segments.resource) {
    case 'shop':
      if (segments.subpath === 'add') return '/shop/add';
      if (segments.subpath) return '/shop/:id';
      return '/shop';
    case 'about':
      return '/about';
    case 'login':
      return '/login';
    case 'register':
      return '/register';
    case 'offline':
      return '/offline';
    default:
      return '*';
  }
}

export function getActivePathname() {
  return location.hash.replace(/^#\/?/, '') || '/';
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function findRoute(url, routes) {
  if (routes[url]) return { route: routes[url], params: {} };

  const shopIdMatch = url.match(/^\/shop\/([^/]+)$/);
  if (shopIdMatch) {
    return { route: routes['/shop/:id'], params: { id: shopIdMatch[1] } };
  }

  return { route: routes['*'], params: {} };
}
