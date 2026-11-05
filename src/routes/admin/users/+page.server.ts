import { rethrow } from '$lib/server/errors';
import type { PageServerLoad } from './$types';

type UserRow = { id: string; name: string; email: string; emailVerified: boolean; organizations: number; createdAt: string };

export const load: PageServerLoad = async ({ locals, url }) => {
	try {
		return { titleKey: 'admin.nav_users', users: await locals.api.get<UserRow[]>('/admin/users') };
	} catch (e) {
		rethrow(e, url);
	}
};
