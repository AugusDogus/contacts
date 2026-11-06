import { redirect } from '@sveltejs/kit';

// Temporary until the landing page lands at `/`.
export const load = () => redirect(307, '/about');
