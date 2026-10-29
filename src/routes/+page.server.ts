import { error } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categorySlug = url.searchParams.get('category');

	// Only the active category is needed here — the full list is loaded once by
	// the layout for the category nav.
	const activeCategory = categorySlug
		? await monospace.categories.readFirst({
				fields: ['id', 'name', 'slug'],
				filter: { slug: { _eq: categorySlug } }
			})
		: null;

	if (categorySlug && !activeCategory) {
		error(404, `Category "${categorySlug}" not found`);
	}

	const products = await monospace.products.readMany({
		fields: ['id', 'name', 'sku', 'price', 'description', 'weightKg'],
		include: { categories: { fields: ['id', 'name', 'slug'] } },
		filter: categorySlug ? { categories: { slug: { _eq: categorySlug } } } : undefined,
		sort: [{ name: { direction: 'asc' } }],
		limit: 100
	});

	// Products no longer expose an inventory relation, so stock is summed per productId.
	const productIds = products.flatMap((p) => (p.id ? [p.id] : []));
	const inventory = productIds.length
		? await monospace.inventory.readMany({
				fields: ['productId', 'quantityOnHand'],
				filter: { productId: { _in: productIds } },
				limit: 1000
			})
		: [];
	const stockByProduct: Record<string, number> = {};
	for (const row of inventory) {
		if (!row.productId) continue;
		stockByProduct[row.productId] = (stockByProduct[row.productId] ?? 0) + (row.quantityOnHand ?? 0);
	}

	return {
		products: products.map((p) => ({ ...p, stock: (p.id && stockByProduct[p.id]) || 0 })),
		activeCategory,
		categorySlug
	};
};
