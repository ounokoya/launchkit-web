<script lang="ts">
	// W05 · Créer son organisation
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import CardPage from '$lib/components/CardPage.svelte';
	import Field from '$lib/components/Field.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
</script>

<svelte:head><title>{t('onboarding.org_title')} · LaunchKit</title></svelte:head>

<CardPage>
	{#if data.firstOrg}<span><Badge tone="primary">{t('onboarding.step', { current: 2, total: 2 })}</Badge></span>{/if}
	<h1>{t('onboarding.org_title')}</h1>
	<p class="lead">{t('onboarding.org_text')}</p>
	<form method="POST" use:enhance class="stack">
		<FormError {form} />
		<Field label={t('onboarding.org_name')} name="name" placeholder="Acme" required maxlength={60}
			value={form?.values?.name} error={form?.errors?.name} help={t('onboarding.org_name_help')} />
		<p class="plan">{t('onboarding.default_plan', { projects: 3, members: 3 })}</p>
		<Button type="submit" size="lg" full>{t('onboarding.submit')}</Button>
	</form>
</CardPage>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-top: 20px;
	}
	.plan {
		padding: 14px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-size: var(--text-caption);
		font-weight: 500;
	}
</style>
