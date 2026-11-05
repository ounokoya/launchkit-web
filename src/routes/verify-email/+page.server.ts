import { env } from '$env/dynamic/public';
import { ApiError } from '$lib/server/api';
import { setSession, takeNext } from '$lib/server/session';
import type { User } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// W04: without a token, « check your inbox »; with ?token= (the link of the e-mail), verifies and signs in.
export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	const token = url.searchParams.get('token');
	if (token) {
		let session: { token: string; expiresAt: string; user: User };
		try {
			session = await locals.api.post('/auth/verify-email', { token });
		} catch (e) {
			if (e instanceof ApiError && e.status < 500) return { linkError: e.detail, email: null, inboxUrl: inbox() };
			throw e;
		}
		setSession(cookies, session.token, session.expiresAt);
		redirect(303, takeNext(cookies));
	}
	return { linkError: null, email: url.searchParams.get('email'), inboxUrl: inbox() };
};

function inbox() {
	return env.PUBLIC_MAILPIT_URL || 'http://localhost:8025';
}

export const actions: Actions = {
	resend: async ({ request, locals }) => {
		const email = String((await request.formData()).get('email') ?? '');
		try {
			await locals.api.post('/auth/verify-email/resend', { email });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { message: e.detail });
			throw e;
		}
		return { resent: email };
	}
};
