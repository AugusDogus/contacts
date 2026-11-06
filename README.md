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

## MCP

`https://contacts.exchange/mcp` is a remote MCP server for listing contacts and invitation links and creating new links. Add that URL to an MCP client; it signs in and asks for consent through Better Auth's `mcp` plugin. Clients register with a [Client ID Metadata Document](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration#client-id-metadata-documents). Dynamic client registration is off.

Scopes: `contacts:read` is required for every tool. `create_invitations` also needs `invitations:write`, and `update_my_card` needs `card:write`. `update_my_card` takes a public `photoUrl`, which the server downloads through the CIMD plugin's SSRF-safe transport.

Apps stay connected while they refresh at least every 30 days. Users can disconnect them under Settings, which revokes access immediately. `patches/` adds Better Auth's `refreshTokenSupersededInterval`, which refuses a stale rotated refresh token without revoking the whole grant.

Registries such as [integrations.sh](https://integrations.sh/publishing/) find the server through `/.well-known/integrations.json`, `/.well-known/mcp/server-card.json`, and `/llms.txt`, built from `BETTER_AUTH_URL` in `src/lib/server/discovery.ts`.

Agents can send feedback with the `send_feedback` tool. It is stored in the `feedback` table; read it with `bun run db:studio`.
