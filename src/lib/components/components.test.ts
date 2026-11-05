import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Mail from '@lucide/svelte/icons/mail';
import House from '@lucide/svelte/icons/house';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Alert from './Alert.svelte';
import AppShell from './AppShell.svelte';
import AuthShell from './AuthShell.svelte';
import Avatar from './Avatar.svelte';
import Badge from './Badge.svelte';
import Button from './Button.svelte';
import CardPage from './CardPage.svelte';
import EmptyState from './EmptyState.svelte';
import Field from './Field.svelte';
import FormError from './FormError.svelte';
import Illustration from './Illustration.svelte';
import LanguageSwitch from './LanguageSwitch.svelte';
import Logo from './Logo.svelte';
import Modal from './Modal.svelte';
import ProjectForm from './ProjectForm.svelte';
import StatCard from './StatCard.svelte';

const page = vi.hoisted(() => ({ data: { locale: 'fr' } as Record<string, unknown>, url: new URL('http://localhost/app/1/projects?q=x') }));
vi.mock('$app/state', () => ({ page }));
vi.mock('$app/forms', () => ({ enhance: () => ({ destroy() {} }) }));

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

beforeEach(() => {
	page.data = { locale: 'fr' };
});

describe('Button', () => {
	it('renders a link or a submit button with its variant', () => {
		render(Button, { href: '/signup', variant: 'secondary', children: text('Essayer') });
		const link = screen.getByRole('link', { name: 'Essayer' });
		expect(link).toHaveAttribute('href', '/signup');
		expect(link).toHaveClass('btn', 'secondary', 'md');
		expect(link).not.toHaveAttribute('target');

		render(Button, { type: 'submit', variant: 'danger', size: 'sm', full: true, disabled: true, formaction: '?/delete', children: text('Supprimer') });
		const button = screen.getByRole('button', { name: 'Supprimer' });
		expect(button).toHaveAttribute('type', 'submit');
		expect(button).toHaveAttribute('formaction', '?/delete');
		expect(button).toBeDisabled();
		expect(button).toHaveClass('danger', 'sm', 'full');
	});

	it('opens external links safely', () => {
		render(Button, { href: 'http://localhost:8025', external: true, children: text('Boîte') });
		expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
	});
});

describe('Field', () => {
	it('labels the input and shows help text', () => {
		render(Field, { label: 'E-mail', name: 'email', type: 'email', value: 'marie@demo.test', help: 'Adresse inventée', icon: Mail });
		const input = screen.getByLabelText('E-mail');
		expect(input).toHaveValue('marie@demo.test');
		expect(input).toHaveAccessibleDescription('Adresse inventée');
		expect(input).toHaveAttribute('aria-invalid', 'false');
	});

	it('shows errors instead of the help and supports multi-line text', () => {
		render(Field, { label: 'Description', name: 'description', multiline: true, value: 'Refonte', error: ['Trop long.', 'Encore.'], help: 'Aide' });
		const area = screen.getByLabelText('Description');
		expect(area.tagName).toBe('TEXTAREA');
		expect(area).toHaveValue('Refonte');
		expect(area).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByText('Trop long. Encore.')).toBeInTheDocument();
		expect(screen.queryByText('Aide')).not.toBeInTheDocument();
	});
});

describe('small components', () => {
	it('Badge, Avatar, Logo, StatCard, Illustration', () => {
		render(Badge, { tone: 'success', children: text('Actif') });
		expect(screen.getByText('Actif').closest('.badge')).toHaveClass('success');
		render(Avatar, { name: 'Marie Koné', id: '1', size: 40 });
		expect(screen.getByText('MK')).toHaveAttribute('aria-hidden', 'true');
		const { container } = render(Logo, { inverse: true });
		expect(container.querySelector('.logo')).toHaveClass('inverse');
		render(StatCard, { icon: House, label: 'Projets', value: 3, sub: 'sur 3 max' });
		expect(screen.getByText('sur 3 max')).toBeInTheDocument();
		const img = render(Illustration, { name: 'pro', size: 160 }).container.querySelector('img');
		expect(img).toHaveAttribute('alt', '');
		expect(img).toHaveAttribute('width', '160');
	});

	it('Alert uses role alert only for errors', () => {
		render(Alert, { tone: 'danger', children: text('Erreur') });
		expect(screen.getByRole('alert')).toHaveTextContent('Erreur');
		render(Alert, { tone: 'warning', children: text('Limite'), action: text('Passer en Pro') });
		expect(screen.getByRole('status')).toHaveTextContent('Passer en Pro');
	});

	it('FormError shows a general message, not field errors', () => {
		render(FormError, { form: { message: 'Accès refusé', errors: {} } });
		expect(screen.getByRole('alert')).toHaveTextContent('Accès refusé');
		const second = render(FormError, { form: { message: 'x', errors: { name: ['y'] } } });
		expect(second.container.querySelector('.form-error')).toBeNull();
	});

	it('EmptyState shows the illustration, the texts and the action', () => {
		render(EmptyState, { illustration: 'projets-vide', title: 'Aucun projet', text: 'Créez-en un.', children: text('Créer') });
		expect(screen.getByRole('heading', { name: 'Aucun projet' })).toBeInTheDocument();
		expect(screen.getByText('Créer')).toBeInTheDocument();
	});

	it('Modal opens and closes the native dialog', async () => {
		const showModal = vi.fn(function (this: HTMLDialogElement) {
			this.setAttribute('open', '');
		});
		const close = vi.fn(function (this: HTMLDialogElement) {
			this.removeAttribute('open');
		});
		HTMLDialogElement.prototype.showModal = showModal;
		HTMLDialogElement.prototype.close = close;
		const { rerender } = render(Modal, { open: true, label: 'Bienvenue dans Pro', children: text('Contenu') });
		expect(showModal).toHaveBeenCalled();
		await rerender({ open: false });
		expect(close).toHaveBeenCalled();
	});
});

