import { Template } from '../types/settings.types';
import { settingsApi } from './api/settingsApi';
import { DEFAULT_TEMPLATES } from '../constants/settings.constants';

export const templateService = {
	async fetchTemplates(): Promise<Template[]> {
		try {
			// Try to fetch from API
			const templates = await settingsApi.getTemplates();
			return templates;
		} catch {
			// Fallback to localStorage
			const saved = localStorage.getItem('email_templates');
			if (saved) {
				return JSON.parse(saved);
			}
			// Initialize with defaults
			localStorage.setItem(
				'email_templates',
				JSON.stringify(DEFAULT_TEMPLATES),
			);
			return DEFAULT_TEMPLATES;
		}
	},

	async saveTemplate(template: Template): Promise<Template> {
		const updated = {
			...template,
			lastEdited: new Date().toISOString(),
		};

		try {
			await settingsApi.updateTemplate(updated);
		} catch {
			// Fallback to localStorage
			const templates = await this.fetchTemplates();
			const updatedTemplates = templates.map((t) =>
				t.id === updated.id ? updated : t,
			);
			localStorage.setItem('email_templates', JSON.stringify(updatedTemplates));
		}

		return updated;
	},

	async createTemplate(
		template: Omit<Template, 'id' | 'lastEdited'>,
	): Promise<Template> {
		const newTemplate: Template = {
			...template,
			id: Date.now().toString(),
			lastEdited: new Date().toISOString(),
		};

		try {
			await settingsApi.createTemplate(newTemplate);
		} catch {
			const templates = await this.fetchTemplates();
			localStorage.setItem(
				'email_templates',
				JSON.stringify([...templates, newTemplate]),
			);
		}

		return newTemplate;
	},

	async deleteTemplate(id: string): Promise<void> {
		try {
			await settingsApi.deleteTemplate(id);
		} catch {
			const templates = await this.fetchTemplates();
			localStorage.setItem(
				'email_templates',
				JSON.stringify(templates.filter((t) => t.id !== id)),
			);
		}
	},

	renderTemplate(
		template: Template,
		variables: Record<string, string>,
	): string {
		let result = template.content;
		Object.entries(variables).forEach(([key, value]) => {
			result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
		});
		return result;
	},
};
