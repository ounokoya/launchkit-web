import { rethrow } from '$lib/server/errors';
import type { Org, Role } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals, url, depends }) => {
	depends('app:org');
	try {
		const { org, role } = await locals.api.get<{ org: Org; role: Role }>(`/orgs/${encodeURIComponent(params.org)}`);
		return { org, role, isAdmin: role !== 'member' };
	} catch (e) {
		rethrow(e, url);
	}
};