describe('language and layouts', () => {
	it('LanguageSwitch posts the choice and comes back to the same page', () => {
		page.data = { locale: 'en' };
		const { container } = render(LanguageSwitch);
		expect(container.querySelector('form')).toHaveAttribute('action', '/lang');
		expect(container.querySelector('input[name=redirectTo]')).toHaveValue('/app/1/projects?q=x');
		expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByRole('button', { name: 'FR' })).toHaveAttribute('aria-pressed', 'false');
	});

	it('CardPage and AuthShell frame their content', () => {
		render(CardPage, { children: text('Carte') });
		expect(screen.getByText('Carte')).toBeInTheDocument();
		render(AuthShell, { title: 'Bon retour parmi nous', points: ['Un', 'Deux'], children: text('Formulaire') });
		expect(screen.getByText('Bon retour parmi nous')).toBeInTheDocument();
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	it('AppShell marks the current page and lists the organizations', () => {
		const user = { id: '9', name: 'Marie Koné', email: 'marie@demo.test', emailVerified: true, isSuperAdmin: false, locale: 'fr' as const };
		const acme = { id: '1', name: 'Acme', plan: 'free' as const, role: 'owner' as const, members: 2 };
		render(AppShell, {
			user,
			title: 'Projets',
			nav: [
				{ href: '/app/1', label: 'Tableau de bord', icon: House, exact: true },
				{ href: '/app/1/projects', label: 'Projets', icon: House }
			],
			organizations: [acme, { ...acme, id: '2', name: 'Globex' }],
			current: acme,
			searchAction: '/app/1/projects',
			children: text('Contenu')
		});
		expect(screen.getByRole('link', { name: 'Projets' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: 'Tableau de bord' })).not.toHaveAttribute('aria-current');
		expect(screen.getByRole('link', { name: 'Globex' })).toHaveAttribute('href', '/app/2');
		expect(screen.getByRole('search')).toHaveAttribute('action', '/app/1/projects');
		expect(screen.getByRole('button', { name: /Se déconnecter/ })).toBeInTheDocument();
	});

	it('AppShell for the super admin shows the back office badge', () => {
		const user = { id: '0', name: 'Super Admin', email: 'admin@demo.test', emailVerified: true, isSuperAdmin: true, locale: 'fr' as const };
		render(AppShell, { user, title: 'Back-office', nav: [], superAdmin: true, children: text('x') });
		expect(screen.getAllByText('Super-admin').length).toBeGreaterThan(0);
		expect(screen.queryByRole('search')).toBeNull();
	});

	it('ProjectForm fills the fields from the project or the refused values', () => {
		const members = [{ id: '1', name: 'Marie Koné', email: 'm@demo.test', role: 'owner' as const, joinedAt: '' }];
		const project = {
			id: 'p', name: 'Site vitrine', description: 'Refonte', status: 'active' as const, leadId: '1', leadName: 'Marie Koné',
			dueDate: '2026-11-28', createdBy: '1', createdAt: '', updatedAt: ''
		};
		render(ProjectForm, { project, members, form: null, submit: 'Enregistrer', cancelHref: '/app/1/projects/p' });
		expect(screen.getByLabelText('Nom du projet')).toHaveValue('Site vitrine');
		expect(screen.getByLabelText('Statut')).toHaveValue('active');
		expect(screen.getByLabelText('Responsable')).toHaveValue('1');
		expect(screen.getByLabelText('Échéance')).toHaveValue('2026-11-28');

		render(ProjectForm, {
			members,
			form: { message: 'x', errors: { name: ['Ce champ est obligatoire.'] }, values: { name: '', status: 'draft' } },
			submit: 'Créer le projet',
			cancelHref: '/app/1/projects'
		});
		expect(screen.getByText('Ce champ est obligatoire.')).toBeInTheDocument();
	});
});
