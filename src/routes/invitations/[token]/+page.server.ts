import { ApiError } from '$lib/server/api';
import { rememberNext } from '$lib/server/session';
import type { Role } from '$lib/types';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type Invitation = { org: { id: string; name: string }; inviter: string; role: Role; email: string; expiresAt: string };

// W08 · Accepter une invitation. Without a session: sign in (or sign up) first, then come back here.
export const load: PageServerLoad = async ({ params, locals, url, cookies }) => {
	if (!locals.user) {
		rememberNext(cookies, url.pathname);
		redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}
	try {
		const invitation = await locals.api.get<Invitation>(`/invitations/${encodeURIComponent(params.token)}`);
		return { invitation, unavailable: null };
	} catch (e) {
		if (e instanceof ApiError && e.status === 410) return { invitation: null, unavailable: e.detail };
		if (e instanceof ApiError) error(e.status, { message: e.detail, code: e.code });
		throw e;
	}
};

export const actions: Actions = {
	accept: async ({ params, locals }) => {
		let joined: { org: { id: string } };
		try {
			joined = await locals.api.post(`/invitations/${encodeURIComponent(params.token)}/accept`);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { message: e.detail });
			throw e;
		}
		redirect(303, `/app/${joined.org.id}`);
	},
	decline: async ({ params, locals }) => {
		try {
			await locals.api.post(`/invitations/${encodeURIComponent(params.token)}/decline`);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { message: e.detail });
			throw e;
		}
		redirect(303, '/app');
	}
};
