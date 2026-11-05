<script lang="ts" module>
	import type { Component } from 'svelte';

	export type NavItem = { href: string; label: string; icon: Component; exact?: boolean };
</script>

<script lang="ts">
	// Application frame (W06–W12): sidebar (logo, organization, navigation, user) and top bar.
	// Under 768 px the sidebar folds into a menu (spec web.md).
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Menu from '@lucide/svelte/icons/menu';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import { t } from '$lib/i18n/t';
	import type { MyOrganization, User } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Badge from './Badge.svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';
	import Logo from './Logo.svelte';

	type Props = {
		user: User;
		title: string;
		nav: NavItem[];
		organizations?: MyOrganization[];
		current?: MyOrganization;
		searchAction?: string;
		superAdmin?: boolean;
		children: Snippet;
	};
	let { user, title, nav, organizations = [], current, searchAction, superAdmin = false, children }: Props = $props();

	const path = $derived(page.url.pathname);
	const isActive = (item: NavItem) => (item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/'));
</script>

<div class="shell">
	<aside class="sidebar">
		<details class="mobile-menu">
			<summary aria-label={t('common.a11y.open_menu')}><Menu size={22} aria-hidden="true" /></summary>
		</details>
		<a href="/app" class="logo" aria-label="LaunchKit"><Logo /></a>

		<div class="panel">
			{#if superAdmin}
				<div class="org static">
					<Avatar name="SA" id="super-admin" size={28} />
					<span><strong>{t('admin.area')}</strong><small>{t('admin.super_admin')}</small></span>
				</div>
			{:else if current}
				<details class="org">
					<summary>
						<Avatar name={current.name} id={current.id} size={28} />
						<span>
							<strong>{current.name}</strong>
							<small>{t('common.plan.label', { plan: t(`common.plan.${current.plan}`) })}</small>
							<span class="visually-hidden">{t('common.a11y.switch_org')}</span>
						</span>
						<ChevronDown size={18} aria-hidden="true" />
					</summary>
					<ul>
						{#each organizations as org (org.id)}
							<li><a href="/app/{org.id}" aria-current={org.id === current.id ? 'page' : undefined}>{org.name}</a></li>
						{/each}
						<li><a href="/onboarding"><Plus size={16} aria-hidden="true" />{t('mobile.orgs.create')}</a></li>
					</ul>
				</details>
			{/if}

			<nav aria-label="Navigation">
				{#each nav as item (item.href)}
					<a href={item.href} class:active={isActive(item)} aria-current={isActive(item) ? 'page' : undefined}>
						<item.icon size={22} aria-hidden="true" />{item.label}
					</a>
				{/each}
			</nav>

			<div class="me">
				<div class="me-row">
					<Avatar name={user.name} id={user.id} size={36} />
					<span class="who"><strong>{user.name}</strong><small>{user.email}</small></span>
				</div>
				<div class="me-row">
					<LanguageSwitch compact />
					<form method="POST" action="/logout">
						<button class="logout">
							<LogOut size={16} aria-hidden="true" />{t('common.action.sign_out')}
						</button>
					</form>
				</div>
			</div>
		</div>
	</aside>

	<div class="main">
		<header class="topbar">
			<p class="page-title">{title}</p>
			{#if superAdmin}<Badge tone="danger">{t('admin.super_admin')}</Badge>{/if}
			<span class="spacer"></span>
			{#if searchAction}
				<form class="search" method="GET" action={searchAction} role="search">
					<Search size={18} aria-hidden="true" />
					<input name="q" type="search" placeholder={t('common.search')} aria-label={t('common.search')} />
				</form>
			{/if}
			<Avatar name={user.name} id={user.id} size={36} />
		</header>
		<main class="content">{@render children()}</main>
	</div>
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: var(--sidebar-width) 1fr;
		min-height: 100vh;
	}
	.sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 22px 24px 30px;
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
	}
	.logo:hover {
		text-decoration: none;
	}
	.panel {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.mobile-menu {
		display: none;
	}
	.org {
		margin-top: 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-bg);
		position: relative;
	}
	.org summary,
	.org.static {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		list-style: none;
		cursor: pointer;
	}
	.org.static {
		cursor: default;
	}
	.org summary::-webkit-details-marker {
		display: none;
	}
	.org span {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.org strong {
		font-size: var(--text-small);
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.org small,
	.who small {
		font-size: var(--text-tiny);
		color: var(--color-text-secondary);
	}
	.org ul {
		position: absolute;
		z-index: 10;
		left: 0;
		right: 0;
		top: calc(100% + 4px);
		margin: 0;
		padding: 6px;
		list-style: none;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		box-shadow: var(--shadow-modal);
	}
	.org ul a {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: var(--text-small);
	}
	.org ul a:hover,
	.org ul a[aria-current='page'] {
		background: var(--color-primary-50);
		text-decoration: none;
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 20px;
	}
	nav a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 9px 12px;
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: var(--text-small);
		font-weight: 500;
	}
	nav a :global(svg) {
		color: var(--color-text-secondary);
	}
	nav a:hover {
		background: var(--color-subtle);
		text-decoration: none;
	}
	nav a.active {
		background: var(--color-primary-50);
		color: var(--color-primary-500);
		font-weight: 600;
	}
	nav a.active :global(svg) {
		color: var(--color-primary-500);
	}
	.me {
		margin-top: auto;
		padding-top: 18px;
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.me-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.who {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.who strong,
	.who small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.who strong {
		font-size: var(--text-small);
		font-weight: 600;
	}
	.logout {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px;
		border: none;
		background: none;
		color: var(--color-text-secondary);
		font-size: var(--text-caption);
		font-weight: 500;
		cursor: pointer;
	}
	.logout:hover {
		color: var(--color-text);
	}
	.main {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.topbar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 16px;
		height: 72px;
		padding: 0 28px 0 40px;
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
	}
	.page-title {
		font-size: 1.375rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.spacer {
		flex: 1;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 280px;
		height: 38px;
		padding: 0 12px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-surface);
		color: var(--color-text-secondary);
	}
	.search input {
		flex: 1;
		min-width: 0;
		border: none;
		background: none;
		font-size: var(--text-small);
		outline: none;
	}
	.content {
		padding: 32px 40px 48px;
		max-width: 1176px;
		width: 100%;
	}
	@media (max-width: 1023px) {
		.search {
			width: 180px;
		}
		.topbar {
			padding: 0 24px;
		}
		.topbar > :global(.avatar) {
			display: none;
		}
		.content {
			padding: 28px 24px 40px;
		}
	}
	@media (max-width: 767px) {
		.shell {
			grid-template-columns: 1fr;
		}
		.sidebar {
			position: sticky;
			z-index: 20;
			height: auto;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			gap: 12px;
			padding: 12px 16px;
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}
		.mobile-menu {
			display: block;
			order: 2;
			margin-left: auto;
		}
		.mobile-menu summary {
			list-style: none;
			cursor: pointer;
			padding: 6px;
		}
		.mobile-menu summary::-webkit-details-marker {
			display: none;
		}
		.panel {
			display: none;
			order: 3;
			flex-basis: 100%;
		}
		.sidebar:has(.mobile-menu[open]) .panel {
			display: flex;
		}
		.org {
			margin-top: 8px;
		}
		.me {
			margin-top: 16px;
		}
		.topbar {
			position: static;
			height: auto;
			padding: 16px;
			flex-wrap: wrap;
		}
		.topbar > :global(.avatar) {
			display: none;
		}
		.search {
			order: 3;
			width: 100%;
		}
		.content {
			padding: 20px 16px 40px;
		}
	}
</style>
