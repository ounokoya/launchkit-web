<script lang="ts">
	// Message of a refused form (problem+json « detail »), when it is not about a single field.
	let { form }: { form?: { message?: string; errors?: Record<string, string[]> } | null } = $props();
	const show = $derived(!!form?.message && Object.keys(form.errors ?? {}).length === 0);
</script>

{#if show}
	<p class="form-error" role="alert">{form?.message}</p>
{/if}

<style>
	.form-error {
		padding: 12px 14px;
		border: 1px solid var(--color-danger-500);
		border-radius: var(--radius-control);
		background: var(--color-danger-50);
		color: var(--color-danger-700);
		font-size: var(--text-small);
		font-weight: 500;
	}
</style>
