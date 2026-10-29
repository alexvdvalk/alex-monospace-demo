import { fail } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import { isCallStatus } from '$lib/sales';
import type { Actions, PageServerLoad } from './$types';

export interface SalesCallFormValues {
	contact_name: string;
	company: string;
	phone: string;
	email: string;
	subject: string;
	scheduled_at: string;
	duration_minutes: string;
	status: string;
	deal_value: string;
	notes: string;
}

export type SalesCallFormField = keyof SalesCallFormValues;
export type SalesCallFormErrors = Partial<Record<SalesCallFormField | 'form', string>>;

const emptyToNull = (value: FormDataEntryValue | null): string | null => {
	const trimmed = value?.toString().trim() ?? '';
	return trimmed === '' ? null : trimmed;
};

const toNumber = (value: string | null | undefined): number => {
	if (value == null) return 0;
	const n = Number(value);
	return Number.isNaN(n) ? 0 : n;
};

export const load: PageServerLoad = async () => {
	const calls = await monospace.salesCalls.readMany({
		fields: [
			'id',
			'contactName',
			'company',
			'phone',
			'email',
			'subject',
			'scheduledAt',
			'durationMinutes',
			'status',
			'outcome',
			'dealValue',
			'notes'
		] as const,
		sort: [{ scheduledAt: { direction: 'desc' } }],
		limit: 200
	});

	const now = Date.now();

	const stats = {
		total: calls.length,
		upcoming: 0,
		completed: 0,
		unresolved: 0,
		pipelineValue: 0,
		wonValue: 0
	};

	for (const call of calls) {
		const isFuture = call.scheduledAt ? new Date(call.scheduledAt).getTime() >= now : false;
		if (call.status === 'scheduled') {
			stats.pipelineValue += toNumber(call.dealValue);
			if (isFuture) stats.upcoming += 1;
		}
		if (call.status === 'completed') stats.completed += 1;
		if (call.status === 'no_show' || call.status === 'cancelled') stats.unresolved += 1;
		if (call.outcome === 'closed_won') stats.wonValue += toNumber(call.dealValue);
	}

	return { calls, stats };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();

		const values = {
			contact_name: formData.get('contact_name')?.toString().trim() ?? '',
			company: formData.get('company')?.toString().trim() ?? '',
			phone: formData.get('phone')?.toString().trim() ?? '',
			email: formData.get('email')?.toString().trim() ?? '',
			subject: formData.get('subject')?.toString().trim() ?? '',
			scheduled_at: formData.get('scheduled_at')?.toString() ?? '',
			duration_minutes: formData.get('duration_minutes')?.toString().trim() ?? '',
			status: formData.get('status')?.toString() ?? 'scheduled',
			deal_value: formData.get('deal_value')?.toString().trim() ?? '',
			notes: formData.get('notes')?.toString().trim() ?? ''
		};

		const errors: SalesCallFormErrors = {};

		if (!values.contact_name) errors.contact_name = 'Contact name is required';
		if (!values.subject) errors.subject = 'Subject is required';
		if (!values.scheduled_at) {
			errors.scheduled_at = 'Scheduled time is required';
		} else if (Number.isNaN(new Date(values.scheduled_at).getTime())) {
			errors.scheduled_at = 'Enter a valid date and time';
		}

		if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
			errors.email = 'Enter a valid email address';
		}

		let duration_minutes: number | null = null;
		if (values.duration_minutes) {
			const parsed = Number.parseInt(values.duration_minutes, 10);
			if (Number.isNaN(parsed) || parsed < 0) {
				errors.duration_minutes = 'Duration must be a positive number';
			} else {
				duration_minutes = parsed;
			}
		}

		if (values.deal_value) {
			const amount = Number(values.deal_value);
			if (Number.isNaN(amount) || amount < 0) {
				errors.deal_value = 'Deal value must be a positive number';
			}
		}

		if (!isCallStatus(values.status)) {
			errors.status = 'Choose a valid status';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		try {
			const now = new Date().toISOString();
			await monospace.salesCalls.createOne({
				data: {
					id: crypto.randomUUID(),
					contactName: values.contact_name,
					subject: values.subject,
					scheduledAt: new Date(values.scheduled_at).toISOString(),
					company: emptyToNull(values.company),
					phone: emptyToNull(values.phone),
					email: emptyToNull(values.email),
					durationMinutes: duration_minutes,
					status: values.status,
					dealValue: emptyToNull(values.deal_value),
					notes: emptyToNull(values.notes),
					createdAt: now,
					updatedAt: now
				},
				fields: ['id']
			});
		} catch (error) {
			console.error('Failed to create sales call:', error);
			return fail(500, {
				errors: { form: 'Could not save the call. Please try again.' },
				values
			});
		}

		return { success: true };
	}
};
