import { redirect } from '@sveltejs/kit';
export const load = ({ locals, url }) => {
  if (locals.viewer?.kind === 'account')
    redirect(303, url.searchParams.has('claim') ? '/settings?claim=1' : '/');
  return { claim: url.searchParams.has('claim') };
};
