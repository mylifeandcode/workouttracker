const target = process.env['API_HTTP'] || process.env['API_HTTPS'] || 'http://localhost:5600';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
};
