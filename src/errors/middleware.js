'use strict';
const { DomainError } = require('./index');

function problem(req, res, { status, type, title, detail, extras = {} }) {
  res.status(status).type('application/problem+json')
    .json({ type, title, status, detail, instance: req.path, ...extras });
}

/**
 * The last route: a path the app does not serve is a 404 in the same shape as every other error. No ticket names a
 * type for it, so it carries the standard "about:blank" (a plain HTTP error, nothing more to say).
 */
function notFound(req, res) {
  problem(req, res, {
    status: 404, type: 'about:blank', title: 'Not Found', detail: `Nothing is served at ${req.path}`,
  });
}

/**
 * The one place that turns a thrown error into an answer. Express knows an error handler by its four arguments, so
 * `next` stays although it is not called.
 */
function errorHandler(err, req, res, next) {
  if (err instanceof DomainError) {
    problem(req, res, { status: err.status, type: err.type, title: err.title, detail: err.message, extras: err.extras() });
    return;
  }
  throw err;
}

module.exports = { notFound, errorHandler };
