<script lang="ts">
	// W04 · Vérifiez votre e-mail
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import CardPage from '$lib/components/CardPage.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
	const email = $derived(form?.resent ?? data.email ?? '');
</script>

<svelte:head><title>{t('auth.verify.title')} · LaunchKit</title></svelte:head>

<CardPage>
	<Illustration name="verifier-email" />
	<h1>{t('auth.verify.title')}</h1>
	{#if data.linkError && !form?.resent}
		<Alert tone="danger">{data.linkError}</Alert>
	{:else}
		<p class="lead">{t('auth.verify.text', { email: email || '…' })}</p>
	{/if}
	{#if form?.resent}<p class="ok" role="status">{t('auth.verify.resent', { email: form.resent })}</p>{/if}
	<p class="demo"><Inbox size={20} aria-hidden="true" />{t('auth.verify.demo_note')}</p>
	<Button href={data.inboxUrl} size="lg" full external>{t('auth.verify.open_inbox')}</Button>
	{#if email}
		<form method="POST" action="?/resend" use:enhance>
			<input type="hidden" name="email" value={email} />
			<Button type="submit" variant="ghost" full>{t('auth.verify.resend')}</Button>
		</form>
	{:else if data.linkError}
		<form method="POST" action="?/resend" use:enhance class="new-link">
			<Field label={t('auth.field.email')} name="email" type="email" icon={Mail} placeholder="marie@demo.test" required />
			<Button type="submit" variant="secondary" full>{t('auth.verify.resend')}</Button>
		</form>
	{/if}
</CardPage>

<style>
	.new-link {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}
	.demo {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 28px 0 10px;
		padding: 12px 14px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-size: var(--text-caption);
		font-weight: 500;
	}
	.ok {
		color: var(--color-success-700);
		font-size: var(--text-small);
		font-weight: 500;
	}
</style>
