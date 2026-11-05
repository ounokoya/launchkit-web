// FR | EN switch (P5): remembers the language in a cookie and, when signed in, in the account.
import { isLocale } from '$lib/i18n';
import { safeRedirect, setLocale } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const form = await request.formData();
	const locale = form.get('locale');
	if (isLocale(locale)) {
		setLocale(cookies, locale);
		if (locals.user) await locals.api.patch('/me', { locale });
	}
	redirect(303, safeRedirect(form.get('redirectTo')?.toString(), '/'));
};
