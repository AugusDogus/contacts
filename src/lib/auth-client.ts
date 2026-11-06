import { createAuthClient } from 'better-auth/svelte';
import { oauthProviderClient } from '@better-auth/oauth-provider/client';
// Forwards a signed MCP authorization request through sign-in and consent.
export const authClient = createAuthClient({ plugins: [oauthProviderClient()] });
