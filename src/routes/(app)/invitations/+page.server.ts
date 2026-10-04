import { redirect } from '@sveltejs/kit';
// Open links now live on the People page.
export const load = () => redirect(308, '/');
