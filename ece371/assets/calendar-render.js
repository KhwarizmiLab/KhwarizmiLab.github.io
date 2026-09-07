/*
 * Fills the calendar table and assignment lists from calendar-data.js.
 */
(function () {
  'use strict';

  var data = window.ECE371Calendar;
  if (!data) {
    return;
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function parseISO(iso) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!parts) {
      return null;
    }
    return { y: +parts[1], m: +parts[2], d: +parts[3] };
  }

  function formatShort(iso) {
    var p = parseISO(iso);
    return p ? (p.m + '/' + p.d) : iso;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function kindOf(session) {
    if (session.kind) {
      return session.kind;
    }
    var tags = session.tags || [];
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].type === 'holiday' || tags[i].type === 'off') {
        return 'off';
      }
      if (tags[i].type === 'exam') {
        return 'exam';
      }
      if (tags[i].type === 'lab-session') {
        return 'lab';
      }
      if (tags[i].type === 'tba') {
        return 'tba';
      }
    }
    return 'lecture';
  }

  function renderSession(session) {
    if (!session) {
      return '';
    }
    var kind = kindOf(session);
    var html = '<td class="day-' + kind + '"><div>';
    html += '<div><span class="entry-date">' + escapeHtml(formatShort(session.date)) + ':</span></div>';
    html += '<div class="entry-content' + (kind === 'off' ? ' no-class' : '') + '">' +
      escapeHtml(session.title) + '</div>';
    if (session.resource && session.resource.href) {
      var gate = session.resource.id
        ? ' data-gate="' + escapeHtml(session.resource.id) + '"'
        : '';
      html += '<div class="entry-line"' + gate + '><a href="' +
        escapeHtml(session.resource.href) + '">' +
        escapeHtml(session.resource.label || '[file]') + '</a></div>';
    }
    (session.tags || []).forEach(function (tag) {
      if (tag.text) {
        html += '<div class="entry-line note">' + escapeHtml(tag.text) + '</div>';
      }
    });
    html += '</div></td>';
    return html;
  }

  function renderCalendar() {
    var tbody = document.getElementById('calendar-body');
    if (!tbody) {
      return;
    }
    var byWeek = {};
    data.sessions.forEach(function (session) {
      if (!byWeek[session.week]) {
        byWeek[session.week] = { tue: null, thu: null };
      }
      byWeek[session.week][session.slot] = session;
    });
    var weeks = Object.keys(byWeek).map(Number).sort(function (a, b) { return a - b; });
    var html = '';
    weeks.forEach(function (week) {
      var row = byWeek[week];
      html += '<tr><td class="week-cell">' + week + '</td>';
      html += renderSession(row.tue);
      html += row.thu ? renderSession(row.thu) : '<td></td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
  }

  function renderList(targetId, items) {
    var list = document.getElementById(targetId);
    if (!list || !items) {
      return;
    }
    list.innerHTML = items.map(function (item) {
      return '<li data-gate="' + escapeHtml(item.id) + '"><a href="' +
        escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></li>';
    }).join('');
  }

  function syncRelease() {
    if (!window.ECE371Release) {
      window.ECE371Release = { items: {} };
    }
    var items = window.ECE371Release.items || {};
    function add(item) {
      if (item && item.id && item.release) {
        items[item.id] = item.release;
      }
    }
    (data.assignments || []).forEach(add);
    (data.labs || []).forEach(add);
    (data.sessions || []).forEach(function (session) {
      add(session.resource);
    });
    window.ECE371Release.items = items;
  }

  function run() {
    syncRelease();
    renderCalendar();
    renderList('assignment-list', data.assignments);
    renderList('lab-list', data.labs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.ECE371Render = {
    kindOf: kindOf,
    formatShort: formatShort,
    syncRelease: syncRelease
  };
})();
