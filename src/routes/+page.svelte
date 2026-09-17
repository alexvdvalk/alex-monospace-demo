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

<section class="catalog" aria-labelledby="catalog-heading">
	<div class="catalog-head">
		<h1 id="catalog-heading">
			{data.activeCategory ? data.activeCategory.name : 'All products'}
		</h1>
		<p class="count">
			{data.products.length}
			{data.products.length === 1 ? 'item' : 'items'}
		</p>
	</div>

	{#if data.products.length === 0}
		<p class="empty">No products in this category yet.</p>
	{:else}
		<ul class="product-list">
			{#each data.products as product, i (product.id)}
				{@const stock = stockTotal(product.inventory)}
				{@const owner = formatOwner(product.EMPLOYEE)}
				<li style="--i: {i}">
					<a class="product-row" href="/products/{product.id}">
						<span class="row-accent" aria-hidden="true"></span>
						<span class="row-main">
							<span class="row-name">{product.name}</span>
							<span class="row-desc">{product.description}</span>
						</span>
						<span class="row-meta">
							<span class="sku">{product.sku}</span>
							<span class="category">{product.categories?.name ?? 'Uncategorized'}</span>
							<span class="owner">{owner ?? 'No owner'}</span>
						</span>
						<span class="row-stats">
							<span class="weight">{formatWeight(product.weight_kg)}</span>
							<span class="stock" class:low={stock > 0 && stock <= 30}>{stock} in stock</span>
							<span class="price">{formatPrice(product.price)}</span>
						</span>
						<span class="row-chevron" aria-hidden="true">→</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.catalog-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.count {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--muted);
	}

	.empty {
		padding: 2.5rem 0;
		color: var(--muted);
	}

	.product-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.product-list li {
		animation: row-in 0.4s ease-out both;
		animation-delay: calc(var(--i) * 28ms);
	}

	.product-row {
		display: grid;
		grid-template-columns: 4px 1fr;
		gap: 0.85rem 1rem;
		align-items: start;
		padding: 1rem 0.9rem 1rem 0.75rem;
		border-radius: 0.35rem;
		background: color-mix(in srgb, var(--chalk) 55%, transparent);
		border: 1px solid transparent;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.product-row:hover {
		background: var(--chalk);
		border-color: color-mix(in srgb, var(--pine) 25%, var(--mist));
		transform: translateX(3px);
	}

	.row-accent {
		grid-row: 1 / span 3;
		align-self: stretch;
		width: 4px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--signal), var(--pine));
		opacity: 0.85;
	}

	.row-main {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.row-name {
		font-weight: 600;
		font-size: 1.05rem;
		letter-spacing: -0.01em;
	}

	.row-desc {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.row-meta,
	.row-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.sku {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.price {
		font-weight: 700;
		font-size: 1rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.stock.low {
		color: var(--danger);
	}

	.row-chevron {
		display: none;
		color: var(--pine);
		font-size: 1.1rem;
		align-self: center;
	}

	@keyframes row-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (min-width: 900px) {
		.product-row {
			grid-template-columns: 4px minmax(0, 1.6fr) minmax(0, 0.9fr) auto auto;
			align-items: center;
			padding: 1.1rem 1.1rem 1.1rem 0.85rem;
		}

		.row-accent {
			grid-row: auto;
		}

		.row-meta {
			flex-direction: column;
			gap: 0.2rem;
		}

		.row-stats {
			justify-content: flex-end;
			align-items: baseline;
			gap: 1.25rem;
			min-width: 16rem;
		}

		.row-chevron {
			display: block;
		}
	}
</style>
