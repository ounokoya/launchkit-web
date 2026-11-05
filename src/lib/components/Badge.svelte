<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tone = 'neutral', children }: { tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'; children: Snippet } =
		$props();
</script>

<span class="badge {tone}">{@render children()}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		border-radius: var(--radius-pill);
		font-size: var(--text-tiny);
		font-weight: 600;
		line-height: 1.25;
		white-space: nowrap;
	}
	.primary {
		background: var(--color-primary-50);
		color: var(--color-primary-500);
	}
	.success {
		background: var(--color-success-50);
		color: var(--color-success-700);
	}
	.warning {
		background: var(--color-warning-50);
		color: var(--color-warning-700);
	}
	.danger {
		background: var(--color-danger-50);
		color: var(--color-danger-700);
	}
	.neutral {
		background: var(--color-subtle);
		color: var(--color-text-secondary);
	}
</style>
