/*
 * Course-site access gate.
 *
 * The site is public by default. Course logistics (meeting time and room,
 * staff contact details) and the materials themselves sit behind a sign-in,
 * and instructors see more than students. There are three audiences:
 *
 *   public    nobody signed in
 *   student   signed in as 'student'
 *   admin     signed in as 'admin' (sees everything a student sees, plus more)
 *
 * Two markup hooks control what each audience gets:
 *
 *   data-requires="student"   element is dropped unless signed in
 *   data-requires="admin"     element is dropped unless signed in as instructor
 *   data-signed-out           element is dropped as soon as anyone signs in,
 *                             so a public page can show a short stand-in for
 *                             whatever is being withheld
 *
 * Whole pages opt in through the script tag that loads this file:
 *
 *   <script src="assets/auth.js">                   public page
 *   <script src="assets/auth.js" data-auth="student">  sign-in required
 *   <script src="assets/auth.js" data-auth="admin">    instructors only
 *   <script src="assets/auth.js" data-auth="login">    the sign-in page itself
 *
 * IMPORTANT — this is a deterrent, not access control. The account list below
 * travels to the browser, withheld text still sits in the page source, and
 * files under assets/ stay reachable by direct URL. It is fine for keeping the
 * room number and staff contacts out of search results and casual view. It is
 * NOT sufficient for anything covered by FERPA: never put grades, rosters,
 * submissions, or anything else identifying a student on this site. Those
 * belong on Canvas, which has real server-side authentication.
 *
 * To change a password, run tools/hash-password.js and paste the new digest.
 */
