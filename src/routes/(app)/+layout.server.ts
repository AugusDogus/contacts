import { redirect } from '@sveltejs/kit';
export const load = ({ locals, cookies }) => {
  if (!locals.viewer) redirect(303, '/login');
  return { viewer: locals.viewer, canClaim: Boolean(cookies.get('gather-claim')) };
};
