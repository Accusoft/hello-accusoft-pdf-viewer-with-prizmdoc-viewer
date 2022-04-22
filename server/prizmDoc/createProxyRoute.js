'use strict';

// Proxy which allows the viewer to send requests through this web application back to PrizmDoc.
const { createProxyMiddleware } = require('http-proxy-middleware');

function createProxyRouteToPrizmDoc(path, prizmDocServerUrl, apiKey) {
  if (prizmDocServerUrl === undefined) {
    throw new Error('prizmDocServerUrl argument is required when constructing the proxy route to PrizmDoc Server');
  }

  if (typeof(prizmDocServerUrl) !== 'string') {
    throw new Error('prizmDocServerUrl must be a string');
  }

  if (apiKey !== undefined && typeof(apiKey) !== 'string') {
    throw new Error('When provided, apiKey must be a string');
  }

  let pathRewrite = {};
  pathRewrite['^' + path] = ''; // remove the proxy path part of the route when forwarding the request
  let headers = {};

  if (apiKey !== undefined) {
    headers['acs-api-key'] = apiKey;
  }

  return createProxyMiddleware(path, {
    pathRewrite: pathRewrite,
    target: prizmDocServerUrl,
    changeOrigin: true, // necessary when converting from HTTP to HTTPS
    headers,
    logLevel: 'debug'
  });
}

module.exports = createProxyRouteToPrizmDoc;
