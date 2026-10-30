// Tests for the Supabase-backed Netlify Functions. Supabase itself is NOT contacted:
// global fetch is replaced with a small in-memory stand-in for the REST/Storage endpoints used.
const test = require('node:test');
const assert = require('node:assert/strict');

const ENV = { SUPABASE_URL: 'https://abc.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_test_key_123', ADMIN_PASSWORD: 'correct horse battery' };
const TOKEN = 'A'.repeat(31) + 'b';
const SUB = '3f0c2a8e-6b1d-4c7e-9a2f-1b2c3d4e5f60';

function fresh(name) { delete require.cache[require.resolve(`../netlify/functions/${name}`)]; return require(`../netlify/functions/${name}`); }

function mockSupabase() {
  const calls = [];
  const state = { guests: [], invitations: [{ id: '11111111-1111-4111-8111-111111111111', token: TOKEN, guest: { display_name: 'Priya', language: 'ta' } }] };
  global.fetch = async (url, init = {}) => {
    const u = new URL(url); const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ path: u.pathname + u.search, method: init.method || 'GET', body, headers: init.headers || {} });
    const reply = (status, data) => ({ ok: status < 400, status, text: async () => (data === undefined ? '' : JSON.stringify(data)) });
    if (u.pathname === '/rest/v1/invitations' && (init.method || 'GET') === 'GET') {
      const token = decodeURIComponent((u.search.match(/token=eq\.([^&]+)/) || [])[1] || '');
      return reply(200, state.invitations.filter((i) => i.token === token).map(({ id, guest }) => ({ id, guest })));
    }
    if (u.pathname === '/rest/v1/invitations' && init.method === 'PATCH') return reply(204);
    if (u.pathname === '/rest/v1/rpc/submit_rsvp') return reply(200, { response_id: 'r1', duplicate: false, updated: false });
    if (u.pathname === '/rest/v1/rpc/rsvp_totals') return reply(200, { wedding: 3, reception: 5 });
    if (u.pathname.startsWith('/storage/v1/object/upload/sign/guest-photos/')) return reply(200, { url: '/object/upload/sign/guest-photos/x?token=t' });
    if (u.pathname === '/rest/v1/guests' && init.method === 'POST') {
      if (state.guests.some((g) => g.name_key === body.name_key)) return reply(409, { code: '23505' });
      const g = { id: '22222222-2222-4222-8222-222222222222', ...body }; state.guests.push(g); return reply(201, [g]);
    }
    if (u.pathname === '/rest/v1/invitations' && init.method === 'POST') return reply(201);
    if (u.pathname === '/rest/v1/guests') return reply(200, []);
    if (u.pathname === '/rest/v1/rsvp_responses') return reply(200, []);
    return reply(404, { message: 'unexpected ' + u.pathname });
  };
  return { calls, state };
}

const post = (body, headers = {}) => ({ httpMethod: 'POST', headers: { host: 'site.netlify.app', ...headers }, body: JSON.stringify(body) });
const valid = (extra = {}) => ({ name: 'Priya', weddingAttendance: 'attending', weddingGuestCount: 2, receptionAttendance: 'declined', receptionGuestCount: 0, wishes: 'Congratulations!', submissionId: SUB, ...extra });

test.beforeEach(() => Object.assign(process.env, ENV));
test.afterEach(() => { Object.keys(ENV).forEach((k) => delete process.env[k]); delete global.fetch; });

test('RSVP is saved through submit_rsvp with independent event answers and the invitation id', async () => {
  const { calls } = mockSupabase();
  const res = await fresh('rsvp').handler(post(valid({ invite: TOKEN })));
  const data = JSON.parse(res.body);
  assert.equal(res.statusCode, 200); assert.equal(data.ok, true); assert.equal(data.weddingTotalConfirmed, 3);
  const rpcCall = calls.find((c) => c.path === '/rest/v1/rpc/submit_rsvp');
  assert.equal(rpcCall.body.p_invitation_id, '11111111-1111-4111-8111-111111111111');
  assert.deepEqual([rpcCall.body.p_wedding_attending, rpcCall.body.p_wedding_count, rpcCall.body.p_reception_attending, rpcCall.body.p_reception_count], [true, 2, false, 0]);
  assert.equal(rpcCall.headers.apikey, ENV.SUPABASE_SERVICE_ROLE_KEY);
});