(function () {
  'use strict';

  var SALT = 'ece371-fall2026';
  var STORAGE_KEY = 'ece371.session';
  var SESSION_DAYS = 7;
  /* Bump this to force everyone to sign in again (e.g. after a password change). */
  var VERSION = 1;

  var ACCOUNTS = {
    admin: {
      role: 'admin',
      label: 'Instructor',
      hash: '7e09678b46b21099c63d14d5681faab0d67d00c1f3d5fd66e7bd342ff75a4294'
    },
    student: {
      role: 'student',
      label: 'Student',
      hash: '212d03c3305df6542b765f25c1a97f11c48253968ae9c1f6e99af6d09bfb98bb'
    }
  };

  /* ---------------------------------------------------------------- sha256 */

  function utf8(str) {
    return unescape(encodeURIComponent(str));
  }

  function sha256(input) {
    var ascii = utf8(input);
    var rightRotate = function (value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    };
    var maxWord = Math.pow(2, 32);
    var result = '';
    var words = [];
    var asciiBitLength = ascii.length * 8;
    var i;
    var j;

    var hash = sha256.h = sha256.h || [];
    var k = sha256.k = sha256.k || [];
    var primeCounter = k.length;

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while (ascii.length % 64 - 56) {
      ascii += '\x00';
    }
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15];
        var w2 = w[i - 2];
        var a = hash[0];
        var e = hash[4];
        var temp1 = hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] = i < 16 ? w[i] : (
            w[i - 16] +
            (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
            w[i - 7] +
            (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  function digest(username, password) {
    return sha256(SALT + '|' + username + '|' + password);
  }

  /* ----------------------------------------------------------------- paths */

  /* Pages live at the site root and two levels down, so resolve everything
     relative to where this script itself was loaded from. */
  var script = document.currentScript;
  var root = script ? script.src.replace(/assets\/auth\.js(\?.*)?$/, '') : '';
  var loginUrl = root + 'login.html';
  var homeUrl = root + 'home.html';

  function currentPath() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  /* Only ever redirect to a same-origin path, so a crafted ?next= cannot bounce
     a signed-in user off to another site. */
  function safeNext(value) {
    if (!value) {
      return null;
    }
    if (value.charAt(0) !== '/' || value.charAt(1) === '/' || value.indexOf('\\') !== -1) {
      return null;
    }
    return value;
  }

  /* --------------------------------------------------------------- session */

  function readSession() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
    if (!raw) {
      return null;
    }

    var session;
    try {
      session = JSON.parse(raw);
    } catch (err) {
      return null;
    }

    var account = session && ACCOUNTS[session.user];
    var valid = account &&
      session.version === VERSION &&
      session.proof === account.hash &&
      typeof session.expires === 'number' &&
      session.expires > Date.now();

    if (!valid) {
      clearSession();
      return null;
    }
    return { user: session.user, role: account.role, label: account.label };
  }

  function writeSession(username) {
    var account = ACCOUNTS[username];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: VERSION,
        user: username,
        proof: account.hash,
        expires: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
      }));
    } catch (err) {
      /* Private-browsing modes can refuse writes; the sign-in still proceeds
         for this page load, the user just has to sign in again later. */
    }
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      /* nothing to do */
    }
  }

  function signIn(username, password) {
    var name = String(username || '').trim().toLowerCase();
    var account = ACCOUNTS[name];
    if (!account || digest(name, String(password || '')) !== account.hash) {
      return null;
    }
    writeSession(name);
    return { user: name, role: account.role, label: account.label };
  }

  function signOut() {
    clearSession();
    window.location.replace(loginUrl);
  }

  /* ------------------------------------------------------------ page chrome */

  /* Adds the nav-bar session control: a "Log in" link for visitors, or the
     "Signed in as … / Sign out" pair once somebody has a session. */
  function renderSessionControls(session) {
    var list = document.querySelector('.site-nav .nav-list');
    if (!list) {
      return;
    }

    var item = document.createElement('li');
    item.className = 'nav-session';

    if (!session) {
      var login = document.createElement('a');
      login.className = 'nav-login';
      /* Come back to whatever they were reading instead of the home page. */
      login.href = loginUrl + '?next=' + encodeURIComponent(currentPath());
      login.textContent = 'Log in';
      item.appendChild(login);
      list.appendChild(item);
      return;
    }

    var who = document.createElement('span');
    who.className = 'nav-session-user';
    who.textContent = session.label;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-session-signout';
    button.textContent = 'Sign out';
    button.addEventListener('click', signOut);

    item.appendChild(who);
    item.appendChild(button);
    list.appendChild(item);
  }

  var RANK = { public: 0, student: 1, admin: 2 };

  /* Drops anything the current audience is not entitled to. Removing rather
     than hiding keeps withheld text out of the accessibility tree and out of
     Ctrl-F, though it is still in the page source — see the note up top. */
  function applyVisibility(session) {
    var rank = session ? RANK[session.role] : RANK.public;

    var restricted = document.querySelectorAll('[data-requires]');
    for (var i = restricted.length - 1; i >= 0; i--) {
      var needed = RANK[restricted[i].getAttribute('data-requires')];
      if (needed === undefined) {
        needed = RANK.student;
      }
      if (rank < needed) {
        restricted[i].parentNode.removeChild(restricted[i]);
      }
    }

    /* The public stand-ins ("sign in to see the room") stop being useful the
       moment the real thing is on the page. */
    if (session) {
      var teasers = document.querySelectorAll('[data-signed-out]');
      for (var j = teasers.length - 1; j >= 0; j--) {
        teasers[j].parentNode.removeChild(teasers[j]);
      }
      return;
    }

    /* Course materials all live under assets/, so one rule covers slides, lab
       handouts and assignment handouts. Doing it by rule rather than by an
       attribute on each link means adding a lecture to the calendar cannot
       accidentally publish it. Visitors still see that the item exists. */
    var links = document.querySelectorAll('a[href^="assets/"]');
    for (var k = links.length - 1; k >= 0; k--) {
      lockLink(links[k]);
    }
  }

  /* Swaps a materials link for inert text plus a "Sign in" marker, matching
     how gate.js renders an item that has not been released yet. */
  function lockLink(link) {
    var locked = document.createElement('span');
    locked.className = 'gate-locked';
    locked.textContent = link.textContent.trim();

    var hint = document.createElement('span');
    hint.className = 'gate-when';
    hint.textContent = 'Sign in';

    link.parentNode.replaceChild(locked, link);
    locked.parentNode.insertBefore(hint, locked.nextSibling);

    /* Tell gate.js this one is already handled, so it does not lock it twice. */
    var owner = locked.closest ? locked.closest('[data-gate]') : null;
    (owner || locked.parentNode).classList.add('is-locked');
  }

  function onReady(fn) {
    if (document.readyState === 'complete') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* ------------------------------------------------------------------ guard */

  var mode = script ? script.getAttribute('data-auth') : null;
  var session = readSession();

  /* The sign-in page manages its own chrome and must never guard itself. */
  if (mode !== 'login') {
    var required = RANK[mode];

    if (required !== undefined && required > RANK.public) {
      if (!session) {
        /* Runs from <head>, before the body paints, so nothing leaks on the
           way out. replace() keeps the page out of back-button history. */
        window.location.replace(loginUrl + '?next=' + encodeURIComponent(currentPath()));
        return;
      }
      if (RANK[session.role] < required) {
        /* Signed in, but not far enough up — send them somewhere they can use
           rather than bouncing them to a sign-in form they already satisfied. */
        window.location.replace(homeUrl);
        return;
      }
    }

    onReady(function () {
      renderSessionControls(session);
      applyVisibility(session);
    });
  }

  window.ECE371Auth = {
    signIn: signIn,
    signOut: signOut,
    session: function () {
      return readSession();
    },
    safeNext: safeNext,
    root: root,
    homeUrl: homeUrl,
    loginUrl: loginUrl,
    digest: digest
  };
})();
