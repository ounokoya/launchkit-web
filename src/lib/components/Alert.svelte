<script lang="ts">
	import type { Snippet } from 'svelte';
	import Zap from '@lucide/svelte/icons/zap';

	type Props = { tone?: 'warning' | 'danger' | 'info'; children: Snippet; action?: Snippet };
	let { tone = 'warning', children, action }: Props = $props();
</script>

<div class="alert {tone}" role={tone === 'danger' ? 'alert' : 'status'}>
	<Zap size={20} aria-hidden="true" />
	<p>{@render children()}</p>
	{#if action}<div class="action">{@render action()}</div>{/if}
</div>

<style>
	.alert {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border: 1px solid;
		border-radius: var(--radius-lg);
		font-size: var(--text-small);
		font-weight: 500;
	}
	p {
		flex: 1;
	}
	.warning {
		background: var(--color-warning-50);
		border-color: var(--color-warning-300);
		color: var(--color-warning-800);
	}
	.danger {
		background: var(--color-danger-50);
		border-color: var(--color-danger-500);
		color: var(--color-danger-700);
	}
	.info {
		background: var(--color-surface);
		border-color: var(--color-border);
		color: var(--color-text-secondary);
	}
	@media (max-width: 600px) {
		.alert {
			flex-wrap: wrap;
		}
	}
</style>
