<script lang="ts">
	// W12 · Back-office super-admin
	import Clock from '@lucide/svelte/icons/clock';
	import Layers from '@lucide/svelte/icons/layers';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Users from '@lucide/svelte/icons/users';
	import Avatar from '$lib/components/Avatar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import { shortDate } from '$lib/format';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data } = $props();
</script>

<svelte:head><title>{t('admin.area')} · LaunchKit</title></svelte:head>

<h1 class="title">{t('admin.nav_orgs')}</h1>
<p class="muted intro">{t('admin.orgs_intro')}</p>

<div class="stats">
	<StatCard icon={Layers} label={t('admin.stat_orgs')} value={data.stats.organizations} />
	<StatCard icon={Users} label={t('admin.stat_users')} value={data.stats.users} />
	<StatCard icon={Sparkles} label={t('admin.stat_pro')} value={data.stats.pro} sub={t('admin.stat_pro_sub')} />
	<StatCard icon={Clock} label={t('admin.stat_jobs')} value={data.stats.pendingJobs} sub={t('admin.stat_jobs_sub')} />
</div>

<!-- A table wider than a phone scrolls sideways: the keyboard must be able to reach it (WCAG 2.1.1). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-wrap" role="region" aria-label={t('admin.nav_orgs')} tabindex="0">
	<table>
		<thead>
			<tr>
				<th>{t('admin.col_org')}</th><th>{t('admin.col_plan')}</th><th>{t('admin.col_members')}</th>
				<th>{t('admin.col_projects')}</th><th>{t('admin.col_created')}</th>
			</tr>
		</thead>
		<tbody>
			{#each data.organizations as o (o.id)}
				<tr>
					<td><span class="org"><Avatar name={o.name} id={o.id} /><span><strong>{o.name}</strong><small>{o.owner.email}</small></span></span></td>
					<td><Badge tone={o.plan === 'pro' ? 'success' : 'neutral'}>{t(`common.plan.${o.plan}`)}</Badge></td>
					<td>{o.members}</td>
					<td>{o.projects}</td>
					<td>{shortDate(o.createdAt, currentLocale())}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
	}
	.intro {
		margin-top: 6px;
		font-size: var(--text-small);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-top: 28px;
	}
	.table-wrap {
		margin-top: 28px;
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}
	th {
		height: 46px;
		padding: 0 24px;
		background: var(--color-surface);
		text-align: left;
		font-size: var(--text-tiny);
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}
	td {
		padding: 14px 24px;
		border-top: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}
	.org {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.org > span {
		display: flex;
		flex-direction: column;
	}
	.org strong {
		color: var(--color-text);
		font-weight: 600;
	}
	small {
		font-size: var(--text-tiny);
	}
	@media (max-width: 1279px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 767px) {
		.stats {
			gap: 12px;
		}
	}
</style>
