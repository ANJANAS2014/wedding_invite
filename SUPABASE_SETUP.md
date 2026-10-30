# Supabase + Netlify setup (Guest Tracker, personal invitations, RSVPs, photos)

The website code is ready. Nothing below has been run against a real Supabase project. You create the project, paste the SQL, and add the Netlify settings.
**Until you do, the site keeps using the existing Google Sheets (Apps Script) RSVP flow, unchanged.** As soon as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Netlify, the RSVP and wishes functions switch to Supabase automatically.

---

## How it works (and why each part runs where it does)

| Browser (public) | Netlify Function (server, holds the secret key) | Supabase |
|---|---|---|
| Opens `/?i=<token>` | `invite` checks the token and returns **only** the guest's name and language | `invitations`, `guests` |
| Sends the RSVP form | `rsvp` validates everything again on the server, links the reply to the invitation and calls `submit_rsvp()` in a single transaction | `rsvp_responses`, `rsvp_event_responses`, `rsvp_photos` |
| Picks a photo | `rsvp-photo` checks the type and size and returns a **one-time signed upload URL** for one random file path | Storage bucket `guest-photos` (private) |
| Wishes wall | `wishes` returns only **approved** wishes: first name, wish text and a short-lived photo link | `rsvp_responses` |
| `links.html` Guest Tracker | `admin-guests` requires `ADMIN_PASSWORD` for every call: list guests, add a guest, mark as sent, approve a wish, remove a guest | all tables |

Why it is built this way:
- The browser **never** gets a database key. Every table has Row Level Security switched on, with no public policies. The public roles can't read or write anything, even if someone finds your project URL.
- The service-role (secret) key bypasses RLS. That's why it lives **only** in Netlify environment variables.
- Invitation links use a random 32-character token (192 bits) and never the guest's database id, so links can't be guessed.
- Each RSVP carries an idempotency id. A double-tap or retry never creates a second row. Submitting again from the same personal link **updates** that guest's answer.
- Guests who reply from the general link (no personal link) are stored as "Replies without a personal link" in the tracker.

---

## A + B. SQL files

- `supabase/01_schema.sql`: tables, keys, unique constraints, indexes, defaults, timestamps, the `submit_rsvp()` and `rsvp_totals()` functions, and the `guest_tracker` view.
- `supabase/02_security.sql`: RLS, revoked public grants, service-role grants, the private `guest-photos` bucket (5 MB limit, JPG/PNG/WebP only) and the storage policy clean-up.

Tables:

- `events` (wedding, reception): date, time, venue and map link, in IST.
- `guests`: name, language (`en` / `ta` / `ml`) and optional WhatsApp number. The normalised name is unique, which blocks duplicate entries.
- `invitations`: one per guest. Holds the unique random token, the `created` / `sent` status, `sent_at` and `last_opened_at`.
- `rsvp_responses`: one per invitation (a NULL invitation means a general-link reply). Holds the name, wishes, wish approval, revision count and a unique `client_submission_id`.
- `rsvp_event_responses`: one row per event, so the wedding and reception are recorded independently. The guest count must be 1–10 when attending and 0 when declining.
- `rsvp_photos`: the optional photo's storage path, type and size.

"RSVP received" is not stored. It is worked out from whether a response exists.

---

## C. Supabase setup (Free plan)

1. Go to https://supabase.com → **Start your project** → sign in → **New project**.
   - Name it, for example `lalith-anjana-wedding`. Choose a strong database password and save it in your password manager.
   - Region: **Mumbai (ap-south-1)** is closest to your guests. Plan: **Free**. Click **Create new project** and wait about 2 minutes.
2. In the left sidebar open **SQL Editor** → **New query**.
3. Open `supabase/01_schema.sql` from this project, copy **all** of it, paste it and press **Run**. You should see "Success. No rows returned".
4. Click **New query** again. Paste **all** of `supabase/02_security.sql` and press **Run**. The last result lists every table with `rls_enabled = true`.
5. Storage bucket: the security script already created it. Check under **Storage** that the bucket `guest-photos` exists and shows **Private**. Under its settings you should see a 5 MB file size limit and the allowed types `image/jpeg, image/png, image/webp`.
   - If the bucket is missing, click **New bucket**: name `guest-photos`, Public **off**, file size limit `5 MB`, allowed MIME types `image/jpeg,image/png,image/webp`.
6. Storage policies: **add none.** Under Storage → Policies, the `guest-photos` bucket should have no policies. Uploads and downloads only happen through short-lived signed URLs created by the Netlify Functions.
7. Find your keys: **Project Settings → API** (in newer dashboards, **Project Settings → API Keys**).
   - **Project URL**, like `https://abcdefghij.supabase.co`. This becomes `SUPABASE_URL`.
   - **service_role** key (legacy tab, starts with `eyJ…`) **or** a **Secret key** (starts with `sb_secret_…`). Either works. This becomes `SUPABASE_SERVICE_ROLE_KEY`. **Never** paste it into any website file.
   - The anon/publishable key is **not needed** by this site.

