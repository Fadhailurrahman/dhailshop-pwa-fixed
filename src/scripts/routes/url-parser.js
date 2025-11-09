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
  if (segments.resource === 'shop' && segments.subpath === 'add') {
    return '/shop/add';
  }

  if (segments.resource && segments.subpath) {
    return `/${segments.resource}/:id`;
  }

  if (segments.resource) return `/${segments.resource}`;
  return '/';
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
