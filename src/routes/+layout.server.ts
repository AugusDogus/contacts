import { googleConfigured } from '#lib/server/auth.ts';
import { BETTER_AUTH_URL } from '$app/env/private';
export const load = () => ({ googleConfigured, appUrl: BETTER_AUTH_URL });
