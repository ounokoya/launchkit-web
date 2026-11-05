import { rethrow } from '$lib/server/errors';
import type { PageServerLoad } from './$types';

type Stats = { organizations: number; users: number; pro: number; pendingJobs: number };
type OrgRow = { id: string; name: string; plan: 'free' | 'pro'; owner: { email: string | null }; members: number; projects: number; createdAt: string };

export const load: PageServerLoad = async ({ locals, url }) => {
	try {
		const [stats, organizations] = await Promise.all([
			locals.api.get<Stats>('/admin/stats'),
			locals.api.get<OrgRow[]>('/admin/organizations')
		]);
		return { titleKey: 'admin.area', stats, organizations };
	} catch (e) {
		rethrow(e, url);
	}
};
