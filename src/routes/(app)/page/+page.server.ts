import { redirect } from '@sveltejs/kit';
// The contact page form now lives in Settings.
export const load = () => redirect(308, '/settings');
