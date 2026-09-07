/*
 * Release schedule — controls what students can open, and when.
 *
 * Edit this from admin.html and click Publish. Dated items open on their
 * own at 9:00 AM Eastern — you do not need to come back on the release day.
 *
 *   'open'         visible to students immediately
 *   'locked'       hidden from students until you change it
 *   'YYYY-MM-DD'   unlocks for students at 9:00 AM Eastern on that date
 *
 * Instructors always see everything regardless of what is set here.
 */
window.ECE371Release = {
  updated: '2026-09-07',

  items: {
    'lecture-1': '2026-09-08',
    'lecture-2': '2026-09-10',
    'lecture-3': '2026-09-15',
    'lecture-4': '2026-09-17',
    'lecture-5': '2026-09-24',
    'lecture-6': '2026-09-29',
    'lecture-7': '2026-10-06',
    'lecture-8': '2026-10-08',
    'lecture-9': '2026-10-13',
    'lecture-10': '2026-10-15',
    'lecture-11': '2026-10-22',
    'lecture-12': '2026-10-29',
    'lecture-13': '2026-11-05',
    'lecture-14': '2026-11-10',
    'lecture-15': '2026-11-17',
    'lecture-16': '2026-11-19',
    'lecture-17': '2026-12-01',
    'lecture-18': '2026-12-08',
    'assignment-1': '2026-09-10',
    'assignment-2': '2026-09-24',
    'assignment-3': '2026-10-22',
    'lab-1': '2026-09-22',
    'lab-2': '2026-10-01',
    'lab-3': '2026-10-27',
    'lab-4': '2026-11-12',
    'lab-5': '2026-12-03'
  }
};

/* 9:00 AM America/New_York on YYYY-MM-DD, including DST. */
window.ECE371Release.opensAt = function (value) {
  var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) {
    return null;
  }
  var guess = new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], 14, 0, 0));
  var hour = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    hour12: false,
    hourCycle: 'h23'
  }).format(guess), 10);
  if (hour === 10) {
    guess = new Date(guess.getTime() - 60 * 60 * 1000);
  } else if (hour === 8) {
    guess = new Date(guess.getTime() + 60 * 60 * 1000);
  }
  return guess;
};
