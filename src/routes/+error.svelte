<script lang="ts">
	// W13 (404), W14 (403) and every other error, on the public card.
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import CardPage from '$lib/components/CardPage.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import { t } from '$lib/i18n/t';

	const status = $derived(page.status);
	const kind = $derived(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'server');
</script>

<svelte:head><title>{t(`error.${kind}.title`)} · LaunchKit</title></svelte:head>

<CardPage>
	<Illustration name={status === 403 ? 'erreur-403' : 'erreur-404'} />
	<h1>{t(`error.${kind}.title`)}</h1>
	<p class="lead">
		{#if status === 404}{t('error.not_found.text')}{:else}{page.error?.message ?? t('error.server.text')}{/if}
	</p>
	<div class="actions">
		{#if page.data.user}
			<Button href="/app" size="lg" full>{t('common.action.back_dashboard')}</Button>
		{:else}
			<Button href="/" size="lg" full>{t('common.action.back_home')}</Button>
		{/if}
	</div>
</CardPage>

<style>
	.actions {
		margin-top: 20px;
	}
</style>
