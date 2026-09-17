<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrice, formatDateTime, formatRelativeDay, formatDuration } from '$lib/format';
	import type {
		SalesCallFormField,
		SalesCallFormValues
	} from './+page.server';
	import type { PageData } from './$types';

	type FormState =
		| { success: true }
		| { errors: Partial<Record<SalesCallFormField | 'form', string>>; values: SalesCallFormValues };

	let { data, form }: { data: PageData; form: FormState | null | undefined } = $props();

	let showForm = $state(false);
	let submitting = $state(false);

	const statusLabels: Record<string, string> = {
		scheduled: 'Scheduled',
		completed: 'Completed',
		no_show: 'No show',
		cancelled: 'Cancelled'
	};

	const outcomeLabels: Record<string, string> = {
		interested: 'Interested',
		not_interested: 'Not interested',
		follow_up: 'Follow up',
		closed_won: 'Closed won',
		closed_lost: 'Closed lost'
	};

	const filters = [
		{ value: 'all', label: 'All' },
		{ value: 'scheduled', label: 'Scheduled' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'no_show', label: 'No show' },
		{ value: 'cancelled', label: 'Cancelled' }
	] as const;

	let activeFilter = $state<string>('all');

	const visibleCalls = $derived(
		activeFilter === 'all'
			? data.calls
			: data.calls.filter((call) => call.status === activeFilter)
	);

	function initials(name: string | null | undefined): string {
		if (!name) return '?';
		return name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
	}

	function defaultScheduledAt(): string {
		const date = new Date();
		date.setMinutes(date.getMinutes() + 60 - (date.getMinutes() % 15));
		date.setSeconds(0, 0);
		return date.toISOString().slice(0, 16);
	}

	const field = (name: SalesCallFormField) =>
		form && 'values' in form ? (form.values[name] ?? '') : '';
</script>

<svelte:head>
	<title>Sales dashboard · Atlas</title>
</svelte:head>

