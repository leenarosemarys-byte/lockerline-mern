
'use strict';

const crypto = require('node:crypto');
const { problem } = require('./index');

function pathMatches(pattern, actualPath) {
  const escapedPattern = pattern
    .split('/')
    .map((part) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return '[^/]+';
      }

      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  const regex = new RegExp(`^${escapedPattern}/?$`);

  return regex.test(actualPath);
}

function makeLastRoute(paths) {
  return (req, res, next) => {
    const matchingPath = Object.keys(paths).find((pattern) =>
      pathMatches(pattern, req.path)
    );

    // A documented path exists, but this HTTP method is not supported.
    if (matchingPath) {
      const allowedMethods = Object.keys(paths[matchingPath])
        .map((method) => method.toUpperCase());

      res.set('Allow', allowedMethods.join(', '));

      return problem(req, res, {
        status: 405,
        type: 'about:blank',
        title: 'Method Not Allowed',
        detail: `${req.path} answers ${allowedMethods.join(', ')} only`,
        extras: {
          allow: allowedMethods.join(', '),
        },
      });
    }

    // No documented path matches the requested URL.
    return problem(req, res, {
      status: 404,
      type: '/errors/not-found',
      title: 'Not found',
      detail: 'The requested resource was not found',
    });
  };
}

function errorHandler(err, req, res, next) {
  // Handle expected application errors.
  if (err && err.status && err.type && err.title) {
    const extras =
      typeof err.extras === 'function' ? err.extras() : {};

    return problem(req, res, {
      status: err.status,
      type: err.type,
      title: err.title,
      detail: err.detail,
      extras,
    });
  }

  // Handle unexpected errors.
  const requestId = crypto.randomUUID();

  console.log(`Internal error requestId=${requestId}`, err);

  return problem(req, res, {
    status: 500,
    type: '/errors/internal',
    title: 'Internal server error',
    detail: 'An unexpected error occurred',
    extras: { requestId },
  });
}

module.exports = {
  makeLastRoute,
  errorHandler,
};