Free-plan limits to be aware of:
- 500 MB database. This is plenty; thousands of RSVPs use well under 1 MB.
- 1 GB file storage. At 5 MB per photo, that is about 200 photos at the maximum size. Typical phone photos of 2–3 MB fit roughly 350–500.
- About 5 GB of egress (download traffic) per month.
- Free projects **pause after about 7 days without activity**. A paused project makes RSVPs fail until you click **Restore** in the dashboard. Open the site or the tracker at least once a week, especially in the weeks before the wedding.
- There are no automatic backups on Free. Export the `guest_tracker` view to CSV from the Table Editor now and then.

---

## D. Netlify environment variables

In Netlify, open **Site configuration → Environment variables → Add a variable**. Set the scope to **Functions** (or all) and the deploy contexts to **Production** (and Deploy previews if you want).

| Variable | Required | Where to get it |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Project Settings → API → `service_role` key (or API Keys → Secret key). Keep it secret. |
| `ADMIN_PASSWORD` | Yes | Make one up: at least 12 characters, ideally a long passphrase. You type it into `links.html` to open the Guest Tracker. |
| `SUPABASE_PHOTO_BUCKET` | No | Only if you named the bucket something other than `guest-photos`. |
| `APPS_SCRIPT_URL`, `RSVP_SHARED_SECRET` | Existing | The current Google Sheets flow. Used only while the Supabase variables are **not** set. You can remove them once Supabase works. |

After adding or changing variables, go to **Deploys → Trigger deploy → Deploy site**. Functions only pick up new variables on a fresh deploy.

`.env.example` lists the same names with placeholders, for local `netlify dev` testing. Never commit a real `.env`.

---

## E. Activation and testing checklist

Do these on the live Netlify site after the redeploy.

1. **Tracker opens:** go to `https://YOUR-SITE.netlify.app/links.html` and enter the wrong password. You should see "Incorrect admin password." Then enter `ADMIN_PASSWORD` and the tracker opens with 0 guests.
2. **Create a guest:** add "Test Guest" in Tamil. It appears with status **Created**. Adding "test guest" again must be refused: "already on your guest list".
3. **Personal invitation:** click **Copy link** (status becomes **Sent**) and open the link in a private window.
   - The cover reads "அன்புள்ள Test Guest, …".
   - The button and the invitation note are in Tamil.
   - The RSVP name field is pre-filled, with "Replying to the invitation for Test Guest".
4. **Wedding-only RSVP:** choose Wedding "We'll be there!" with 2 guests and Reception "Sending love", then send. The thank-you panel shows both answers. In the tracker, open **RSVP** on Test Guest: Wedding is Attending · 2 guests, Reception is Not attending, and the status is **RSVP received**.
5. **Update instead of duplicate:** in the same private window click **Change my response**. Switch to Reception "We'll be there!" with 3 guests (keep the wedding answer), then send. The tracker shows the new answers and "updated 1×", and there is still only one response.
6. **Reception-only RSVP:** create a second guest, open their link, decline the wedding, accept the reception with 1 guest, and send. Both events are recorded independently.
7. **General link:** open `https://YOUR-SITE.netlify.app/` with no `?i=` and submit an RSVP. It appears under "Replies without a personal link".
8. **Double-submit:** on a slow connection (Chrome DevTools → Network → Slow 3G), tap Send several times. Only one response is stored.
9. **Photo:** submit an RSVP with a JPG under 5 MB. In Supabase → Storage → `guest-photos` → `rsvp/…` the file exists, and the tracker shows the photo. A 6 MB file or a GIF is refused in the browser and again on the server.
10. **Wishes wall:** tick "Show on the public wishes wall" for one response. Within about a minute it appears on the site. Unticked wishes never appear.
11. **Invalid link:** open `/?i=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`. The site works normally without a name, and an RSVP is stored as a general reply.
12. **Unauthorised access is blocked:**
    - Without a password, `curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/admin-guests -d '{"action":"list"}'` returns 401.
    - With the **anon** key from Supabase, `curl "https://YOUR-PROJECT.supabase.co/rest/v1/guests?select=*" -H "apikey: <anon key>"` returns an error or `[]`, never guest data.
    - `curl https://YOUR-SITE.netlify.app/.netlify/functions/invite?token=<a real token>` returns only `name` and `language`.
13. **Function logs:** Netlify → Logs → Functions. Check `rsvp`, `rsvp-photo`, `invite`, `wishes` and `admin-guests` for errors while you run the steps above.
14. **Clean up:** remove the test guests in the tracker, and delete test responses in Supabase → Table Editor → `rsvp_responses` (their event rows and photos are deleted with them).

Automated checks: run `node --test tests/*.test.js` from the project folder. These tests use a stand-in for Supabase and do not touch a real project.

---

## Safe migration from Google Sheets

- Existing Sheet responses are not moved automatically. Keep the Sheet as an archive.
  - To import old replies, use Supabase → Table Editor → `rsvp_responses` → Import CSV. Then add the matching `rsvp_event_responses` rows.
  - Or simply keep both sources until the wedding.
- To roll back, delete `SUPABASE_URL` in Netlify and redeploy. The Apps Script flow takes over again.
