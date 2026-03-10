import { useState, useEffect } from 'react';
import { Template } from '../types/settings.types';
import { templateService } from '../services/templateService';

export const useTemplates = () => {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadTemplates();
	}, []);

	const loadTemplates = async () => {
		setLoading(true);
		try {
			const data = await templateService.fetchTemplates();
			setTemplates(data);
		} catch (err) {
			setError('Failed to load templates');
		} finally {
			setLoading(false);
		}
	};

	const saveTemplate = async (template: Template) => {
		try {
			const saved = await templateService.saveTemplate(template);
			setTemplates((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
			return saved;
		} catch (err) {
			setError('Failed to save template');
			throw err;
		}
	};

	const createTemplate = async (
		template: Omit<Template, 'id' | 'lastEdited'>,
	) => {
		try {
			const created = await templateService.createTemplate(template);
			setTemplates((prev) => [...prev, created]);
			return created;
		} catch (err) {
			setError('Failed to create template');
			throw err;
		}
	};

	const deleteTemplate = async (id: string) => {
		try {
			await templateService.deleteTemplate(id);
			setTemplates((prev) => prev.filter((t) => t.id !== id));
		} catch (err) {
			setError('Failed to delete template');
			throw err;
		}
	};

	return {
		templates,
		loading,
		error,
		saveTemplate,
		createTemplate,
		deleteTemplate,
		refreshTemplates: loadTemplates,
	};
};
