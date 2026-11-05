import { ApiError } from '$lib/server/api';
import { rethrow } from '$lib/server/errors';
import type { Limits, Usage } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type Billing = {
	plan: 'free' | 'pro';
	usage: Usage;
	limits: Limits;
	prices: { pro: { amount: number; currency: string } };
	pendingPayment: boolean;
};

export const load: PageServerLoad = async ({ params, locals, url, depends }) => {
	depends('app:billing');
	try {
		const billing = await locals.api.get<Billing>(`/orgs/${encodeURIComponent(params.org)}/billing`);
		return { titleKey: 'common.nav.billing', billing };
	} catch (e) {
		rethrow(e, url);
	}
};

export const actions: Actions = {
	checkout: async ({ params, locals }) => {
		try {
			await locals.api.post(`/orgs/${params.org}/billing/checkout`, { plan: 'pro' });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { message: e.detail });
			throw e;
		}
		return { started: true };
	}
};
