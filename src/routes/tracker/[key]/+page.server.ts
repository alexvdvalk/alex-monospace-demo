import { error, fail } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import { isPriority, isType } from '$lib/tracker';
import type { Uuid } from '../../../generated/monospace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const project = await monospace.jiraProjects.readFirst({
		fields: ['id', 'name', 'key', 'description'],
		filter: { key: { _eq: params.key.toUpperCase() } }
	});
	if (!project) throw error(404, `Project "${params.key}" not found`);

	const issues = await monospace.jiraIssues.readMany({
		fields: [
			'id',
			'issueNumber',
			'title',
			'description',
			'type',
			'status',
			'priority',
			'assignee',
			'reporter',
			'labels',
			'dueDate',
			'createdAt',
			'updatedAt'
		],
		filter: { projectId: { _eq: project.id! } },
		sort: [{ issueNumber: { direction: 'asc' } }],
		limit: 500
	});

	return { project, issues };
};

export const actions: Actions = {
	create: async ({ request, params }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() || null;
		const type = formData.get('type')?.toString() ?? 'task';
		const priority = formData.get('priority')?.toString() ?? 'medium';
		const assignee = formData.get('assignee')?.toString().trim() || null;
		const reporter = formData.get('reporter')?.toString().trim() || 'System';
		const labels = formData.get('labels')?.toString().trim() || null;
		const due_date = formData.get('due_date')?.toString() || null;

		const values = { title, description, type, priority, assignee, reporter, labels, due_date };

		const errors: Record<string, string> = {};
		if (!title) errors.title = 'Title is required';
		if (!isType(type)) errors.type = 'Choose a valid type';
		if (!isPriority(priority)) errors.priority = 'Choose a valid priority';

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'create', errors, values });
		}

		const project = await monospace.jiraProjects.readFirst({
			fields: ['id', 'key'],
			filter: { key: { _eq: params.key.toUpperCase() } }
		});
		if (!project) throw error(404, 'Project not found');

		const latest = await monospace.jiraIssues.readFirst({
			fields: ['issueNumber'],
			filter: { projectId: { _eq: project.id! } },
			sort: [{ issueNumber: { direction: 'desc' } }]
		});
		const nextNumber = (latest?.issueNumber ?? 0) + 1;

		try {
			const now = new Date().toISOString();
			await monospace.jiraIssues.createOne({
				data: {
					id: crypto.randomUUID(),
					jira_projects: { _connect: { key: { id: project.id! } } },
					issueNumber: nextNumber,
					title,
					description,
					type,
					priority,
					assignee,
					reporter,
					labels,
					dueDate: due_date,
					status: 'todo',
					createdAt: now,
					updatedAt: now
				},
				fields: ['id']
			});
		} catch (err) {
			console.error('Failed to create issue:', err);
			return fail(500, { action: 'create', errors: { form: 'Could not create issue.' }, values });
		}

		return { success: true, action: 'create' };
	},

	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const issueId = formData.get('issue_id')?.toString() ?? '';
		const status = formData.get('status')?.toString() ?? '';

		if (!issueId || !status) return fail(400, { action: 'updateStatus', errors: { form: 'Missing issue or status' } });

		try {
			await monospace.jiraIssues.updateOne({
				key: issueId as Uuid,
				data: { status },
				fields: ['id']
			});
		} catch (err) {
			console.error('Failed to update status:', err);
			return fail(500, { action: 'updateStatus', errors: { form: 'Could not update status.' } });
		}

		return { success: true, action: 'updateStatus' };
	}
};
