import { ApiError } from '$lib/server/api';
import { rethrow } from '$lib/server/errors';
import type { Activity, Member, Project } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	try {
		const detail = await locals.api.get<{ project: Project; members: Member[]; history: Activity[] }>(
			`/orgs/${encodeURIComponent(params.org)}/projects/${encodeURIComponent(params.id)}`
		);
		return { titleKey: 'common.nav.projects', ...detail };
	} catch (e) {
		rethrow(e, url);
	}
};

export const actions: Actions = {
	// First submit asks for confirmation (works without JavaScript); the second one deletes.
	delete: async ({ request, params, locals }) => {
		if ((await request.formData()).get('confirmed') !== 'yes') return { confirmDelete: true };
		try {
			await locals.api.delete(`/orgs/${params.org}/projects/${params.id}`);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { message: e.detail });
			throw e;
		}
		redirect(303, `/app/${params.org}/projects`);
	}
};
