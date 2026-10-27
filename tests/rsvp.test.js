const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const scriptSource = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
const clientSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const demoRows = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'demo-responses.json'), 'utf8'));
const rsvpFunction = require('../netlify/functions/rsvp');
const wishesFunction = require('../netlify/functions/wishes');

function createBackend(initialRows = []) {
  const rows = initialRows.map((row) => [...row]);
  const sheet = {
    getLastRow: () => rows.length,
    getLastColumn: () => Math.max(1, ...rows.map((row) => row.length)),
    getRange(row, column, rowCount = 1, columnCount = 1) {
      return {
        getValues: () => rows.slice(row - 1, row - 1 + rowCount).map((item) => Array.from({ length: columnCount }, (_, index) => item[column - 1 + index] ?? '')),
        setValues: (values) => values.forEach((value, index) => { rows[row - 1 + index] = [...(rows[row - 1 + index] || [])]; value.forEach((cell, offset) => { rows[row - 1 + index][column - 1 + offset] = cell; }); }),
      };
    },
    appendRow: (row) => rows.push([...row]),
    setFrozenRows: () => {},
  };
  const context = {
    URL,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key) => ({ RSVP_SHARED_SECRET: 's'.repeat(40), RSVP_SPREADSHEET_ID: 'sheet-id', RSVP_SHEET_NAME: 'Responses' })[key] || '' }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: (content) => ({ content, setMimeType() { return this; } }) },
  };
  vm.createContext(context);
  vm.runInContext(scriptSource, context);
  const post = (request) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify({ ...request, secret: 's'.repeat(40) }) } }).content);
  return { rows, post, context };
}

function submission(overrides = {}) {
  return {
    action: 'submit', name: 'Mira Guest', wishes: 'Wishing you a lifetime of joy.',
    weddingAttendance: 'attending', weddingGuestCount: 2,
    receptionAttendance: 'declined', receptionGuestCount: 0,
    submissionId: '11111111-1111-4111-8111-111111111111', ...overrides,
  };
}

test('RSVP submit handler resolves the hidden anti-spam field from its own form', () => {
  assert.match(clientSource, /function setupRsvp\(form\)[\s\S]*?honeypot=form\.querySelector\('\[name="website"\]'\)/);
  assert.match(clientSource, /website:honeypot\.value/);
});

test('local preview has clearly marked sample RSVPs and approved sample wishes', () => {
  assert.match(clientSource, /LOCAL_DEMO_MODE=\['localhost','127\.0\.0\.1'\]\.includes\(location\.hostname\)&&location\.port==='8080'/);
  assert.match(clientSource, /localStorage\.setItem\(DEMO_STORAGE_KEY,JSON\.stringify\(submissions\)\)/);
  assert.equal(demoRows.length, 3);
  assert.equal(demoRows.filter((row) => row.approval === 'APPROVED').length, 2);
  assert.equal(demoRows.every((row) => row.email === ''), true);
  assert.equal(demoRows.every((row) => Object.hasOwn(row, 'weddingAttendance') && Object.hasOwn(row, 'receptionAttendance') && Object.hasOwn(row, 'approval')), true);
});

test('RSVP validates separate attendance and guest counts, with and without a photo', () => {
  const backend = createBackend();
  const saved = backend.post(submission({ photoUrl: 'https://res.cloudinary.com/sample/image/upload/v1/guest.jpg', photoMetadata: '{"type":"image/jpeg","size":100}' }));
  assert.equal(saved.ok, true);
  assert.equal(backend.rows.length, 2);
  assert.equal(backend.rows[1][3], '');
  assert.equal(backend.rows[1][7], 'attending');
  assert.equal(backend.rows[1][8], 2);
  assert.equal(backend.rows[1][9], 'declined');
  assert.equal(backend.rows[1][11], 'https://res.cloudinary.com/sample/image/upload/v1/guest.jpg');
  assert.equal(backend.rows[1][13], '');

  const noPhoto = backend.post(submission({ submissionId: '22222222-2222-4222-8222-222222222222', weddingAttendance: 'declined', weddingGuestCount: 0, receptionAttendance: 'attending', receptionGuestCount: 3 }));
  assert.equal(noPhoto.ok, true);
  assert.equal(backend.rows[2][11], '');
  assert.equal(backend.rows[2][8], 0);
  assert.equal(backend.rows[2][10], 3);
  assert.equal(noPhoto.weddingTotalConfirmed, 2);
  assert.equal(noPhoto.receptionTotalConfirmed, 3);
});

