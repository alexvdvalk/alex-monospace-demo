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
		const product = await monospace.products.readOne({
			key,
			fields: [
				'id',
				'name',
				'sku',
				'price',
				'description',
				'weight_kg',
				'created_at',
				{ categories: ['id', 'name', 'slug'] },
				{ EMPLOYEE: ['emp_no', 'FIRST_NAME', 'last_name', 'hire_date'] },
				{
					inventory: [
						'id',
						'quantity_on_hand',
						'reorder_threshold',
						{
							warehouse_locations: ['id', 'name', 'region', 'country', 'capacity']
						}
					]
				}
			] as const
		});

		return { product };
	} catch (e) {
		const status = e && typeof e === 'object' && 'status' in e ? Number(e.status) : 0;
		if (status === 404) {
			error(404, 'Product not found');
		}
		throw e;
	}
};
