// The browser talks only to the BFF: /bff/* manages the cookie session, /api/* is forwarded by the BFF to the API with
// the session's token attached. The BFF's address comes from BFF_HTTP (set by the Aspire AppHost / Playwright).
const target = process.env['BFF_HTTP'] || process.env['BFF_HTTPS'] || 'http://localhost:5610';

const proxyEntry = {
  target,
  secure: false,
  changeOrigin: true,
};

module.exports = {
  '/api': proxyEntry,
  '/bff': proxyEntry,
};
