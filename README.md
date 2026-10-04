<div align="center">
  <img src="static/favicon.svg" alt="" width="64" height="64">
  <h1>Contacts Exchange</h1>
</div>

An address book your friends fill in. Send someone a private link, they add their own details, and you export everyone to Google Contacts or a vCard file.

Live at [contacts.exchange](https://contacts.exchange). Built with SvelteKit, Better Auth, Drizzle, and Turso.

## Develop

```sh
bun install
cp .env.example .env
bun run dev
```

Open `http://localhost:5173`. Signed out, `/` opens a demo with sample contacts.

Run `bun test`, `bun run check`, and `bun run lint` before pushing. `bun run db:push` applies `src/lib/server/schema.ts` to the configured database.

## Deploy

1. Set the variables from `.env.example` in Vercel.
2. Run `bun run db:push` with the production database variables.
3. Add `contacts.exchange` and `*.contacts.exchange` to the project, then push to `main`.

Google sign-in and export need an OAuth client with the People API enabled and the redirect URI `https://contacts.exchange/api/auth/callback/google`.
