import { ApiError, formFailure } from '$lib/server/api';
import { safeRedirect, setSession, takeExpired } from '$lib/server/session';
import type { User } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url, cookies }) => {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	return { expired: takeExpired(cookies) };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {
		const form = await request.formData();
		const values = { email: String(form.get('email') ?? '') };
		let session: { token: string; expiresAt: string; user: User };
		try {
			session = await locals.api.post('/auth/login', { ...values, password: String(form.get('password') ?? '') });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, formFailure(e, values));
			throw e;
		}
		setSession(cookies, session.token, session.expiresAt);
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};
