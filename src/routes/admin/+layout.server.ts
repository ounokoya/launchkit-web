import { translate } from '$lib/i18n';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	if (!locals.user) redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	if (!locals.user.isSuperAdmin) error(403, { message: translate(locals.locale, 'error.forbidden.admin_only'), code: 'forbidden' });
	return { user: locals.user };
};
