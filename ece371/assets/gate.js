/*
 * Applies the release schedule in assets/release.js to the page.
 *
 * Instructors see every item. Students see item names and dates always, but
 * only reach the underlying file once its release date has passed. Signed-out
 * visitors get the strictest view; most gated links are removed before this
 * runs anyway, because auth.js has already stripped what they cannot see.
 *
 * Like the sign-in gate, this hides links rather than protecting files: a
 * locked PDF is still sitting at its published URL. Keep genuinely embargoed
 * material out of the repository until you are ready to release it.
 */
(function () {
  'use strict';

  var PREVIEW_KEY = 'ece371.preview';

  var auth = window.ECE371Auth;
  var schedule = window.ECE371Release;

  if (!auth || !schedule) {
    return;
  }

  /* No session is fine now that the site is public: a signed-out visitor is
     simply held to the strictest view, the same one a student sees. */
  var session = auth.session();

  /* -------------------------------------------------------------- schedule */

  function parseDate(value) {
    if (schedule.opensAt) {
      return schedule.opensAt(value);
    }
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!parts) {
      return null;
    }
    /* Fallback: 9:00 AM local if an older release.js has no opensAt helper. */
    return new Date(+parts[1], +parts[2] - 1, +parts[3], 9, 0, 0);
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(date) {
    return MONTHS[date.getMonth()] + ' ' + date.getDate();
  }

  function statusOf(id) {
    var value = schedule.items[id];

    if (value === 'open') {
      return { released: true, date: null };
    }
    if (!value || value === 'locked') {
      return { released: false, date: null };
    }

    var date = parseDate(value);
    if (!date) {
      /* An unparseable date is treated as locked rather than silently open. */
      return { released: false, date: null };
    }
    return { released: Date.now() >= date.getTime(), date: date };
  }

  /* ------------------------------------------------------------ view state */

  function previewing() {
    try {
      return window.localStorage.getItem(PREVIEW_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function setPreviewing(on) {
    try {
      if (on) {
        window.localStorage.setItem(PREVIEW_KEY, '1');
      } else {
        window.localStorage.removeItem(PREVIEW_KEY);
      }
    } catch (err) {
      /* Preview mode just won't stick; not worth interrupting the page. */
    }
  }

  var isAdmin = !!session && session.role === 'admin';
  var asStudent = !isAdmin || previewing();

  /* --------------------------------------------------------------- markup */

  function availabilityText(status) {
    return status.date ? 'Opens ' + formatDate(status.date) + ' at 9:00 AM' : 'Not yet posted';
  }

  /* Swaps the link inside a gated element for inert text, so students still
     read the lecture or lab name but cannot open the file. */
  function lockElement(element, status) {
    var link = element.querySelector('a');
    var label = (link ? link.textContent : element.textContent).trim();

    var locked = document.createElement('span');
    locked.className = 'gate-locked';
    locked.textContent = label;

    var when = document.createElement('span');
    when.className = 'gate-when';
    when.textContent = availabilityText(status);

    if (link) {
      link.parentNode.replaceChild(locked, link);
    } else {
      element.textContent = '';
      element.appendChild(locked);
    }
    locked.parentNode.insertBefore(when, locked.nextSibling);
    element.classList.add('is-locked');
  }

  /* Instructors keep the working link, but get a marker on anything students
     cannot see yet, so the calendar doubles as a release overview. */
  function flagForAdmin(element, status) {
    var badge = document.createElement('span');
    badge.className = 'gate-badge';
    badge.textContent = status.date ? formatDate(status.date) : 'hidden';
    badge.title = status.date
      ? 'Hidden from students until 9:00 AM Eastern on ' + formatDate(status.date)
      : 'Hidden from students';
    element.appendChild(badge);
    element.classList.add('is-admin-hidden');
  }

  function applyToItems() {
    var gated = document.querySelectorAll('[data-gate]');

    for (var i = 0; i < gated.length; i++) {
      var element = gated[i];

      /* auth.js already replaced this link for a signed-out visitor. */
      if (element.classList.contains('is-locked')) {
        continue;
      }

      var status = statusOf(element.getAttribute('data-gate'));

      if (status.released) {
        continue;
      }
      if (asStudent) {
        lockElement(element, status);
      } else {
        flagForAdmin(element, status);
      }
    }
  }

  /* --------------------------------------------------- whole-page gating */

  /* Lab and assignment handouts are their own pages, so blocking the link on
     the index is not enough — the page itself has to turn students away. */
  function applyToPage() {
    var id = document.body.getAttribute('data-gate-page');
    if (!id) {
      return;
    }

    var status = statusOf(id);
    if (status.released || !asStudent) {
      if (!status.released && !asStudent) {
        showAdminNotice(status);
      }
      return;
    }

    var main = document.getElementById('main-content');
    if (!main) {
      return;
    }

    var title = (document.querySelector('main h2') || {}).textContent || 'This item';

    main.innerHTML = '';

    var panel = document.createElement('section');
    panel.className = 'gate-page-notice';

    var heading = document.createElement('h2');
    heading.textContent = title.trim();

    var message = document.createElement('p');
    message.className = 'gate-page-message';
    message.textContent = status.date
      ? 'This handout opens at 9:00 AM Eastern on ' + formatDate(status.date) + '.'
      : 'This handout has not been posted yet.';

    var hint = document.createElement('p');
    hint.className = 'gate-page-hint';
    hint.textContent = 'Check the calendar for the full schedule, or ask the ' +
      'course staff if you think this should already be available.';

    var back = document.createElement('p');
    back.className = 'back-link';
    var backLink = document.createElement('a');
    backLink.href = auth.root + 'assignments.html';
    backLink.textContent = '\u2190 Back to Assignments';
    back.appendChild(backLink);

    panel.appendChild(heading);
    panel.appendChild(message);
    panel.appendChild(hint);
    panel.appendChild(back);
    main.appendChild(panel);
  }

  function showAdminNotice(status) {
    var main = document.getElementById('main-content');
    if (!main) {
      return;
    }
    var notice = document.createElement('p');
    notice.className = 'gate-admin-notice';
    notice.textContent = status.date
      ? 'Students cannot see this page until 9:00 AM Eastern on ' + formatDate(status.date) + '.'
      : 'Students cannot see this page yet.';
    main.insertBefore(notice, main.firstChild);
  }

  /* ----------------------------------------------------------- admin tools */

  function addAdminControls() {
    if (!isAdmin) {
      return;
    }

    var list = document.querySelector('.site-nav .nav-list');
    var session_item = document.querySelector('.nav-session');
    if (!list || !session_item) {
      return;
    }

    var manage = document.createElement('a');
    manage.className = 'nav-manage';
    manage.href = auth.root + 'admin.html';
    manage.textContent = 'Manage releases';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-preview';
    toggle.textContent = asStudent ? 'Exit student view' : 'View as student';
    toggle.addEventListener('click', function () {
      setPreviewing(!previewing());
      window.location.reload();
    });

    session_item.insertBefore(toggle, session_item.firstChild);
    session_item.insertBefore(manage, toggle);
  }

  function addPreviewBanner() {
    if (!isAdmin || !asStudent) {
      return;
    }
    var banner = document.createElement('div');
    banner.className = 'preview-banner';
    banner.textContent = 'Student view — you are seeing the site as a student does.';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function run() {
    addAdminControls();
    addPreviewBanner();
    applyToItems();
    applyToPage();
  }

  /* This script is deferred, so it evaluates while readyState is already
     'interactive'. Only 'complete' means DOMContentLoaded has fired; anything
     earlier must queue, so that auth.js — which registered first — gets to
     build the nav before we add the instructor controls to it. */
  if (document.readyState === 'complete') {
    run();
  } else {
    document.addEventListener('DOMContentLoaded', run);
  }
})();
