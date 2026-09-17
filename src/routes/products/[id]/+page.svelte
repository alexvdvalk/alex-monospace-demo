<script lang="ts">
	import { formatOwner, formatPrice, formatWeight, stockTotal } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const stock = $derived(stockTotal(product.inventory));
	const inventoryRows = $derived(product.inventory?.data ?? []);
	const owner = $derived(formatOwner(product.EMPLOYEE));
</script>

<svelte:head>
	<title>{product.name} · Atlas</title>
	<meta name="description" content={product.description ?? product.name} />
</svelte:head>

<article class="detail">
	<a class="back" href={product.categories?.slug ? `/?category=${product.categories.slug}` : '/'}>
		← {product.categories?.name ?? 'All products'}
	</a>

	<header class="hero">
		<p class="eyebrow">
			<span class="sku">{product.sku}</span>
			{#if product.categories}
				<span class="dot" aria-hidden="true">·</span>
				<a href="/?category={product.categories.slug}">{product.categories.name}</a>
			{/if}
		</p>
		<h1>{product.name}</h1>
		<p class="lede">{product.description}</p>
		<p class="price">{formatPrice(product.price)}</p>
	</header>

	<section class="specs" aria-labelledby="specs-heading">
		<h2 id="specs-heading">Specs</h2>
		<dl>
			<div>
				<dt>Weight</dt>
				<dd>{formatWeight(product.weight_kg)}</dd>
			</div>
			<div>
				<dt>SKU</dt>
				<dd class="mono">{product.sku}</dd>
			</div>
			<div>
				<dt>In stock</dt>
				<dd class:low={stock > 0 && stock <= 30}>{stock} units</dd>
			</div>
			<div>
				<dt>Owner</dt>
				<dd>
					{#if owner && product.EMPLOYEE}
						{owner}
						<span class="owner-id">#{product.EMPLOYEE.emp_no}</span>
					{:else}
						Unassigned
					{/if}
				</dd>
			</div>
			{#if product.created_at}
				<div>
					<dt>Listed</dt>
					<dd>
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
		<section class="stock" aria-labelledby="stock-heading">
			<h2 id="stock-heading">Warehouse stock</h2>
			<ul>
				{#each inventoryRows as row (row.id)}
					<li>
						<div class="wh-name">
							{row.warehouse_locations?.name ?? 'Unknown warehouse'}
						</div>
						<div class="wh-meta">
							{#if row.warehouse_locations}
								{row.warehouse_locations.region}, {row.warehouse_locations.country}
							{/if}
						</div>
						<div class="wh-qty">
							<span class="qty">{row.quantity_on_hand ?? 0}</span>
							<span class="threshold">reorder at {row.reorder_threshold ?? 0}</span>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>

<style>
	.detail {
		display: grid;
		gap: 2.25rem;
		max-width: 42rem;
	}

	.back {
		width: fit-content;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
		transition: color 0.15s ease;
	}

	.back:hover {
		color: var(--pine);
	}

	.hero {
		display: grid;
		gap: 0.75rem;
		animation: rise 0.5s ease-out both;
	}

	.eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.sku {
		font-family: var(--font-mono);
		font-size: 0.8rem;
	}

	.dot {
		opacity: 0.5;
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.1rem, 6vw, 3.25rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1.05;
	}

	.lede {
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.55;
		color: var(--muted);
		max-width: 36ch;
	}

	.price {
		margin: 0.35rem 0 0;
		font-size: 1.75rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--pine-deep);
	}

	.specs,
	.stock {
		animation: rise 0.5s ease-out 0.1s both;
	}

	h2 {
		margin: 0 0 0.85rem;
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--pine);
	}

	dl {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 1.5rem;
		padding: 1.15rem 0;
		border-top: 1px solid var(--mist);
		border-bottom: 1px solid var(--mist);
	}

	dt {
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.2rem;
	}

	dd {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 600;
	}

	dd.mono {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		font-weight: 500;
	}

	dd.low {
		color: var(--danger);
	}

	.owner-id {
		margin-left: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--muted);
	}

	.stock ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.stock li {
		display: grid;
		gap: 0.15rem;
		padding: 0.9rem 0;
		border-bottom: 1px solid color-mix(in srgb, var(--mist) 70%, transparent);
	}

	.wh-name {
		font-weight: 600;
	}

	.wh-meta {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.wh-qty {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.qty {
		font-size: 1.25rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.threshold {
		font-size: 0.8rem;
		color: var(--muted);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
