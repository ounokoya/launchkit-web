<script lang="ts">
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Folder from '@lucide/svelte/icons/folder';
	import House from '@lucide/svelte/icons/house';
	import Settings from '@lucide/svelte/icons/settings';
	import Users from '@lucide/svelte/icons/users';
	import { page } from '$app/state';
	import AppShell, { type NavItem } from '$lib/components/AppShell.svelte';
	import { t } from '$lib/i18n/t';

	let { data, children } = $props();

	const base = $derived(`/app/${data.org.id}`);
	const nav = $derived<NavItem[]>([
		{ href: base, label: t('common.nav.dashboard'), icon: House, exact: true },
		{ href: `${base}/projects`, label: t('common.nav.projects'), icon: Folder },
		{ href: `${base}/members`, label: t('common.nav.members'), icon: Users },
		...(data.isAdmin ? [{ href: `${base}/billing`, label: t('common.nav.billing'), icon: CreditCard }] : []),
		{ href: `${base}/settings`, label: t('common.nav.settings'), icon: Settings }
	]);
	const current = $derived({ ...data.org, role: data.role, members: data.org.usage.members });
</script>

<AppShell
	user={data.user}
	title={t(page.data.titleKey ?? 'common.nav.dashboard')}
	{nav}
	organizations={data.organizations}
	{current}
	searchAction="{base}/projects"
>
	{@render children()}
</AppShell>
