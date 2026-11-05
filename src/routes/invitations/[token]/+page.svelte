<script lang="ts">
	// W08 · Accepter une invitation
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/Alert.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import CardPage from '$lib/components/CardPage.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
	const invitation = $derived(data.invitation);
	const wrongAccount = $derived(!!invitation && invitation.email !== data.user?.email);
</script>

<svelte:head><title>{t('invitation.accept')} · LaunchKit</title></svelte:head>

<CardPage>
	<Illustration name="invitation" />
	{#if !invitation}
		<h1>{t('error.invitation_unavailable')}</h1>
		<p class="lead">{data.unavailable}</p>
		<Button href="/app" size="lg" full>{t('common.action.back_dashboard')}</Button>
	{:else}
		<h1>{t('invitation.title', { org: invitation.org.name })}</h1>
		<p class="lead">{t('invitation.text', { inviter: invitation.inviter, org: invitation.org.name })}</p>
		<div class="role">
			<span>{t('invitation.proposed_role')}</span>
			<Badge tone={invitation.role === 'admin' ? 'primary' : 'neutral'}>{t(`common.role.${invitation.role}`)}</Badge>
		</div>
		<p class="account">{t('invitation.signed_in_as', { email: data.user?.email ?? '' })}</p>
		{#if form?.message}<Alert tone="danger">{form.message}</Alert>{/if}
		{#if wrongAccount}
			<Alert tone="danger">{t('invitation.wrong_account', { email: invitation.email })}</Alert>
			<form method="POST" action="/logout">
				<Button type="submit" variant="secondary" size="lg" full>{t('common.action.sign_out')}</Button>
			</form>
		{:else}
			<form method="POST" use:enhance class="buttons">
				<Button type="submit" formaction="?/accept" size="lg" full>{t('invitation.accept')}</Button>
				<Button type="submit" formaction="?/decline" variant="ghost" full>{t('invitation.decline')}</Button>
			</form>
		{/if}
	{/if}
</CardPage>

<style>
	.role {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 12px;
		padding: 12px 14px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	.account {
		font-size: var(--text-caption);
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	.buttons {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 8px;
	}
</style>
