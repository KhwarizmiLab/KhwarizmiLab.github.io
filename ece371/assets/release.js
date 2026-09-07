/*
 * Release schedule — controls what students can open, and when.
 *
 * This file is the single source of truth for the whole site. Edit it by hand,
 * or use admin.html to click through the changes and download a replacement
 * copy. Either way the change only reaches students once this file is
 * committed and deployed.
 *
 * Each entry takes one of three values:
 *
 *   'open'         visible to students immediately
 *   'locked'       hidden from students until you change it
 *   'YYYY-MM-DD'   unlocks for students at midnight (local time) on that date
 *
 * Instructors always see everything regardless of what is set here.
 */
window.ECE371Release = {
  updated: '2026-09-07',

  items: {
    /* Lecture slides default to unlocking on the day of the lecture. */
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

    /* Assignments open roughly two weeks before they are due. */
    'assignment-1': '2026-09-10',
    'assignment-2': '2026-09-24',
    'assignment-3': '2026-10-22',

    /* Labs open on the day of their matching lab lecture. */
    'lab-1': '2026-09-22',
    'lab-2': '2026-10-01',
    'lab-3': '2026-10-27',
    'lab-4': '2026-11-12',
    'lab-5': '2026-12-03'
  }
};
