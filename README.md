# Public account-deletion page

This static page verifies account ownership with a Supabase email magic link and then invokes the same authenticated `delete-user-account` Edge Function used by the mobile app.

Before deployment:

1. Copy `config.example.js` to `config.js` and insert the public Supabase URL, public publishable key and real owner-controlled support email.
2. Add the final HTTPS page URL to Supabase Auth redirect URLs.
3. Set the Edge Function secret `ACCOUNT_DELETION_ALLOWED_ORIGIN` to the exact origin only, for example `https://account.example.com` without a trailing slash.
4. Replace temporary StudyTrack/developer wording after brand and legal review.
5. Deploy through the product owner's domain/hosting account.
6. Configure a restrictive Content Security Policy at the host; allow scripts from `esm.sh` and connections only to the selected Supabase project.
7. Test email verification, deletion, expired links, wrong confirmation, disallowed origins, active Google Play subscription messaging and mobile accessibility.
8. Put the exact deployed URL in Google Play Console's account-deletion field and privacy policy.

The publishable key is designed for public clients. Never put the service-role key, Sentry auth token or Google Play service-account credentials in `config.js`.
