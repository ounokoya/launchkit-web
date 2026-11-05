import { ApiError, formFailure } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/app');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const values = { name: String(form.get('name') ?? ''), email: String(form.get('email') ?? '') };
		try {
			await locals.api.post('/auth/register', { ...values, password: String(form.get('password') ?? ''), locale: locals.locale });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, formFailure(e, values));
			throw e;
		}
		redirect(303, `/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`);
	}
};
