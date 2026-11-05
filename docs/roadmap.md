# Roadmap · web (SvelteKit, responsive)

Dépôt `launchkit-web` (GitHub ounokoya) : le site public et l'application web, en SvelteKit,
pour ordinateur, tablette et téléphone.

Légende : ✅ validé · 💡 proposé, à valider · 🚧 en cours

| Version | Thème | Statut |
|---|---|---|
| v0.1.0 | Les 12 écrans du design, responsive | 🚧 (code et tests faits, validation en attente) |
| v0.2.0 | Comptes complets et vrai paiement en test | 💡 |
| v0.3.0 | Guidage et confort | 💡 |
| v1.0.0 | Kit personnalisable par client | 💡 |

## v0.1.0 · Les 12 écrans du design 🚧

**Écrans** ✅ (maquettes Penpot « 03 · Web », direction A)
- Public : W01 Accueil, W02 Inscription, W03 Connexion, W04 Vérifiez votre e-mail, W05 Créer son organisation,
  W08 Accepter une invitation.
- Application : W06 Tableau de bord, W07 Membres et invitations, W09 Abonnement (paiement simulé), W10 Projets,
  W11 Détail d'un projet.
- Back-office : W12 super-admin.
- États et erreurs 💡 : W07b Membres (un seul membre), W09b Pro activé, W10b Projets (liste vide),
  W13 Page introuvable (404), W14 Accès refusé (403), chacun avec son illustration (`brand/illustrations`).
- Interface en français et en anglais.

**Responsive** ✅ (adaptation 💡)
- Ordinateur 1440 px (maquettes), tablette 768 px et téléphone 390 px.
- Sous 768 px, la barre latérale devient un menu ; les écrans mobiles M01 à M08 servent de référence.

**Fonctionnement** 💡
- Le jeton de session est gardé dans un cookie HttpOnly par le serveur SvelteKit.
- Après « Passer en Pro », l'abonnement est vérifié toutes les 2 s jusqu'au passage en Pro.

**Qualité** ✅ (outils et seuils 💡)
- Tests unitaires : Vitest.
- Tests e2e : Playwright, scénario A / B en 1440, 768 et 390 px.
- Couverture : seuil 80 % en CI.
- Sécurité : npm audit, Semgrep, OWASP ZAP, en-têtes CSP.

## v0.2.0 · Comptes complets et vrai paiement en test 💡

- Mot de passe oublié ; paramètres du profil et de l'organisation.
- Paiement Stripe en mode test.
- Accessibilité vérifiée (niveau AA).

## v0.3.0 · Guidage et confort 💡

- Liste « premiers pas » pour guider un nouvel utilisateur.
- Centre de notifications ; recherche globale.
- Mode sombre.

## v1.0.0 · Kit personnalisable 💡

- Couleurs et logo du client modifiables à un seul endroit.
- Composants documentés et réutilisables.
