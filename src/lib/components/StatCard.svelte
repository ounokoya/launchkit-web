<script lang="ts">
	import type { Component } from 'svelte';

	let { icon: Icon, label, value, sub }: { icon: Component; label: string; value: string | number; sub?: string } = $props();
</script>

<div class="stat">
	<div class="head">
		<span class="icon"><Icon size={20} aria-hidden="true" /></span>
		<span class="label">{label}</span>
	</div>
	<p><strong>{value}</strong>{#if sub}<span>{sub}</span>{/if}</p>
</div>

<style>
	.stat {
		padding: 20px;
		border: 1px solid var(--color-border);
		border-radius: 14px;
		background: var(--color-bg);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 12px;
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
	.label {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	p {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-top: 14px;
	}
	strong {
		font-size: 1.625rem;
		font-weight: 700;
	}
	span {
		font-size: var(--text-caption);
		color: var(--color-text-secondary);
	}
</style>
