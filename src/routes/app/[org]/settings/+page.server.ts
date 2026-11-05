import { isLocale } from '$lib/i18n';
import { ApiError, formFailure } from '$lib/server/api';
import { setLocale } from '$lib/server/session';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ titleKey: 'common.nav.settings' });

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const form = await request.formData();
		const values = { name: String(form.get('name') ?? ''), locale: String(form.get('locale') ?? '') };
		try {
			await locals.api.patch('/me', values);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, formFailure(e, values));
			throw e;
		}
		if (isLocale(values.locale)) setLocale(cookies, values.locale);
		return { saved: true };
	}
};
