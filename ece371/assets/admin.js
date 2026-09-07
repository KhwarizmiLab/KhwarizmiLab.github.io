/*
 * Instructor panel: edit calendar sessions, tags, files, and release dates.
 */
(function () {
  'use strict';

  var auth = window.ECE371Auth;
  if (!auth) {
    return;
  }
  var session = auth.session();
  if (!session || session.role !== 'admin') {
    window.location.replace(auth.homeUrl);
    return;
  }

  var source = window.ECE371Calendar;
  if (!source) {
    return;
  }

  var DRAFT_KEY = 'ece371.calendarDraft';
  var TOKEN_KEY = 'ece371.githubToken';
  var TOKEN_NEW_URL = 'https://github.com/settings/tokens/new?description=ECE371%20one-time%20publish&scopes=public_repo';
  var TOKEN_LIST_URL = 'https://github.com/settings/tokens';
  var GH_REPO = 'KhwarizmiLab/KhwarizmiLab.github.io';
  var GH_BRANCH = 'gh-pages';
  var GH_PREFIX = 'ece371/';

  var KINDS = [
    { id: 'lecture', label: 'Lecture' },
    { id: 'lab', label: 'Lab' },
    { id: 'exam', label: 'Exam' },
    { id: 'tba', label: 'TBA' },
    { id: 'off', label: 'No class' }
  ];

  var TAG_TYPES = [
    { type: 'assignment-due', label: 'Assignment due', placeholder: 'Assignment 1 due' },
    { type: 'lab-due', label: 'Lab due', placeholder: 'Lab 1 due' },
    { type: 'exam', label: 'Midterm / exam', text: 'Midterm exam', kind: 'exam' },
    { type: 'holiday', label: 'Holiday / no class', kind: 'off' },
    { type: 'info', label: 'Note', placeholder: 'Note for students' }
  ];

  var pendingFiles = {};
  var toastEl = document.getElementById('admin-toast');
  var groupsEl = document.getElementById('admin-groups');
  var summaryEl = document.getElementById('admin-summary');
  var dirtyEl = document.getElementById('admin-dirty');

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  var published = clone(source);
  var draft = clone(source);

  try {
    var saved = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
    if (saved && saved.sessions) {
      draft = saved;
    }
  } catch (err) {
    /* start from published */
  }

  function persist() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      /* draft is still in memory */
    }
    refreshMeta();
  }

  function todayISO() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + day;
  }

  function toast(message, ms) {
    toastEl.textContent = message;
    window.setTimeout(function () {
      toastEl.textContent = '';
    }, ms || 4000);
  }

  function sessionById(id) {
    for (var i = 0; i < draft.sessions.length; i++) {
      if (draft.sessions[i].id === id) {
        return draft.sessions[i];
      }
    }
    return null;
  }

  function applyTagKind(session) {
    var tags = session.tags || [];
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].type === 'exam') {
        session.kind = 'exam';
        return;
      }
    }
    for (var j = 0; j < tags.length; j++) {
      if (tags[j].type === 'holiday' || tags[j].type === 'off') {
        session.kind = 'off';
        return;
      }
    }
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var bytes = new Uint8Array(reader.result);
        var chunk = 0x8000;
        var pieces = [];
        for (var i = 0; i < bytes.length; i += chunk) {
          pieces.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)));
        }
        resolve(btoa(pieces.join('')));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function safeName(name) {
    return String(name || 'file').replace(/[^A-Za-z0-9._-]/g, '_');
  }

  function folderFor(kind) {
    if (kind === 'lab') {
      return 'assets/labs/';
    }
    return 'assets/slides/';
  }

  function nextId(prefix, existing) {
    var max = 0;
    existing.forEach(function (item) {
      var match = new RegExp('^' + prefix + '(\\d+)$').exec(item.id || '');
      if (match) {
        max = Math.max(max, +match[1]);
      }
    });
    draft.sessions.forEach(function (session) {
      var match = session.resource && new RegExp('^' + prefix + '(\\d+)$').exec(session.resource.id || '');
      if (match) {
        max = Math.max(max, +match[1]);
      }
    });
    return prefix + (max + 1);
  }

  function allResources() {
    var items = {};
    function add(item) {
      if (item && item.id) {
        items[item.id] = item.release || 'locked';
      }
    }
    (draft.assignments || []).forEach(add);
    (draft.labs || []).forEach(add);
    (draft.sessions || []).forEach(function (session) {
      add(session.resource);
    });
    return items;
  }

  function generateCalendarFile() {
    var payload = {
      updated: todayISO(),
      assignments: draft.assignments,
      labs: draft.labs,
      sessions: draft.sessions
    };
    return 'window.ECE371Calendar = ' + JSON.stringify(payload, null, 2) + ';\n';
  }

  function generateReleaseFile() {
    var items = allResources();
    var ids = Object.keys(items);
    var lines = [
      '/*',
      ' * Release schedule — generated from Manage Releases.',
      ' * Dated items open at 9:00 AM Eastern.',
      ' */',
      'window.ECE371Release = {',
      '  updated: \'' + todayISO() + '\',',
      '  items: {'
    ];
    ids.forEach(function (id, index) {
      var comma = index === ids.length - 1 ? '' : ',';
      lines.push('    \'' + id + '\': \'' + items[id] + '\'' + comma);
    });
    lines.push('  }');
    lines.push('};');
    lines.push('');
    lines.push('window.ECE371Release.opensAt = function (value) {');
    lines.push('  var parts = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);');
    lines.push('  if (!parts) { return null; }');
    lines.push('  var guess = new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], 14, 0, 0));');
    lines.push('  var hour = parseInt(new Intl.DateTimeFormat(\'en-US\', {');
    lines.push('    timeZone: \'America/New_York\', hour: \'2-digit\', hour12: false, hourCycle: \'h23\'');
    lines.push('  }).format(guess), 10);');
    lines.push('  if (hour === 10) { guess = new Date(guess.getTime() - 3600000); }');
    lines.push('  else if (hour === 8) { guess = new Date(guess.getTime() + 3600000); }');
    lines.push('  return guess;');
    lines.push('};');
    return lines.join('\n') + '\n';
  }

  function utf8ToBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function githubHeaders(token) {
    return {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function githubJson(token, path, options) {
    options = options || {};
    return fetch('https://api.github.com/repos/' + GH_REPO + path, {
      method: options.method || 'GET',
      headers: githubHeaders(token),
      cache: 'no-store',
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok) {
          throw new Error(body.message || ('GitHub returned ' + response.status));
        }
        return body;
      });
    });
  }

  function commitFiles(token, files) {
    return githubJson(token, '/git/ref/heads/' + GH_BRANCH).then(function (ref) {
      return githubJson(token, '/git/commits/' + ref.object.sha);
    }).then(function (commit) {
      var parent = commit.sha;
      var baseTree = commit.tree.sha;
      return Promise.all(files.map(function (file) {
        return githubJson(token, '/git/blobs', {
          method: 'POST',
          body: { content: file.content, encoding: 'base64' }
        }).then(function (blob) {
          return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
        });
      })).then(function (treeItems) {
        return githubJson(token, '/git/trees', {
          method: 'POST',
          body: { base_tree: baseTree, tree: treeItems }
        }).then(function (tree) {
          return githubJson(token, '/git/commits', {
            method: 'POST',
            body: {
              message: 'Update ECE 371 calendar, files, and release schedule.',
              tree: tree.sha,
              parents: [parent]
            }
          });
        }).then(function (created) {
          return githubJson(token, '/git/refs/heads/' + GH_BRANCH, {
            method: 'PATCH',
            body: { sha: created.sha }
          });
        });
      });
    });
  }

  function clearTokenField() {
    document.getElementById('gh-token').value = '';
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      /* ignore */
    }
  }

  function hideDeleteNudge() {
    var el = document.getElementById('token-delete-nudge');
    if (el) {
      el.hidden = true;
    }
  }

  function showDeleteNudge() {
    document.getElementById('publish-setup').open = true;
    document.getElementById('token-delete-nudge').hidden = false;
  }

  function tokenStillWorks(token) {
    return fetch('https://api.github.com/user', {
      headers: { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token },
      cache: 'no-store',
      credentials: 'omit'
    }).then(function (response) {
      return response.ok;
    }).catch(function () {
      return false;
    });
  }

  function sendRevoke(token) {
    return fetch('https://api.github.com/credentials/revoke', {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      body: JSON.stringify({ credentials: [token] })
    }).then(function (response) {
      return response.status === 202 || response.ok;
    }).catch(function () {
      return false;
    });
  }

  function revokeAndConfirm(token) {
    return sendRevoke(token).then(function () {
      return new Promise(function (resolve) { window.setTimeout(resolve, 800); });
    }).then(function () {
      return tokenStillWorks(token);
    }).then(function (alive) {
      if (!alive) {
        return true;
      }
      return sendRevoke(token).then(function () {
        return new Promise(function (resolve) { window.setTimeout(resolve, 800); });
      }).then(function () {
        return tokenStillWorks(token);
      }).then(function (still) {
        return !still;
      });
    });
  }

  function promptForNewToken() {
    document.getElementById('publish-setup').open = true;
    document.getElementById('gh-token').focus();
    window.open(TOKEN_NEW_URL, '_blank', 'noopener');
    toast('Generate a new token, paste it, then click Publish.');
  }

  function showPublishError(message) {
    var box = document.getElementById('publish-error');
    document.getElementById('publish-setup').open = true;
    box.hidden = false;
    box.textContent = message;
    toast(message);
  }

  function collectUploadFiles() {
    var files = [
      { path: GH_PREFIX + 'assets/calendar-data.js', content: utf8ToBase64(generateCalendarFile()) },
      { path: GH_PREFIX + 'assets/release.js', content: utf8ToBase64(generateReleaseFile()) }
    ];
    Object.keys(pendingFiles).forEach(function (id) {
      var pending = pendingFiles[id];
      files.push({ path: GH_PREFIX + pending.href, content: pending.base64 });
    });
    return files;
  }

  function markPublished() {
    published = clone(draft);
    pendingFiles = {};
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      /* ignore */
    }
    refreshAll();
  }

  function isDirty() {
    if (Object.keys(pendingFiles).length) {
      return true;
    }
    return JSON.stringify(draft) !== JSON.stringify(published);
  }

  function refreshMeta() {
    var resources = allResources();
    var ids = Object.keys(resources);
    var open = 0;
    ids.forEach(function (id) {
      var value = resources[id];
      if (value === 'open') {
        open += 1;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(value) && value <= todayISO()) {
        open += 1;
      }
    });
    summaryEl.textContent = 'Calendar has ' + draft.sessions.length +
      ' class meetings. ' + open + ' of ' + ids.length + ' files are past their release date.';
    dirtyEl.hidden = !isDirty();
  }

  function addTag(session, type) {
    var spec = TAG_TYPES.filter(function (item) { return item.type === type; })[0];
    if (!spec) {
      return;
    }
    var text = spec.text || window.prompt(spec.label, spec.placeholder || '');
    if (spec.placeholder && (text === null || !String(text).trim())) {
      return;
    }
    session.tags = session.tags || [];
    session.tags.push({ type: type, text: String(text || spec.label).trim() });
    if (spec.kind) {
      session.kind = spec.kind;
    }
    persist();
    refreshAll();
  }

  function removeTag(session, index) {
    var removed = session.tags.splice(index, 1)[0];
    if (removed && removed.type === 'exam' && session.kind === 'exam') {
      session.kind = 'lecture';
    }
    if (removed && removed.type === 'holiday' && session.kind === 'off') {
      session.kind = 'lecture';
    }
    persist();
    refreshAll();
  }

  function ensureResource(session) {
    if (session.resource) {
      return session.resource;
    }
    var prefix = session.kind === 'lab' ? 'lab-' : 'lecture-';
    var list = session.kind === 'lab' ? draft.labs : [];
    session.resource = {
      id: nextId(prefix, list),
      label: session.kind === 'lab' ? '[lab handout]' : '[slides]',
      href: '',
      release: session.date
    };
    return session.resource;
  }

  function bindFile(session, file) {
    var resource = ensureResource(session);
    var href = folderFor(session.kind) + safeName(file.name);
    resource.href = href;
    resource.label = session.kind === 'lab' ? '[lab handout]' : '[slides]';
    if (!resource.release) {
      resource.release = session.date;
    }
    return fileToBase64(file).then(function (base64) {
      pendingFiles[session.id] = { href: href, base64: base64, name: file.name };
      persist();
      refreshAll();
      toast('File attached. Publish to put it on the calendar.');
    });
  }

  function renderTags(session) {
    var wrap = document.createElement('div');
    wrap.className = 'admin-tags';
    (session.tags || []).forEach(function (tag, index) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'admin-tag';
      chip.textContent = tag.text + ' ×';
      chip.title = 'Remove tag';
      chip.addEventListener('click', function () {
        removeTag(session, index);
      });
      wrap.appendChild(chip);
    });
    var add = document.createElement('select');
    add.className = 'admin-tag-add';
    add.innerHTML = '<option value="">Add tag…</option>';
    TAG_TYPES.forEach(function (spec) {
      var option = document.createElement('option');
      option.value = spec.type;
      option.textContent = spec.label;
      add.appendChild(option);
    });
    add.addEventListener('change', function () {
      if (add.value) {
        addTag(session, add.value);
      }
    });
    wrap.appendChild(add);
    return wrap;
  }

  function renderSession(session) {
    var card = document.createElement('article');
    card.className = 'admin-session day-' + (session.kind || 'lecture');

    var heading = document.createElement('h4');
    heading.className = 'admin-session-title';
    heading.textContent = 'Week ' + session.week + ' · ' +
      (session.slot === 'tue' ? 'Tuesday' : 'Thursday');
    card.appendChild(heading);

    var grid = document.createElement('div');
    grid.className = 'admin-session-grid';

    var date = document.createElement('input');
    date.type = 'date';
    date.className = 'admin-date';
    date.value = session.date;
    date.setAttribute('aria-label', 'Class date');
    date.addEventListener('change', function () {
      var previous = session.date;
      session.date = date.value;
      if (session.resource && (session.resource.release === previous || !session.resource.release)) {
        session.resource.release = date.value;
      }
      persist();
      refreshAll();
    });

    var title = document.createElement('input');
    title.type = 'text';
    title.className = 'admin-title';
    title.value = session.title;
    title.setAttribute('aria-label', 'Class title');
    title.addEventListener('change', function () {
      session.title = title.value;
      persist();
      refreshAll();
    });

    var kind = document.createElement('select');
    kind.className = 'admin-kind';
    kind.setAttribute('aria-label', 'Block type');
    KINDS.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      if (item.id === session.kind) {
        option.selected = true;
      }
      kind.appendChild(option);
    });
    kind.addEventListener('change', function () {
      session.kind = kind.value;
      persist();
      refreshAll();
    });

    grid.appendChild(labeled('Date', date));
    grid.appendChild(labeled('Title', title));
    grid.appendChild(labeled('Block color', kind));
    card.appendChild(grid);
    card.appendChild(renderTags(session));

    var files = document.createElement('div');
    files.className = 'admin-file-row';
    var release = document.createElement('input');
    release.type = 'date';
    release.className = 'admin-date';
    release.value = (session.resource && session.resource.release) || session.date;
    release.disabled = !session.resource;
    release.addEventListener('change', function () {
      if (session.resource) {
        session.resource.release = release.value;
        persist();
        refreshAll();
      }
    });
    var file = document.createElement('input');
    file.type = 'file';
    file.accept = '.pdf,.html,.zip,.ppt,.pptx';
    file.addEventListener('change', function () {
      if (file.files && file.files[0]) {
        bindFile(session, file.files[0]);
      }
    });
    var fileLabel = document.createElement('span');
    fileLabel.className = 'admin-file-name';
    if (pendingFiles[session.id]) {
      fileLabel.textContent = 'New file: ' + pendingFiles[session.id].name;
    } else if (session.resource && session.resource.href) {
      fileLabel.textContent = session.resource.href.split('/').pop();
    } else {
      fileLabel.textContent = 'No file yet';
    }
    files.appendChild(labeled('Opens 9:00 AM on', release));
    files.appendChild(labeled('File', file));
    files.appendChild(fileLabel);
    card.appendChild(files);
    return card;
  }

  function labeled(text, control) {
    var label = document.createElement('label');
    label.className = 'admin-field';
    var span = document.createElement('span');
    span.textContent = text;
    label.appendChild(span);
    label.appendChild(control);
    return label;
  }

  function renderListEditor(title, items, prefix, folder) {
    var section = document.createElement('section');
    section.className = 'admin-group';
    var heading = document.createElement('h3');
    heading.className = 'sub-heading';
    heading.textContent = title;
    section.appendChild(heading);
    items.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'admin-row';
      var name = document.createElement('input');
      name.type = 'text';
      name.className = 'admin-title';
      name.value = item.title;
      name.addEventListener('change', function () {
        item.title = name.value;
        persist();
        refreshAll();
      });
      var date = document.createElement('input');
      date.type = 'date';
      date.className = 'admin-date';
      date.value = item.release || '';
      date.addEventListener('change', function () {
        item.release = date.value;
        persist();
        refreshAll();
      });
      row.appendChild(name);
      row.appendChild(labeled('Opens', date));
      section.appendChild(row);
    });
    return section;
  }

  function refreshAll() {
    groupsEl.innerHTML = '';
    var calendar = document.createElement('section');
    calendar.className = 'admin-group';
    var heading = document.createElement('h3');
    heading.className = 'sub-heading';
    heading.textContent = 'Classes (updates the calendar)';
    calendar.appendChild(heading);
    var weeks = {};
    draft.sessions.forEach(function (session) {
      if (!weeks[session.week]) {
        weeks[session.week] = [];
      }
      weeks[session.week].push(session);
    });
    Object.keys(weeks).sort(function (a, b) { return a - b; }).forEach(function (week) {
      weeks[week].forEach(function (session) {
        calendar.appendChild(renderSession(session));
      });
    });
    groupsEl.appendChild(calendar);
    groupsEl.appendChild(renderListEditor('Assignments', draft.assignments, 'assignment-', 'assets/assignment/'));
    groupsEl.appendChild(renderListEditor('Labs', draft.labs, 'lab-', 'assets/labs/'));
    refreshMeta();
  }

  function publishSchedule() {
    var token = document.getElementById('gh-token').value.replace(/\s+/g, '');
    var button = document.getElementById('btn-publish');
    var errorBox = document.getElementById('publish-error');
    errorBox.hidden = true;
    errorBox.textContent = '';
    hideDeleteNudge();
    if (!token) {
      promptForNewToken();
      return;
    }
    button.disabled = true;
    button.textContent = 'Publishing…';
    var files = collectUploadFiles();
    commitFiles(token, files)
      .then(function () {
        markPublished();
        clearTokenField();
        return revokeAndConfirm(token).then(function (revoked) {
          if (revoked) {
            toast('Published. Calendar and files updated. Token revoked.', 8000);
            return;
          }
          showDeleteNudge();
          toast('Published. Delete the token on GitHub with the link below.', 10000);
        });
      })
      .catch(function (err) {
        var message = err.message || 'Publish failed.';
        if (message.indexOf('Resource not accessible') !== -1) {
          message = 'This token cannot write to the lab repo. Use a classic public_repo token.';
        }
        showPublishError(message);
      })
      .then(function () {
        button.disabled = false;
        button.textContent = 'Publish schedule';
      });
  }

  document.getElementById('btn-publish').addEventListener('click', publishSchedule);

  document.getElementById('btn-today').addEventListener('click', function () {
    var today = todayISO();
    draft.sessions.forEach(function (session) {
      if (session.resource) {
        session.resource.release = today;
      }
    });
    draft.assignments.forEach(function (item) { item.release = today; });
    draft.labs.forEach(function (item) { item.release = today; });
    persist();
    refreshAll();
  });

  document.getElementById('btn-lock').addEventListener('click', function () {
    draft.sessions.forEach(function (session) {
      if (session.resource) {
        session.resource.release = 'locked';
      }
    });
    draft.assignments.forEach(function (item) { item.release = 'locked'; });
    draft.labs.forEach(function (item) { item.release = 'locked'; });
    persist();
    refreshAll();
  });

  document.getElementById('btn-reset').addEventListener('click', function () {
    draft = clone(published);
    pendingFiles = {};
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      /* ignore */
    }
    refreshAll();
    toast('Draft discarded.');
  });

  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    /* ignore */
  }

  refreshAll();
})();
