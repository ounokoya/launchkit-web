<script lang="ts">
	// W06 · Tableau de bord
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Folder from '@lucide/svelte/icons/folder';
	import Mail from '@lucide/svelte/icons/mail';
	import Plus from '@lucide/svelte/icons/plus';
	import Users from '@lucide/svelte/icons/users';
	import Avatar from '$lib/components/Avatar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import { activityText, relativeTime, statusTone } from '$lib/format';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data } = $props();
	const org = $derived(data.org);
	const base = $derived(`/app/${org.id}`);
	const remaining = $derived(org.limits.projects === null ? null : Math.max(0, org.limits.projects - org.usage.projects));
	const firstName = $derived(data.user.name.split(' ')[0]);
</script>

<svelte:head><title>{t('common.nav.dashboard')} · {org.name}</title></svelte:head>

<h1 class="hello">{t('dashboard.greeting', { firstName })}</h1>
<p class="muted intro">{t('dashboard.intro', { org: org.name })}</p>

<div class="stats">
	<StatCard icon={CreditCard} label={t('dashboard.stat.plan')} value={t(`common.plan.${org.plan}`)} />
	<StatCard icon={Folder} label={t('dashboard.stat.projects')} value={org.usage.projects}
		sub={org.limits.projects === null ? undefined : t('dashboard.stat.projects_sub', { max: org.limits.projects })} />
	<StatCard icon={Users} label={t('dashboard.stat.members')} value={org.usage.members} sub={t('dashboard.stat.members_sub')} />
	<StatCard icon={Mail} label={t('dashboard.stat.invitations')} value={org.usage.pendingInvitations}
		sub={t('dashboard.stat.invitations_sub')} />
</div>

{#if org.plan === 'free' && data.isAdmin}
	<section class="banner">
		<div>
			<p class="banner-title">{t('upgrade.banner_title')}</p>
			<p class="muted small">{t('upgrade.banner_desc')}</p>
		</div>
		<Button href="{base}/billing">{t('upgrade.see_plans')}</Button>
	</section>
{/if}

<div class="columns">
	<section class="card">
		<div class="card-head">
			<h2>{t('dashboard.recent_projects')}</h2>
			<Button href="{base}/projects" variant="ghost" size="sm">{t('common.action.see_all')}</Button>
		</div>
		<ul class="rows">
			{#each data.recentProjects as project (project.id)}
				<li>
					<a class="row" href="{base}/projects/{project.id}">
						<span class="icon"><Folder size={20} aria-hidden="true" /></span>
						<span class="text">
							<strong>{project.name}</strong>
							<small>{t('common.meta.edited', { when: relativeTime(project.updatedAt, currentLocale()) })}</small>
						</span>
						<Badge tone={statusTone[project.status]}>{t(`common.status.${project.status}`)}</Badge>
					</a>
				</li>
			{/each}
			{#if remaining === null || remaining > 0}
				<li>
					<a class="slot" href="{base}/projects/new"><Plus size={18} aria-hidden="true" />
						{remaining === null ? t('projects.new') : t('dashboard.free_slot', { remaining })}</a>
				</li>
			{/if}
		</ul>
	</section>

	<section class="card">
		<div class="card-head"><h2>{t('dashboard.activity.title')}</h2></div>
		{#if data.activity.length === 0}
			<p class="muted small">{t('dashboard.activity.empty')}</p>
		{:else}
			<ul class="activity">
				{#each data.activity as a (a.id)}
					<li>
						<Avatar name={a.actor?.name ?? 'LaunchKit'} id={a.actor?.id ?? 'system'} />
						<span>
							<span class="what">{activityText(a, currentLocale(), org.name)}</span>
							<small>{relativeTime(a.createdAt, currentLocale())}</small>
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.hello {
		font-size: 1.625rem;
		font-weight: 700;
	}
	.intro {
		margin-top: 6px;
		font-size: var(--text-small);
	}
	.small {
		font-size: var(--text-small);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-top: 28px;
	}
	.banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-top: 24px;
		padding: 20px 24px;
		border-radius: var(--radius-card);
		background: var(--color-primary-50);
	}
	.banner-title {
		font-size: 1.0625rem;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.columns {
		display: grid;
		grid-template-columns: 640fr 432fr;
		gap: 24px;
		margin-top: 28px;
	}
	.card {
		padding: 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		background: var(--color-bg);
	}
	.card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 18px;
	}
	h2 {
		font-size: var(--text-h3);
		font-weight: 600;
	}
	.rows,
	.activity {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.row,
	.slot {
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 60px;
		padding: 10px 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text);
	}
	.row {
		background: var(--color-surface);
	}
	.row:hover,
	.slot:hover {
		text-decoration: none;
		border-color: var(--color-primary-300);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-control);
		background: var(--color-primary-50);
		color: var(--color-primary-500);
	}
	.text {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.text strong {
		font-size: var(--text-control);
		font-weight: 600;
	}
	small {
		font-size: var(--text-caption);
		color: var(--color-text-secondary);
	}
	.slot {
		justify-content: center;
		color: var(--color-primary-500);
		font-size: var(--text-small);
		font-weight: 600;
		border-style: dashed;
	}
	.activity li {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}
	.activity li > span {
		display: flex;
		flex-direction: column;
	}
	.what {
		font-size: var(--text-small);
		font-weight: 500;
	}
	@media (max-width: 1279px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		.columns {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 767px) {
		.stats {
			grid-template-columns: 1fr 1fr;
			gap: 12px;
		}
		.banner {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
