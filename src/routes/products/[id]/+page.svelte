<script lang="ts">
	import { formatOwner, formatPrice, formatWeight, stockTotal } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const stock = $derived(stockTotal(product.inventory));
	const inventoryRows = $derived(product.inventory?.data ?? []);
	const owner = $derived(formatOwner(product.EMPLOYEE));

	const headingClass =
		'mt-0 mb-3.5 font-display text-[0.95rem] font-bold tracking-[0.08em] text-pine uppercase';
	const termClass = 'mb-0.5 text-xs tracking-[0.04em] text-muted uppercase';
	const detailClass = 'm-0 text-[1.05rem] font-semibold';
</script>

<svelte:head>
	<title>{product.name} · Atlas</title>
	<meta name="description" content={product.description ?? product.name} />
</svelte:head>

<article class="grid max-w-2xl gap-9">
	<a
		class="w-fit text-[0.9rem] font-medium text-muted transition-colors duration-150 hover:text-pine"
		href={product.categories?.slug ? `/?category=${product.categories.slug}` : '/'}
	>
		← {product.categories?.name ?? 'All products'}
	</a>

	<header class="grid animate-rise gap-3">
		<p class="m-0 flex flex-wrap items-center gap-1.5 text-[0.85rem] text-muted">
			<span class="font-mono text-[0.8rem]">{product.sku}</span>
			{#if product.categories}
				<span class="opacity-50" aria-hidden="true">·</span>
				<a href="/?category={product.categories.slug}">{product.categories.name}</a>
			{/if}
		</p>
		<h1
			class="m-0 font-display text-[clamp(2.1rem,6vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.04em]"
		>
			{product.name}
		</h1>
		<p class="m-0 max-w-[36ch] text-[1.1rem] leading-[1.55] text-muted">{product.description}</p>
		<p class="mt-1.5 mb-0 text-[1.75rem] font-bold tabular-nums text-pine-deep">
			{formatPrice(product.price)}
		</p>
	</header>

	<section class="animate-rise [animation-delay:100ms]" aria-labelledby="specs-heading">
		<h2 id="specs-heading" class={headingClass}>Specs</h2>
		<dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-mist py-[1.15rem]">
			<div>
				<dt class={termClass}>Weight</dt>
				<dd class={detailClass}>{formatWeight(product.weight_kg)}</dd>
			</div>
			<div>
				<dt class={termClass}>SKU</dt>
				<dd class="{detailClass} font-mono text-[0.95rem] font-medium">{product.sku}</dd>
			</div>
			<div>
				<dt class={termClass}>In stock</dt>
				<dd class="{detailClass} {stock > 0 && stock <= 30 ? 'text-danger' : ''}">{stock} units</dd>
			</div>
			<div>
				<dt class={termClass}>Owner</dt>
				<dd class={detailClass}>
					{#if owner && product.EMPLOYEE}
						{owner}
						<span class="ml-1.5 font-mono text-[0.8rem] font-medium text-muted">
							#{product.EMPLOYEE.emp_no}
						</span>
					{:else}
						Unassigned
					{/if}
				</dd>
			</div>
			{#if product.created_at}
				<div>
					<dt class={termClass}>Listed</dt>
					<dd class={detailClass}>
						{new Date(product.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric'
						})}
					</dd>
				</div>
			{/if}
		</dl>
	</section>

	{#if inventoryRows.length > 0}
		<section class="animate-rise [animation-delay:100ms]" aria-labelledby="stock-heading">
			<h2 id="stock-heading" class={headingClass}>Warehouse stock</h2>
			<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
				{#each inventoryRows as row (row.id)}
					<li class="grid gap-0.5 border-b border-mist/70 py-3.5">
						<div class="font-semibold">
							{row.warehouse_locations?.name ?? 'Unknown warehouse'}
						</div>
						<div class="text-[0.85rem] text-muted">
							{[row.warehouse_locations?.region, row.warehouse_locations?.country]
								.filter(Boolean)
								.join(', ')}
						</div>
						<div class="mt-1 flex items-baseline gap-3">
							<span class="text-xl font-bold tabular-nums">{row.quantity_on_hand ?? 0}</span>
							<span class="text-[0.8rem] text-muted">reorder at {row.reorder_threshold ?? 0}</span>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>
