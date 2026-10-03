import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

export function requireViewer() {
  const viewer = getRequestEvent().locals.viewer;
  if (!viewer) error(401, 'Sign in to open your address book.');
  return viewer;
}
