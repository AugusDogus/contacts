import * as env from '$app/env/public';
import type { Reroute } from '@sveltejs/kit/hooks';
import { contactRoute } from '#lib/contact-route.ts';

export const reroute: Reroute = ({ url }) => contactRoute(url, env.PUBLIC_CONTACTS_DOMAIN);
