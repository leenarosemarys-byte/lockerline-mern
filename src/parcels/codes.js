'use strict';
const crypto = require('crypto');

/**
 * A new pickup code: six random digits from a cryptographic source.
 */
function newCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

/**
 * The code's keyed SHA-256 (HMAC). Only this is stored, never the code.
 */
function hashCode(code, key) {
  return crypto.createHmac('sha256', key).update(code).digest('hex');
}

/**
 * Whether a presented code is the one behind a stored hash, compared in constant time.
 */
function codeMatches(code, storedHash, key) {
  const presented = Buffer.from(hashCode(code, key), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return presented.length === stored.length &&
    crypto.timingSafeEqual(presented, stored);
}

module.exports = { newCode, hashCode, codeMatches };
