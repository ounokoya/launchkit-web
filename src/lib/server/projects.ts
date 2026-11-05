// Reads the project form (ProjectForm.svelte) into the API body.
export function projectBody(form: FormData) {
	const text = (key: string) => String(form.get(key) ?? '').trim();
	return {
		name: text('name'),
		description: text('description'),
		status: text('status') || 'draft',
		leadId: text('leadId'),
		dueDate: text('dueDate') || null
	};
}
