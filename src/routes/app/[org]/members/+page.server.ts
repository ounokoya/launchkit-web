import { ApiError, formFailure } from '$lib/server/api';
import { rethrow } from '$lib/server/errors';
import type { Invitation, Member } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	try {
		const list = await locals.api.get<{ members: Member[]; invitations: Invitation[] }>(
			`/orgs/${encodeURIComponent(params.org)}/members`
		);
		return { titleKey: 'common.nav.members', ...list };
	} catch (e) {
		rethrow(e, url);
	}
};

async function run(call: () => Promise<unknown>, values: Record<string, string> = {}) {
	try {
		await call();
	} catch (e) {
		if (e instanceof ApiError) return fail(e.status, formFailure(e, values));
		throw e;
	}
	return null;
}

export const actions: Actions = {
	invite: async ({ request, params, locals }) => {
		const form = await request.formData();
		const values = { email: String(form.get('email') ?? ''), role: String(form.get('role') ?? 'member') };
		const failed = await run(() => locals.api.post(`/orgs/${params.org}/invitations`, values), values);
		return failed ?? { invited: values.email };
	},
	role: async ({ request, params, locals }) => {
		const form = await request.formData();
		const user = String(form.get('user'));
		return (await run(() => locals.api.patch(`/orgs/${params.org}/members/${user}`, { role: form.get('role') }))) ?? { done: true };
	},
	remove: async ({ request, params, locals }) => {
		const user = String((await request.formData()).get('user'));
		return (await run(() => locals.api.delete(`/orgs/${params.org}/members/${user}`))) ?? { done: true };
	},
	resend: async ({ request, params, locals }) => {
		const id = String((await request.formData()).get('invitation'));
		return (await run(() => locals.api.post(`/orgs/${params.org}/invitations/${id}/resend`))) ?? { done: true };
	},
	cancel: async ({ request, params, locals }) => {
		const id = String((await request.formData()).get('invitation'));
		return (await run(() => locals.api.delete(`/orgs/${params.org}/invitations/${id}`))) ?? { done: true };
	}
};