test('invalid counts and untrusted photo URLs are rejected', () => {
  const backend = createBackend();
  assert.equal(backend.post(submission({ weddingGuestCount: 0 })).error, 'invalid_request');
  assert.equal(backend.post(submission({ photoUrl: 'https://example.com/guest.jpg' })).error, 'invalid_request');
  assert.equal(backend.post(submission({ photoUrl: 'http://res.cloudinary.com/sample/image/upload/guest.jpg' })).error, 'invalid_request');
});

test('duplicate retries append once and only approved wishes are public', () => {
  const oldRow = [new Date(0), 'historical-id', 'Historical Guest', 'private@example.com', '', '', 'A private old wish.'];
  const backend = createBackend([['Timestamp', 'Submission ID', 'Guest name', 'Email', 'Attendance', 'Guest count', 'Wishes'], oldRow]);
  const payload = submission({ submissionId: '33333333-3333-4333-8333-333333333333' });
  assert.equal(backend.post(payload).ok, true);
  assert.equal(backend.post(payload).duplicate, true);
  assert.equal(backend.rows.length, 3);
  assert.deepEqual(backend.post({ action: 'approved_wishes' }).wishes, []);
  backend.rows[2][13] = 'APPROVED';
  const wishes = backend.post({ action: 'approved_wishes' });
  assert.deepEqual(wishes.wishes.map((item) => [item.displayName, item.wish, item.photoUrl]), [['Mira Guest', 'Wishing you a lifetime of joy.', '']]);
  assert.equal(JSON.stringify(wishes).includes('private@example.com'), false);
  assert.equal(JSON.stringify(wishes).includes('Historical Guest'), false);
});

test('Netlify RSVP proxy forwards attendance and photo URL without email', async () => {
  process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/example/exec';
  process.env.RSVP_SHARED_SECRET = 's'.repeat(40);
  const previousFetch = global.fetch;
  let forwarded;
  global.fetch = async (_url, options) => {
    forwarded = JSON.parse(options.body);
    return { ok: true, json: async () => ({ ok: true, weddingTotalConfirmed: 2, receptionTotalConfirmed: 0 }) };
  };
  try {
    const response = await rsvpFunction.handler({ httpMethod: 'POST', headers: { host: 'invite.example', origin: 'https://invite.example' }, body: JSON.stringify(submission({ photoUrl: 'https://res.cloudinary.com/sample/image/upload/guest.jpg', photoMetadata: '{"type":"image/jpeg"}' })) });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.equal(body.weddingTotalConfirmed, 2);
    assert.equal('email' in forwarded, false);
    assert.equal(forwarded.photoUrl, 'https://res.cloudinary.com/sample/image/upload/guest.jpg');
  } finally { global.fetch = previousFetch; }
});

test('Netlify RSVP proxy keeps the error state when Apps Script fails', async () => {
  process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/example/exec';
  process.env.RSVP_SHARED_SECRET = 's'.repeat(40);
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ ok: false, error: 'service_unavailable', message: 'Temporary backend error.' }) });
  try {
    const response = await rsvpFunction.handler({ httpMethod: 'POST', headers: {}, body: JSON.stringify(submission()) });
    assert.equal(response.statusCode, 502);
    assert.equal(JSON.parse(response.body).ok, false);
  } finally { global.fetch = previousFetch; }
});

test('public Netlify wishes endpoint returns only the approved public fields', async () => {
  process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/example/exec';
  process.env.RSVP_SHARED_SECRET = 's'.repeat(40);
  const previousFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, wishes: [{ displayName: 'Asha', wish: 'All our love', photoUrl: 'https://res.cloudinary.com/sample/image/upload/asha.png', email: 'private@example.com', guestCount: 2 }] }) });
  try {
    const response = await wishesFunction.handler({ httpMethod: 'GET', headers: {} });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(body.wishes, [{ displayName: 'Asha', wish: 'All our love', photoUrl: 'https://res.cloudinary.com/sample/image/upload/asha.png' }]);
    assert.equal(JSON.stringify(body).includes('private@example.com'), false);
  } finally { global.fetch = previousFetch; }
});