<section class="dashboard" aria-labelledby="dash-heading">
	<div class="dash-head">
		<div>
			<h1 id="dash-heading">Sales calls</h1>
			<p class="subtitle">Latest activity across your pipeline</p>
		</div>
		<button type="button" class="new-btn" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Close form' : 'New call'}
		</button>
	</div>

	{#if form && 'success' in form}
		<p class="form-success toast" role="status">Call saved.</p>
	{/if}

	{#if showForm || (form && 'errors' in form)}
		<form
			class="call-form"
			method="POST"
			action="?/create"
			use:enhance={() => {
				submitting = true;
				return async ({ update, result }) => {
					submitting = false;
					if (result.type === 'success') {
						showForm = false;
					}
					await update();
				};
			}}
		>
			<h2 class="form-title">Log a sales call</h2>

			{#if form && 'errors' in form && form.errors.form}
				<p class="form-error banner" role="alert">{form.errors.form}</p>
			{/if}

			<div class="form-grid">
				<label class="field">
					<span>Contact name</span>
					<input name="contact_name" type="text" required value={field('contact_name')} />
					{#if form && 'errors' in form && form.errors.contact_name}
						<span class="field-error">{form.errors.contact_name}</span>
					{/if}
				</label>

				<label class="field">
					<span>Company</span>
					<input name="company" type="text" value={field('company')} />
				</label>

				<label class="field">
					<span>Phone</span>
					<input name="phone" type="tel" autocomplete="tel" value={field('phone')} />
				</label>

				<label class="field">
					<span>Email</span>
					<input name="email" type="email" autocomplete="email" value={field('email')} />
					{#if form && 'errors' in form && form.errors.email}
						<span class="field-error">{form.errors.email}</span>
					{/if}
				</label>

				<label class="field span-2">
					<span>Subject</span>
					<input name="subject" type="text" required value={field('subject')} />
					{#if form && 'errors' in form && form.errors.subject}
						<span class="field-error">{form.errors.subject}</span>
					{/if}
				</label>

				<label class="field">
					<span>Scheduled at</span>
					<input
						name="scheduled_at"
						type="datetime-local"
						required
						value={field('scheduled_at') || defaultScheduledAt()}
					/>
					{#if form && 'errors' in form && form.errors.scheduled_at}
						<span class="field-error">{form.errors.scheduled_at}</span>
					{/if}
				</label>

				<label class="field">
					<span>Status</span>
					<select name="status" value={field('status') || 'scheduled'}>
						<option value="scheduled">Scheduled</option>
						<option value="completed">Completed</option>
						<option value="no_show">No show</option>
						<option value="cancelled">Cancelled</option>
					</select>
				</label>

				<label class="field">
					<span>Duration (minutes)</span>
					<input
						name="duration_minutes"
						type="number"
						min="0"
						step="5"
						value={field('duration_minutes')}
					/>
					{#if form && 'errors' in form && form.errors.duration_minutes}
						<span class="field-error">{form.errors.duration_minutes}</span>
					{/if}
				</label>

				<label class="field">
					<span>Deal value (USD)</span>
					<input
						name="deal_value"
						type="number"
						min="0"
						step="0.01"
						inputmode="decimal"
						value={field('deal_value')}
					/>
					{#if form && 'errors' in form && form.errors.deal_value}
						<span class="field-error">{form.errors.deal_value}</span>
					{/if}
				</label>

				<label class="field span-2">
					<span>Notes</span>
					<textarea name="notes" rows="3">{field('notes')}</textarea>
				</label>
			</div>

			<div class="form-actions">
				<button type="button" class="ghost-btn" onclick={() => (showForm = false)}>Cancel</button>
				<button type="submit" class="submit-btn" disabled={submitting}>
					{submitting ? 'Saving…' : 'Save call'}
				</button>
			</div>
		</form>
	{/if}

	<div class="stats" role="list">
		<div class="stat" role="listitem">
			<span class="stat-label">Total calls</span>
			<span class="stat-value">{data.stats.total}</span>
		</div>
		<div class="stat" role="listitem">
			<span class="stat-label">Upcoming</span>
			<span class="stat-value">{data.stats.upcoming}</span>
		</div>
		<div class="stat" role="listitem">
			<span class="stat-label">Completed</span>
			<span class="stat-value">{data.stats.completed}</span>
		</div>
		<div class="stat" role="listitem">
			<span class="stat-label">Open pipeline</span>
			<span class="stat-value">{formatPrice(data.stats.pipelineValue)}</span>
		</div>
		<div class="stat accent" role="listitem">
			<span class="stat-label">Won</span>
			<span class="stat-value">{formatPrice(data.stats.wonValue)}</span>
		</div>
	</div>

	<div class="toolbar" role="tablist" aria-label="Filter by status">
		{#each filters as filter (filter.value)}
			<button
				type="button"
				role="tab"
				aria-selected={activeFilter === filter.value}
				class="chip"
				class:active={activeFilter === filter.value}
				onclick={() => (activeFilter = filter.value)}
			>
				{filter.label}
			</button>
		{/each}
		<span class="result-count">{visibleCalls.length} shown</span>
	</div>

	{#if visibleCalls.length === 0}
		<p class="empty">No calls match this filter.</p>
	{:else}
		<ul class="call-list">
			{#each visibleCalls as call, i (call.id)}
				<li style="--i: {i}">
					<article class="call-row">
						<span class="avatar" aria-hidden="true">{initials(call.contact_name)}</span>
						<div class="who">
							<span class="name">{call.contact_name}</span>
							<span class="company">{call.company ?? 'Independent'}</span>
						</div>
						<div class="subject">
							<span class="subject-text">{call.subject}</span>
							{#if call.outcome}
								<span class="outcome outcome-{call.outcome}">
									{outcomeLabels[call.outcome] ?? call.outcome}
								</span>
							{/if}
						</div>
						<div class="when">
							<span class="when-abs">{formatDateTime(call.scheduled_at)}</span>
							<span class="when-rel">{formatRelativeDay(call.scheduled_at)}</span>
						</div>
						<span class="duration">{formatDuration(call.duration_minutes)}</span>
						<span class="value">{call.deal_value ? formatPrice(call.deal_value) : '—'}</span>
						<span class="status status-{call.status}">
							{statusLabels[call.status ?? ''] ?? call.status}
						</span>
					</article>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.dash-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.new-btn,
	.submit-btn {
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1px solid var(--pine);
		background: var(--pine);
		color: var(--chalk);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition:
			background 0.2s ease,
			transform 0.2s ease;
	}

	.new-btn:hover,
	.submit-btn:hover:not(:disabled) {
		background: var(--pine-deep);
		transform: translateY(-1px);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.call-form {
		margin-bottom: 1.75rem;
		padding: 1.25rem;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--chalk) 80%, transparent);
		border: 1px solid color-mix(in srgb, var(--mist) 80%, transparent);
	}

	.form-title {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.9rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.field input,
	.field select,
	.field textarea {
		padding: 0.55rem 0.7rem;
		border: 1px solid var(--mist);
		border-radius: 0.35rem;
		background: var(--chalk);
		color: var(--ink);
		font: inherit;
		font-size: 0.95rem;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		outline: 2px solid color-mix(in srgb, var(--signal) 50%, transparent);
		border-color: var(--signal);
	}

	.field-error,
	.form-error {
		color: var(--danger);
		font-size: 0.8rem;
	}

	.form-error.banner {
		margin: 0 0 1rem;
		padding: 0.65rem 0.8rem;
		border-radius: 0.35rem;
		background: color-mix(in srgb, var(--danger) 10%, transparent);
	}

	.form-success {
		margin: 0 0 1rem;
		padding: 0.65rem 0.8rem;
		border-radius: 0.35rem;
		color: var(--pine);
		background: color-mix(in srgb, var(--pine) 12%, transparent);
		font-weight: 600;
	}

	.form-success.toast {
		margin-top: -0.5rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.1rem;
	}

	.ghost-btn {
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1px solid var(--mist);
		background: transparent;
		color: var(--muted);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.ghost-btn:hover {
		color: var(--ink);
		border-color: color-mix(in srgb, var(--pine) 35%, var(--mist));
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.subtitle {
		margin: 0.25rem 0 0;
		color: var(--muted);
		font-size: 0.95rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.75rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1rem 1.1rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--chalk) 70%, transparent);
		border: 1px solid color-mix(in srgb, var(--mist) 75%, transparent);
	}

	.stat.accent {
		background: linear-gradient(150deg, var(--pine), var(--pine-deep));
		border-color: transparent;
		color: var(--chalk);
	}

	.stat-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	.stat.accent .stat-label {
		color: color-mix(in srgb, var(--chalk) 80%, transparent);
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.chip {
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--mist);
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
		background: color-mix(in srgb, var(--chalk) 70%, transparent);
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.chip:hover {
		color: var(--ink);
		border-color: color-mix(in srgb, var(--pine) 35%, var(--mist));
		transform: translateY(-1px);
	}

	.chip.active {
		background: var(--pine);
		border-color: var(--pine);
		color: var(--chalk);
	}

	.result-count {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--muted);
	}

	.empty {
		padding: 2.5rem 0;
		color: var(--muted);
	}

	.call-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.call-list li {
		animation: row-in 0.4s ease-out both;
		animation-delay: calc(var(--i) * 24ms);
	}

	.call-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.6rem 0.85rem;
		align-items: center;
		padding: 0.9rem 1rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--chalk) 55%, transparent);
		border: 1px solid transparent;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.call-row:hover {
		background: var(--chalk);
		border-color: color-mix(in srgb, var(--pine) 22%, var(--mist));
		transform: translateX(3px);
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		background: linear-gradient(150deg, var(--signal), var(--pine));
		color: var(--chalk);
		font-weight: 700;
		font-size: 0.85rem;
		letter-spacing: 0.02em;
	}

	.who {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.name {
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.company,
	.when-abs,
	.duration {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.subject {
		grid-column: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.subject-text {
		font-size: 0.9rem;
	}

	.when {
		grid-column: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
	}

	.when-rel {
		font-size: 0.75rem;
		color: var(--pine);
		font-weight: 600;
	}

	.value {
		grid-column: 2;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.duration {
		grid-column: 2;
		font-family: var(--font-mono);
	}

	.status,
	.outcome {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		width: fit-content;
	}

	.status {
		grid-column: 2;
	}

	.status-scheduled {
		background: color-mix(in srgb, var(--signal) 18%, transparent);
		color: var(--signal);
	}

	.status-completed {
		background: color-mix(in srgb, var(--pine) 16%, transparent);
		color: var(--pine);
	}

	.status-no_show {
		background: color-mix(in srgb, var(--danger) 14%, transparent);
		color: var(--danger);
	}

	.status-cancelled {
		background: color-mix(in srgb, var(--muted) 16%, transparent);
		color: var(--muted);
	}

	.outcome-closed_won {
		background: color-mix(in srgb, var(--pine) 16%, transparent);
		color: var(--pine);
	}

	.outcome-closed_lost {
		background: color-mix(in srgb, var(--danger) 14%, transparent);
		color: var(--danger);
	}

	.outcome-follow_up,
	.outcome-interested {
		background: color-mix(in srgb, var(--signal) 16%, transparent);
		color: var(--signal);
	}

	.outcome-not_interested {
		background: color-mix(in srgb, var(--muted) 16%, transparent);
		color: var(--muted);
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

	@media (min-width: 640px) {
		.stats {
			grid-template-columns: repeat(5, 1fr);
		}

		.form-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.span-2 {
			grid-column: span 2;
		}
	}

	@media (min-width: 900px) {
		.call-row {
			grid-template-columns: auto minmax(0, 1.1fr) minmax(0, 1.4fr) auto auto auto auto;
			gap: 1.25rem;
		}

		.subject,
		.when,
		.value,
		.duration,
		.status {
			grid-column: auto;
		}

		.when {
			flex-direction: column;
			gap: 0.1rem;
			align-items: flex-start;
		}

		.value {
			text-align: right;
			min-width: 5rem;
		}

		.status {
			justify-self: end;
			min-width: 6rem;
			justify-content: center;
		}
	}
</style>
