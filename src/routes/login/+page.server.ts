import { redirect } from '@sveltejs/kit';
export const load = ({ locals, url }) => {
  // A signed query means an app is asking for access; Better Auth resumes it after sign-in.
  const authorizing = url.searchParams.has('sig');
  if (locals.viewer?.kind === 'account' && !authorizing)
    redirect(303, url.searchParams.has('claim') ? '/settings?claim=1' : '/people');
  return {
    claim: url.searchParams.has('claim'),
    signIn: authorizing || url.searchParams.has('signin'),
    authorizing
  };
};
