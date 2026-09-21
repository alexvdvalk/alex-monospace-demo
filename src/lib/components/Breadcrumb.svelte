<script lang="ts">
	type Props = {
		items: { label: string | null | undefined; href?: string }[];
		class?: string;
	};

	let { items, class: className = '' }: Props = $props();
</script>

<nav class="text-xs text-muted {className}" aria-label="Breadcrumb">
	{#each items as item, i (i)}
		{#if i > 0}
			<span class="mx-1.5 opacity-50">/</span>
		{/if}
		{#if item.href}
			<a href={item.href} class="text-signal hover:underline">{item.label}</a>
		{:else}
			<span class="font-semibold text-ink">{item.label}</span>
		{/if}
	{/each}
</nav>
