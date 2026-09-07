/*
 * Generates the password digests used by assets/auth.js.
 *
 *   node tools/hash-password.js <username> <password>
 *
 * Paste the printed digest into the matching ACCOUNTS entry in assets/auth.js,
 * then bump VERSION in that file so existing sessions are forced to sign in
 * again with the new password.
 */
'use strict';

const crypto = require('crypto');

/* Must stay identical to SALT in assets/auth.js. */
const SALT = 'ece371-fall2026';

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('usage: node tools/hash-password.js <username> <password>');
  process.exit(1);
}

const digest = crypto
  .createHash('sha256')
  .update(`${SALT}|${username.trim().toLowerCase()}|${password}`, 'utf8')
  .digest('hex');

console.log(digest);
