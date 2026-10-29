import { error } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import type { Uuid } from '../../../generated/monospace';
import type { PageServerLoad } from './$types';

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asUuid(value: string): Uuid {
	if (!UUID_RE.test(value)) {
		error(404, 'Product not found');
	}
	return value as Uuid;
}

export const load: PageServerLoad = async ({ params }) => {
	const key = asUuid(params.id);

	try {
		// Products no longer expose an inventory relation, so stock is read by productId.
		const [product, inventory] = await Promise.all([
			monospace.products.readOne({
				key,
				fields: ['id', 'name', 'sku', 'price', 'description', 'weightKg', 'createdAt'],
				include: { categories: { fields: ['id', 'name', 'slug'] } }
			}),
			monospace.inventory.readMany({
				fields: ['id', 'quantityOnHand', 'reorderThreshold'],
				include: {
					warehouse_locations: { fields: ['id', 'name', 'region', 'country', 'capacity'] }
				},
				filter: { productId: { _eq: key } },
				sort: [{ id: { direction: 'asc' } }]
			})
		]);

		return { product, inventory };
	} catch (e) {
		const status = e && typeof e === 'object' && 'status' in e ? Number(e.status) : 0;
		if (status === 404) {
			error(404, 'Product not found');
		}
		throw e;
	}
};
