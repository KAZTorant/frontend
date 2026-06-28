export const PRODUCTION_API_URL = 'https://kazza.qr-menu.cc';
export const PRODUCTION_FRONTEND_URL = 'https://kazza-front.qr-menu.cc';

export const DEV_API_HOST = '192.168.1.106';
export const DEV_API_PORT = '8005';

export function getApiBaseUrl() {
  if (process.env.VUE_APP_API_BASE_URL) {
    return process.env.VUE_APP_API_BASE_URL.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_URL;
  }

  const apiHost = process.env.VUE_APP_API_HOST || DEV_API_HOST;
  const apiPort = process.env.VUE_APP_API_PORT || DEV_API_PORT;
  const apiProtocol = process.env.VUE_APP_API_PROTOCOL || 'http';
  const defaultPort = apiProtocol === 'https' ? '443' : '80';
  const portSuffix = apiPort && apiPort !== defaultPort ? `:${apiPort}` : '';

  return `${apiProtocol}://${apiHost}${portSuffix}`;
}

export function getFrontendUrl() {
  if (process.env.VUE_APP_FRONTEND_URL) {
    const url = process.env.VUE_APP_FRONTEND_URL.replace(/\/$/, '');
    return `${url}/`;
  }

  if (process.env.NODE_ENV === 'production') {
    return `${PRODUCTION_FRONTEND_URL}/`;
  }

  return null;
}
