import { error, fail } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import { isPriority, isStatus, isType } from '$lib/tracker';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const projectKey = params.key.toUpperCase();
	if (!/^\d+$/.test(params.number)) error(400, 'Invalid issue number');
	const issueNumber = Number(params.number);

	const project = await monospace.jiraProjects.readFirst({
		fields: ['id', 'name', 'key'],
		filter: { key: { _eq: projectKey } }
	});
	if (!project) throw error(404, `Project "${projectKey}" not found`);

	const issue = await monospace.jiraIssues.readFirst({
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
		include: {
			jira_comments: {
				fields: ['id', 'author', 'body', 'createdAt'],
				sort: [{ createdAt: { direction: 'asc' } }]
			}
		},
		filter: {
			_and: [{ projectId: { _eq: project.id! } }, { issueNumber: { _eq: issueNumber } }]
		}
	});
	if (!issue) throw error(404, `Issue ${projectKey}-${issueNumber} not found`);

	return { project, issue };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const projectKey = params.key.toUpperCase();
		const issueNumber = Number(params.number);

		const issue = await monospace.jiraIssues.readFirst({
			fields: ['id'],
			filter: {
				_and: [
					{ jira_projects: { key: { _eq: projectKey } } },
					{ issueNumber: { _eq: issueNumber } }
				]
			}
		});
		if (!issue) throw error(404, 'Issue not found');

		const data: Record<string, string | null> = {};
		// Form inputs keep their snake_case names; the API uses camelCase.
		const nullable = [
			['assignee', 'assignee'],
			['labels', 'labels'],
			['due_date', 'dueDate']
		] as const;
		for (const [input, field] of nullable) {
			const val = formData.get(input);
			if (val !== null) {
				data[field] = val.toString().trim() || null;
			}
		}

		const enums = [
			['status', isStatus],
			['priority', isPriority],
			['type', isType]
		] as const;
		for (const [field, isValid] of enums) {
			const val = formData.get(field);
			if (val === null) continue;
			const str = val.toString();
			if (!isValid(str)) {
				return fail(400, { action: 'update', errors: { form: `Invalid ${field}.` } });
			}
			data[field] = str;
		}

		const title = formData.get('title');
		if (title !== null) {
			const titleStr = title.toString().trim();
			if (!titleStr) return fail(400, { action: 'update', errors: { title: 'Title cannot be empty' } });
			data.title = titleStr;
		}

		const description = formData.get('description');
		if (description !== null) {
			data.description = description.toString().trim() || null;
		}

		if (Object.keys(data).length === 0) {
			return fail(400, { action: 'update', errors: { form: 'Nothing to update.' } });
		}

		try {
			await monospace.jiraIssues.updateOne({
				key: issue.id!,
				data,
				fields: ['id']
			});
		} catch (err) {
			console.error('Failed to update issue:', err);
			return fail(500, { action: 'update', errors: { form: 'Could not update issue.' } });
		}

		return { success: true, action: 'update' };
	},

	comment: async ({ request, params }) => {
		const formData = await request.formData();
		const projectKey = params.key.toUpperCase();
		const issueNumber = Number(params.number);
		const author = formData.get('author')?.toString().trim() ?? '';
		const body = formData.get('body')?.toString().trim() ?? '';

		if (!author) return fail(400, { action: 'comment', errors: { author: 'Name is required' }, values: { author, body } });
		if (!body) return fail(400, { action: 'comment', errors: { body: 'Comment cannot be empty' }, values: { author, body } });

		const issue = await monospace.jiraIssues.readFirst({
			fields: ['id'],
			filter: {
				_and: [
					{ jira_projects: { key: { _eq: projectKey } } },
					{ issueNumber: { _eq: issueNumber } }
				]
			}
		});
		if (!issue) throw error(404, 'Issue not found');

		try {
			await monospace.jiraComments.createOne({
				data: {
					id: crypto.randomUUID(),
					jira_issues: { _connect: { key: { id: issue.id! } } },
					author,
					body,
					createdAt: new Date().toISOString()
				},
				fields: ['id']
			});
		} catch (err) {
			console.error('Failed to add comment:', err);
			return fail(500, { action: 'comment', errors: { form: 'Could not add comment.' }, values: { author, body } });
		}

		return { success: true, action: 'comment' };
	}
};
