<script lang="ts">
	import { formatOwner, formatPrice, formatWeight, stockTotal } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>
		{data.activeCategory ? `${data.activeCategory.name} · Atlas` : 'Products · Atlas'}
	</title>
</svelte:head>

<section aria-labelledby="catalog-heading">
	<div class="mb-5 flex items-baseline justify-between gap-4">
		<h1
			id="catalog-heading"
			class="m-0 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]"
		>
			{data.activeCategory ? data.activeCategory.name : 'All products'}
		</h1>
		<p class="m-0 font-mono text-[0.8rem] text-muted">
			{data.products.length}
			{data.products.length === 1 ? 'item' : 'items'}
		</p>
	</div>

	{#if data.products.length === 0}
		<p class="py-10 text-muted">No products in this category yet.</p>
	{:else}
		<ul class="m-0 flex list-none flex-col gap-2 p-0">
			{#each data.products as product, i (product.id)}
				{@const stock = stockTotal(product.inventory)}
				{@const owner = formatOwner(product.EMPLOYEE)}
				<li
					class="animate-row-in [animation-delay:calc(var(--i)*28ms)]"
					style="--i: {i}"
				>
					<a
						class="grid grid-cols-[4px_1fr] items-start gap-x-4 gap-y-3.5 rounded-sm border border-transparent bg-chalk/55 py-4 pr-3.5 pl-3 transition-all duration-200 hover:translate-x-[3px] hover:border-mist-pine hover:bg-chalk wide:grid-cols-[4px_minmax(0,1.6fr)_minmax(0,0.9fr)_auto_auto] wide:items-center wide:py-[1.1rem] wide:pr-[1.1rem] wide:pl-3.5"
						href="/products/{product.id}"
					>
						<span
							class="row-span-3 w-1 self-stretch rounded-[2px] bg-linear-to-b from-signal to-pine opacity-85 wide:row-span-1"
							aria-hidden="true"
						></span>
						<span class="flex min-w-0 flex-col gap-1">
							<span class="text-[1.05rem] font-semibold tracking-[-0.01em]">{product.name}</span>
							<span class="line-clamp-2 text-[0.9rem] leading-[1.4] text-muted">
								{product.description}
							</span>
						</span>
						<span
							class="flex flex-wrap gap-x-4 gap-y-2 text-[0.8rem] text-muted wide:flex-col wide:gap-0.5"
						>
							<span class="font-mono text-xs">{product.sku}</span>
							<span>{product.categories?.name ?? 'Uncategorized'}</span>
							<span>{owner ?? 'No owner'}</span>
						</span>
						<span
							class="flex flex-wrap gap-x-4 gap-y-2 text-[0.8rem] text-muted wide:min-w-64 wide:items-baseline wide:justify-end wide:gap-5"
						>
							<span>{formatWeight(product.weight_kg)}</span>
							<span class={stock > 0 && stock <= 30 ? 'text-danger' : ''}>{stock} in stock</span>
							<span class="text-base font-bold tabular-nums text-ink">{formatPrice(product.price)}</span>
						</span>
						<span class="hidden self-center text-[1.1rem] text-pine wide:block" aria-hidden="true">→</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