test('reception-only and general-link RSVPs are accepted; invalid counts and invalid links are rejected without leaking details', async () => {
  const { calls } = mockSupabase();
  const rsvp = fresh('rsvp');
  let res = await rsvp.handler(post(valid({ weddingAttendance: 'declined', weddingGuestCount: 0, receptionAttendance: 'attending', receptionGuestCount: 4 })));
  assert.equal(res.statusCode, 200);
  assert.equal(calls.find((c) => c.path === '/rest/v1/rpc/submit_rsvp').body.p_invitation_id, null);
  res = await rsvp.handler(post(valid({ weddingGuestCount: 11 })));
  assert.equal(res.statusCode, 400); assert.match(JSON.parse(res.body).message, /between 1 and 10/);
  res = await rsvp.handler(post(valid({ invite: 'Z'.repeat(32) })));
  assert.equal(res.statusCode, 400); assert.match(JSON.parse(res.body).message, /invitation link/);
  res = await rsvp.handler(post(valid({ photoPath: 'rsvp/other-submission/abc.jpg' })));
  assert.equal(res.statusCode, 400);
  res = await rsvp.handler(post(valid({ name: '   ' })));
  assert.equal(res.statusCode, 400);
});

test('database failures return a friendly message only', async () => {
  global.fetch = async () => ({ ok: false, status: 500, text: async () => JSON.stringify({ message: 'relation "rsvp_responses" does not exist' }) });
  const res = await fresh('rsvp').handler(post(valid()));
  assert.equal(res.statusCode, 502);
  assert.doesNotMatch(res.body, /relation|rsvp_responses|supabase/i);
});

test('photo upload URLs are only issued for allowed types and sizes, scoped to the submission', async () => {
  mockSupabase();
  const photo = fresh('rsvp-photo');
  let res = await photo.handler(post({ submissionId: SUB, contentType: 'image/webp', size: 1000 }));
  const data = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.match(data.path, new RegExp(`^rsvp/${SUB}/[0-9a-f]{32}\\.webp$`));
  assert.match(data.uploadUrl, /^https:\/\/abc\.supabase\.co\/storage\/v1\/object\/upload\/sign\//);
  assert.doesNotMatch(res.body, /sb_secret/);
  res = await photo.handler(post({ submissionId: SUB, contentType: 'image/gif', size: 1000 }));
  assert.equal(res.statusCode, 400);
  res = await photo.handler(post({ submissionId: SUB, contentType: 'image/jpeg', size: 6 * 1024 * 1024 }));
  assert.equal(res.statusCode, 400);
});

test('invite lookup returns only the name and language', async () => {
  mockSupabase();
  const invite = fresh('invite');
  let res = await invite.handler({ httpMethod: 'GET', headers: {}, queryStringParameters: { token: TOKEN } });
  assert.deepEqual(JSON.parse(res.body), { ok: true, name: 'Priya', language: 'ta' });
  res = await invite.handler({ httpMethod: 'GET', headers: {}, queryStringParameters: { token: 'not-a-token' } });
  assert.equal(res.statusCode, 404);
});

test('admin API requires the password and prevents duplicate guests', async () => {
  const { calls } = mockSupabase();
  const admin = fresh('admin-guests');
  let res = await admin.handler(post({ action: 'list' }));
  assert.equal(res.statusCode, 401);
  res = await admin.handler(post({ action: 'list' }, { 'x-admin-key': 'wrong password!!' }));
  assert.equal(res.statusCode, 401);
  assert.equal(calls.length, 0, 'no database call before authentication');
  const auth = { 'x-admin-key': ENV.ADMIN_PASSWORD };
  res = await admin.handler(post({ action: 'create', name: 'Priya  & Family', language: 'ml' }, auth));
  assert.equal(res.statusCode, 201);
  const token = calls.find((c) => c.path === '/rest/v1/invitations' && c.method === 'POST').body.token;
  assert.match(token, /^[A-Za-z0-9_-]{32}$/);
  res = await admin.handler(post({ action: 'create', name: 'priya & family' }, auth));
  assert.equal(res.statusCode, 409);
  res = await admin.handler(post({ action: 'list' }, auth));
  assert.equal(res.statusCode, 200);
});

test('without Supabase settings the admin API reports that the database is not connected', async () => {
  delete process.env.SUPABASE_URL;
  const res = await fresh('admin-guests').handler(post({ action: 'list' }, { 'x-admin-key': ENV.ADMIN_PASSWORD }));
  assert.equal(res.statusCode, 503);
});
