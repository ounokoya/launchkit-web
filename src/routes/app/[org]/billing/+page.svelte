<script lang="ts">
	// W09 · Abonnement, W09b · fenêtre « Bienvenue dans Pro » (P6: re-read every 2 s until the worker is done).
	import Check from '@lucide/svelte/icons/check';
	import Lock from '@lucide/svelte/icons/lock';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { price } from '$lib/format';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data, form } = $props();
	const billing = $derived(data.billing);
	const isPro = $derived(billing.plan === 'pro');
	const waiting = $derived(!isPro && (billing.pendingPayment || !!form?.started));
	let welcome = $state(false);
	let wasWaiting = false;
	let welcomed = false;

	$effect(() => {
		if (!waiting) return;
		wasWaiting = true;
		const timer = setInterval(() => {
			invalidate('app:billing');
			invalidate('app:org');
		}, 2000);
		return () => clearInterval(timer);
	});
	// « Bienvenue dans Pro » once the plan has switched, also when the worker was faster than the first re-read
	// (then the page never saw the payment pending, only the « started » answer of the checkout).
	$effect(() => {
		if (isPro && (wasWaiting || form?.started) && !welcomed) {
			welcomed = true;
			wasWaiting = false;
			welcome = true;
		}
	});

	const usage = $derived([
		{ key: 'projects', used: billing.usage.projects, max: billing.limits.projects },
		{ key: 'members', used: billing.usage.members, max: billing.limits.members }
	]);
	const limitReached = $derived(usage.some((u) => u.max !== null && u.used >= u.max));
	const free = ['free_projects', 'free_members', 'free_support'];
	const pro = ['pro_projects', 'pro_members', 'pro_support'];
</script>

<svelte:head>
	<title>{t('billing.title')} · {data.org.name}</title>
	<!-- Without JavaScript the page reloads itself until the worker has confirmed the payment. -->
	{#if waiting}<noscript><meta http-equiv="refresh" content="2" /></noscript>{/if}
</svelte:head>

<h1 class="title">{t('billing.title')}</h1>
<p class="muted intro">{t('billing.intro')}</p>

<section class="usage">
	<div class="current">
		<span class="muted label">{t('billing.current_plan')}</span>
		<span class="plan"><strong>{t(`common.plan.${billing.plan}`)}</strong>
			{#if limitReached && !isPro}<Badge tone="danger">{t('billing.limit_reached')}</Badge>{/if}</span>
	</div>
	{#each usage as u (u.key)}
		<div class="gauge">
			<div class="gauge-head">
				<strong>{t(`common.nav.${u.key}`)}</strong>
				<span class="muted">{u.max === null ? `${u.used} / ${t('billing.unlimited')}` : t('billing.usage', { used: u.used, max: u.max })}</span>
			</div>
			<div class="bar" role="meter" aria-valuemin={0} aria-valuemax={u.max ?? u.used} aria-valuenow={u.used}
				aria-label={t(`common.nav.${u.key}`)}>
				<span class:full={u.max !== null && u.used >= u.max} style:width="{u.max === null ? 100 : Math.min(100, (u.used / u.max) * 100)}%"></span>
			</div>
		</div>
	{/each}
</section>

{#if form?.message}<Alert tone="danger">{form.message}</Alert>{/if}
{#if waiting}<Alert tone="info">{t('billing.confirming')}</Alert>{/if}

<div class="plans">
	<section class="plan-card">
		<h2>Free</h2>
		<p class="price"><strong>{price(0, billing.prices.pro.currency, currentLocale())}</strong><span class="muted">{t('billing.per_month')}</span></p>
		<ul>{#each free as f (f)}<li><Check size={20} aria-hidden="true" />{t(`billing.${f}`, { n: 3 })}</li>{/each}</ul>
		{#if !isPro}<Button variant="secondary" full disabled>{t('billing.current_plan')}</Button>{/if}
	</section>
	<section class="plan-card pro">
		<div class="pro-head"><h2>Pro</h2>{#if !isPro}<Badge tone="primary">{t('billing.recommended')}</Badge>{/if}</div>
		<p class="price"><strong>{price(billing.prices.pro.amount, billing.prices.pro.currency, currentLocale())}</strong><span class="muted">{t('billing.per_month_simulated')}</span></p>
		<ul>{#each pro as f (f)}<li><Check size={20} aria-hidden="true" />{t(`billing.${f}`)}</li>{/each}</ul>
		{#if isPro}
			<Button variant="secondary" full disabled>{t('billing.current_plan')}</Button>
		{:else}
			<form method="POST" action="?/checkout" use:enhance>
				<Button type="submit" full disabled={waiting}>{t('upgrade.button')}</Button>
			</form>
		{/if}
	</section>
</div>

<p class="note"><Lock size={20} aria-hidden="true" />{t('billing.simulated_note')}</p>

<Modal open={welcome} label={t('billing.pro_activated.title')} onclose={() => (welcome = false)}>
	<div class="welcome">
		<Illustration name="pro" size={160} />
		<h2>{t('billing.pro_activated.title')}</h2>
		<p class="muted">{t('billing.pro_activated.text', { org: data.org.name })}</p>
		<form method="dialog"><Button type="submit" full>{t('common.action.continue')}</Button></form>
	</div>
</Modal>

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
	}
	.intro {
		margin: 6px 0 28px;
		font-size: var(--text-small);
	}
	.usage {
		display: grid;
		grid-template-columns: 336px 1fr 1fr;
		gap: 24px 60px;
		padding: 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
	}
	.label {
		font-size: var(--text-small);
		font-weight: 500;
	}
	.plan {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: 4px;
	}
	.plan strong {
		font-size: 1.625rem;
	}
	.gauge-head {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-small);
	}
	.bar {
		height: 8px;
		margin-top: 14px;
		border-radius: 4px;
		background: var(--color-subtle);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		border-radius: 4px;
		background: var(--color-primary-500);
	}
	.bar span.full {
		background: var(--color-danger-500);
	}
	.usage + :global(.alert),
	:global(.alert) + .plans {
		margin-top: 24px;
	}
	.plans {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		margin-top: 24px;
	}
	.plan-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 24px 28px 28px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
	}
	.plan-card.pro {
		border-color: var(--color-primary-500);
	}
	.pro-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.plan-card h2 {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.price {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}
	.price strong {
		font-size: 2.25rem;
	}
	.price span {
		font-size: var(--text-small);
	}
	ul {
		list-style: none;
		margin: 8px 0 24px;
		padding: 0;
		display: grid;
		gap: 12px;
		font-size: var(--text-small);
	}
	li {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	li :global(svg) {
		color: var(--color-success-500);
	}
	.plan-card :global(form),
	.plan-card :global(button) {
		margin-top: auto;
	}
	.note {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 24px;
		padding: 12px 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-size: var(--text-caption);
	}
	.welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	.welcome h2 {
		margin-top: 14px;
		font-size: 1.375rem;
		font-weight: 700;
	}
	.welcome p {
		font-size: var(--text-control);
		margin-bottom: 14px;
	}
	.welcome form {
		width: 100%;
	}
	@media (max-width: 1023px) {
		.usage {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 767px) {
		.plans {
			grid-template-columns: 1fr;
		}
	}
</style>
