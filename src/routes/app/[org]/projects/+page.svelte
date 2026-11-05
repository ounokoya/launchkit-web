<script lang="ts">
	// W10 · Projets, W10b · liste vide
	import Folder from '@lucide/svelte/icons/folder';
	import Lock from '@lucide/svelte/icons/lock';
	import Plus from '@lucide/svelte/icons/plus';
	import Alert from '$lib/components/Alert.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { relativeTime, statusTone } from '$lib/format';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data } = $props();
	const org = $derived(data.org);
	const base = $derived(`/app/${org.id}`);
	const atLimit = $derived(org.limits.projects !== null && org.usage.projects >= org.limits.projects);
</script>

<svelte:head><title>{t('projects.title')} · {org.name}</title></svelte:head>

<div class="head">
	<div>
		<h1 class="title">{t('projects.title')}</h1>
		<p class="muted intro">{t('projects.intro')}</p>
	</div>
	{#if !atLimit}<Button href="{base}/projects/new"><Plus size={18} aria-hidden="true" />{t('projects.new')}</Button>{/if}
</div>

{#if atLimit}
	<Alert tone="warning">
		{t('projects.limit_alert', { used: org.usage.projects, max: org.limits.projects ?? 0 })}
		{#snippet action()}
			{#if data.isAdmin}<Button href="{base}/billing" size="sm">{t('upgrade.button')}</Button>{/if}
		{/snippet}
	</Alert>
{/if}

{#if data.total === 0}
	<EmptyState illustration="projets-vide" title={t('projects.empty.title')}
		text={t('projects.empty.text', { max: org.limits.projects ?? 3 })}>
		<Button href="{base}/projects/new">{t('projects.empty.create')}</Button>
	</EmptyState>
{:else}
	<ul class="grid">
		{#each data.projects as p (p.id)}
			<li>
				<a class="card" href="{base}/projects/{p.id}">
					<span class="top">
						<span class="icon"><Folder size={22} aria-hidden="true" /></span>
						<Badge tone={statusTone[p.status]}>{t(`common.status.${p.status}`)}</Badge>
					</span>
					<strong>{p.name}</strong>
					<span class="desc">{p.description}</span>
					<span class="meta">
						<small>{t('common.meta.edited', { when: relativeTime(p.updatedAt, currentLocale()) })}</small>
						{#if p.leadId && p.leadName}<Avatar name={p.leadName} id={p.leadId} size={26} />{/if}
					</span>
				</a>
			</li>
		{/each}
	</ul>
	{#if atLimit}
		<div class="locked">
			<Lock size={22} aria-hidden="true" />
			<strong>{t('projects.locked_title')}</strong>
			<p class="muted">{t('projects.locked_desc')}</p>
		</div>
	{/if}
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 28px;
	}
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
	}
	.intro {
		margin-top: 6px;
		font-size: var(--text-small);
	}
	.grid {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		height: 100%;
		padding: 20px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		color: var(--color-text);
	}
	.card:hover {
		text-decoration: none;
		border-color: var(--color-primary-300);
	}
	.top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
	}
	.icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-control);
		background: var(--color-primary-50);
		color: var(--color-primary-500);
	}
	strong {
		font-size: 1.0625rem;
		font-weight: 700;
	}
	.desc {
		flex: 1;
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid var(--color-border);
	}
	small {
		font-size: var(--text-tiny);
		font-weight: 500;
		color: var(--color-text-muted);
	}
	.locked {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		margin-top: 24px;
		padding: 36px 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		background: var(--color-surface);
		text-align: center;
		color: var(--color-text-secondary);
	}
	.locked strong {
		color: var(--color-text);
		font-size: 1rem;
		font-weight: 600;
	}
	.locked p {
		font-size: var(--text-caption);
	}
	@media (max-width: 1279px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 767px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.head {
			flex-direction: column;
		}
	}
</style>
