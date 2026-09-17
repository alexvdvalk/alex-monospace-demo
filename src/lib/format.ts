export function formatPrice(value: string | number | null | undefined): string {
	const amount = typeof value === 'number' ? value : Number(value ?? 0);
	if (Number.isNaN(amount)) return '—';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(amount);
}

export function formatWeight(value: string | number | null | undefined): string {
	if (value == null || value === '') return '—';
	const kg = typeof value === 'number' ? value : Number(value);
	if (Number.isNaN(kg)) return '—';
	if (kg < 1) return `${Math.round(kg * 1000)} g`;
	return `${kg.toFixed(kg >= 10 ? 1 : 2)} kg`;
}

export function stockTotal(
	inventory: { data: { quantity_on_hand: number | null }[] } | null | undefined
): number {
	if (!inventory?.data?.length) return 0;
	return inventory.data.reduce((sum, row) => sum + (row.quantity_on_hand ?? 0), 0);
}

export function formatDateTime(value: string | null | undefined): string {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(date);
}

export function formatRelativeDay(value: string | null | undefined): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const now = new Date();
	const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
	const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
	const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
	if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
	return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatDuration(minutes: number | null | undefined): string {
	if (minutes == null) return '—';
	if (minutes < 60) return `${minutes}m`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatOwner(
	owner:
		| {
				FIRST_NAME?: string | null;
				last_name?: string | null;
				emp_no?: number | null;
		  }
		| null
		| undefined
): string | null {
	if (!owner) return null;
	const name = [owner.FIRST_NAME, owner.last_name].filter(Boolean).join(' ').trim();
	if (name) return name;
	if (owner.emp_no != null) return `#${owner.emp_no}`;
	return null;
}
