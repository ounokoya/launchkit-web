<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Users from '@lucide/svelte/icons/users';
	import { page } from '$app/state';
	import AppShell, { type NavItem } from '$lib/components/AppShell.svelte';
	import { t } from '$lib/i18n/t';

	let { data, children } = $props();
	const nav = $derived<NavItem[]>([
		{ href: '/admin', label: t('admin.nav_overview'), icon: House, exact: true },
		{ href: '/admin/users', label: t('admin.nav_users'), icon: Users }
	]);
</script>

<AppShell user={data.user} title={t(page.data.titleKey ?? 'admin.area')} {nav} superAdmin>
	{@render children()}
</AppShell>
