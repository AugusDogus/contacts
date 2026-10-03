# Contacts Exchange

A private, invitation-only address book for `contacts.exchange`.

Built with Svelte 5.57, SvelteKit 3 remote functions, StyleX, Better Auth, Drizzle, and Turso. The Vercel adapter targets Node.js 24.

## Hosted app

- Production: [contacts.exchange](https://contacts.exchange)
- Private repository: [AugusDogus/contacts](https://github.com/AugusDogus/contacts)
- Vercel project: [augies-projects/contacts](https://vercel.com/augies-projects/contacts), connected to the repository's `main` branch.
- Database: `contacts-production`, on Turso's free Starter plan through the Vercel Marketplace, in `iad1`. Connected only to the production environment.
- Both `contacts.exchange` and `*.contacts.exchange` are verified. The registrar already uses `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
- Google Cloud project: [Contacts Exchange](https://console.cloud.google.com/auth/overview?project=curious-scarab-510520-v4), project ID `curious-scarab-510520-v4`. The external OAuth app is named `Contacts Exchange`, and its web client is `Contacts Exchange Web`. Its credentials are stored as sensitive production variables in Vercel. The People API is enabled and `augie@contacts.exchange` is an authorized test user. The app remains in Google's Testing publishing status, so additional Google users must be added as test users until public rollout.

Production migrations have been applied. Account creation, guest submission on a wildcard subdomain, single-use replay rejection, and vCard export were verified against the deployed app. Temporary test records were removed.

## Local development

```sh
bun install
cp .env.example .env
bun run dev
```

Open `http://localhost:5173`. Development uses a local libSQL database and automatically runs the checked-in Drizzle migrations. Visiting `/` without signing in opens an isolated demo workspace with sample contacts. Demo access is compiled out of production. Create an email/password account at `/login` to test an empty, real address book.

Use `bun run db:generate` after schema changes. `bun run db:migrate` applies migrations to the database configured in your environment. Database files and credentials are ignored by Git.

## What works

- Email/password accounts and optional Google OAuth through Better Auth.
- Unique contact page names, with path-based local URLs and wildcard production subdomains.
- Up to 20 invitations per batch, optional labels, 30-day expiry, revocation, and a reference number you can search for in your messages.
- Single-use contact submissions, with names, email, phone, postal address, birthday, pronouns, company, website, notes, and an optional photo.
- Search, favorites, recent contacts, birthdays, contact details, and deletion.
- Individual or complete vCard 3.0 exports, including photos, suitable for Google and Apple Contacts.
- Optional Google Contacts import, with completed imports tracked per Google account.
- Optional account linking after submission. A receipt in an HTTP-only cookie lets the submitter save their own card for future invitations.

Full invitation URLs are displayed once. New links use `contacts.exchange/i/<token>` with a 24-character token: an eight-character searchable reference plus a 96-bit random secret. Only token hashes are stored. Submission and invitation consumption execute as one atomic Turso batch. An invitation stays consumed even if its contact is deleted. Short links resolve the current page name and survive renames. Older subdomain links with 43-character tokens still work, but changing a page name breaks those older URLs.

Photos are resized to 512 pixels at most, re-encoded as JPEG, and stripped of metadata. They are stored with the private contact record, not in a public upload directory. The current address-book view loads all cards, which is intended for personal-sized books.

## Deploy to Vercel

1. Create a Turso database, then obtain its `libsql://` URL and an auth token. Use a separate database for preview deployments.
2. Add these environment variables in Vercel:

   | Variable                 | Production value                              |
   | ------------------------ | --------------------------------------------- |
   | `TURSO_DATABASE_URL`     | Your Turso `libsql://` database URL           |
   | `TURSO_AUTH_TOKEN`       | Your Turso token                              |
   | `BETTER_AUTH_URL`        | `https://contacts.exchange`                   |
   | `BETTER_AUTH_SECRET`     | A random secret of at least 32 characters     |
   | `PUBLIC_CONTACTS_DOMAIN` | `contacts.exchange`                           |
   | `GOOGLE_CLIENT_ID`       | Your Google OAuth client ID, when enabled     |
   | `GOOGLE_CLIENT_SECRET`   | Your Google OAuth client secret, when enabled |

3. Apply `bun run db:migrate` from a trusted environment with the production Turso variables. Migrations are deliberately separate from `build`, so preview builds cannot mutate your production database.
4. Import the repository into Vercel as a SvelteKit project, use `bun install --frozen-lockfile` and `bun run build`, and select Node.js 24. The adapter produces Vercel's Build Output API artifacts.
5. Add both `contacts.exchange` and `*.contacts.exchange` to the same Vercel project. For Vercel-managed wildcard TLS, move the domain to the Vercel nameservers shown in its domain setup. Preserve existing mail and other DNS records when switching nameservers.

The wildcard domain sends all subdomains to this app. Claiming `augie` is a database operation, not a Vercel API call. SvelteKit's reroute hook serves `augie.contacts.exchange` and its `/i/<token>` links using the matching profile. Reserved names and duplicate claims are rejected. The root page never accepts unauthenticated form submissions without an invitation.

Sign-in, account management, and Google callbacks use the canonical root domain. Auth cookies are host-only. Only the 24-hour contact-claim receipt spans `*.contacts.exchange` so a friend can finish a submission on your subdomain and create an account at the root.

## Google setup

In Google Cloud Console, enable the People API, configure the OAuth consent screen, and create a Web application OAuth client. Add these redirect URIs:

```text
http://localhost:5173/api/auth/callback/google
https://contacts.exchange/api/auth/callback/google
```

Basic Google login requests identity access. The Google Contacts screen separately requests `https://www.googleapis.com/auth/contacts` and offline access. Configure allowed test users while the OAuth app is in testing, and complete Google's publishing requirements before public use. Google may limit refresh-token lifetime while the OAuth app is in testing.

Imports run sequentially in small batches. Contacts Exchange creates new Google contacts, without reading or overwriting existing contacts. It skips its own completed imports. If a response is interrupted after Google may have accepted a write, that card is marked for manual checking rather than automatically retried. Photos that fail to transfer are reported. Existing contacts created outside Contacts Exchange are not deduplicated; Google Contacts can merge those afterward.

Google sign-in and the separate Google Contacts permission flow have both completed successfully against production. The app shows the account as connected. Google contact creation has not been live-tested because the account's address book is empty; no sample contacts were added to the user's Google account. Turso network access and wildcard DNS have been verified in production. Local tests use a libSQL database and mocked Google responses.

## Styles and checks

StyleX styles live in neighboring `*.stylex.ts` modules. Shared design tokens use `stylex.defineVars`; breakpoints use `stylex.defineConsts`; Svelte components compose variants with `stylex.attrs`. The only handwritten global CSS is a small reset. Fonts are self-hosted.

```sh
bun run check
bun run lint
bun test
bun run format:check
bun run build
```

Tests cover atomic single-use submissions, expiry and revocation, ownership isolation, subdomain collisions, one-time claims, safe vCard escaping and folding, photo normalization, and Google import retry behavior. Sample portraits are bundled from Random User's demonstration image collection and are used only for local demo data.
