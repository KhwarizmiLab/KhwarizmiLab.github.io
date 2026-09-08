/*
 * Release schedule — generated from Manage Releases.
 * Dated items open at 9:00 AM Eastern.
 */
window.ECE371Release = {
  updated: '2026-09-08',
  items: {
    'assignment-1': 'locked',
    'assignment-2': 'locked',
    'assignment-3': 'locked',
    'lab-1': 'locked',
    'lab-2': 'locked',
    'lab-3': 'locked',
    'lab-4': 'locked',
    'lab-5': 'locked',
    'lecture-1': '2026-09-16',
    'lecture-2': 'locked',
    'lecture-3': 'locked',
    'lecture-4': 'locked',
    'lecture-5': 'locked',
    'lecture-6': 'locked',
    'lecture-7': 'locked',
    'lecture-8': 'locked',
    'lecture-9': 'locked',
    'lecture-10': 'locked',
    'lecture-11': 'locked',
    'lecture-12': 'locked',
    'lecture-13': 'locked',
    'lecture-14': 'locked',
    'lecture-15': 'locked',
    'lecture-16': 'locked',
    'lecture-17': 'locked',
    'lecture-18': 'locked'
  }
};

window.ECE371Release.opensAt = function (value) {
  var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) { return null; }
  var guess = new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], 14, 0, 0));
  var hour = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', hour12: false, hourCycle: 'h23'
  }).format(guess), 10);
  if (hour === 10) { guess = new Date(guess.getTime() - 3600000); }
  else if (hour === 8) { guess = new Date(guess.getTime() + 3600000); }
  return guess;
};
