# ARCHITECTURE TECHNIQUE & GUIDE D'INTÉGRATION - GIE LAWTAN FRONTEND

> **Périmètre du développeur :**
> - **Pôle 2 :** « Ferme LAWTAN et produits laitiers »
> - **Page Contact :** « Contact et demande de devis »
> 
> **Objectif du document :** Décrire l'existant technique exact du dépôt Git, définir la stratégie d'intégration non-destructive, identifier les manques et prévenir tout conflit de fusion (merge conflicts) avec le binôme.

---

## 1. Stack Technique Réelle

L'inspection de `package.json`, `angular.json` et de la configuration TypeScript révèle la stack exacte suivante :

| Domaine | Technologie / Configuration | Détails d'implémentation |
| :--- | :--- | :--- |
| **Framework** | **Angular 19.2.0** (`@angular/core: ^19.2.0`) | Version majeure moderne d'Angular (sortie début 2025). |
| **Paradigme** | **100% Standalone Components** | Aucun `NgModule` (`AppModule` inexistant). Les composants déclarent leurs dépendances directement via la propriété `imports: [...]` du décorateur `@Component`. En v19, le flag `standalone: true` est même implicite par défaut. |
| **Réactivité** | **RxJS 7.8 + Zone.js 0.15** *(Signals disponibles)* | Le socle est configuré avec `zone.js` (`provideZoneChangeDetection({ eventCoalescing: true })`). Les **Signals Angular** (`signal()`, `computed()`, `input()`, `output()`) sont nativement disponibles et recommandés pour les composants locaux sans casser la détection de changement globale. |
| **Rendu / SSR** | **SPA Pure (Client-Side Rendering)** | **Pas de SSR** (`@angular/ssr` absent, pas de `server.ts`). Le builder configuré dans `angular.json` est `@angular-devkit/build-angular:application` en mode navigateur seul (`browser: "src/main.ts"`). |
| **Moteur de Build** | **esbuild + Vite** | Inclus nativement via le builder `application` d'Angular 19. |
| **Styles** | **CSS Standard (Vanilla CSS)** | Pas de SCSS, pas de SASS, pas de Tailwind CSS installé. Fichier global configuré : `src/styles.css`. Fichiers composants : `*.css`. |
| **Linting** | **AUCUN linter configuré** | Ni ESLint (`@angular-eslint`), ni Prettier ne sont installés ou configurés dans `package.json`. |
| **Tests Unitaires** | **Karma + Jasmine** | `karma: ~6.4.0`, `jasmine-core: ~5.6.0`, `karma-chrome-launcher`, `karma-jasmine-html-reporter`. Fichiers `*.spec.ts`. |
| **Dépendances** | Non installées localement | `node_modules` est absent du dépôt ; un `npm install` initial est requis avant toute commande. |

---

## 2. Structure Actuelle et Emplacement des Features

### 2.1 État actuel du dossier `src/app`
Le dépôt a reçu le commit `a0635a7 architecture app/` de votre binôme qui a initié l'arborescence `features/client/` avec un premier composant `accueil` :

```text
LawtanFront/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   └── client/
│   │   │       └── accueil/            # Créé par le binôme (AccueilComponent)
│   │   │           ├── accueil.component.css
│   │   │           ├── accueil.component.html
│   │   │           ├── accueil.component.spec.ts
│   │   │           └── accueil.component.ts
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

### 2.2 Recommandation d'arborescence pour isoler mon périmètre
Puisque votre binôme a opté pour un sous-dossier `features/client/`, nous nous alignons parfaitement pour respecter la même convention et éviter toute divergence structurelle :

```text
src/app/
├── features/
│   └── client/
│       ├── accueil/                               # [BINÔME] Page d'accueil
│       ├── pole-ferme/                            # [MON PÉRIMÈTRE - PÔLE 2]
│       │   ├── components/                        # Sous-composants (product-card, etc.)
│       │   ├── models/                            # Types (dairy-product.model.ts)
│       │   ├── services/                          # Services (dairy.service.ts)
│       │   ├── pole-ferme.component.ts|html|css
│       │   └── pole-ferme.routes.ts
│       │
│       └── contact/                               # [MON PÉRIMÈTRE - CONTACT & DEVIS]
│           ├── components/                        # Sous-composants (contact-form, quote-form)
│           ├── models/                            # Types (contact-request.model.ts)
│           ├── services/                          # Services (contact.service.ts)
│           ├── contact.component.ts|html|css
│           └── contact.routes.ts
│
├── core/                                          # (Socle technique partagé - à concerter)
│   └── services/
│
└── shared/                                        # (Composants graphiques transverses - à concerter)
    ├── components/
    │   ├── header/
    │   ├── footer/
    │   └── button/
    └── models/
```

---

## 3. Composants Partagés Déjà Disponibles

> **Constat critique : AUCUN composant partagé n'est disponible dans le dépôt.**

- **Header / Navigation :** Inexistant.
- **Footer :** Inexistant.
- **Boutons génériques :** Inexistants.
- **Champs de formulaire partagés :** Inexistants.
- **Layout wrapper :** Inexistant.
- **Page d'accueil :** Le template `app.component.html` contient actuellement 337 lignes de code SVG de démonstration généré par le CLI Angular avec un `<router-outlet />` relégué à la dernière ligne.

### Plan d'action pour réutiliser ou créer sans casser :
1. **Ne pas modifier `app.component.html` unilatéralement** : Si le binôme travaille également sur la coquille globale (Header/Footer), modifier ce fichier en parallèle causera un conflit Git direct.
2. **Créer nos composants de feature de façon autonome** : Développer les pages Pôle 2 et Contact avec des composants internes propres, avec une disposition prête à s'insérer sous le futur Header et au-dessus du futur Footer.
3. **Proposer une concertation préalable** sur la création d'un dossier `shared/components/` contenant au minimum `HeaderComponent` et `FooterComponent` que l'un des deux intègre proprement dans `app.component.html`.

---

## 4. Routing et Lazy Loading

### 4.1 Déclaration actuelle
Le fichier [app.routes.ts](file:///d:/AntiGravity/lawtangit/lawtan/LawtanFront/src/app/app.routes.ts) est actuellement vide :
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [];
```

### 4.2 Convention d'enregistrement pour nos deux features
Conformément aux standards Angular 19 et pour garantir des performances optimales (budgets de build stricts définis dans `angular.json` : max 500kB warning / 1MB error), toutes les pages doivent être chargées en **Lazy Loading**.

#### Dans chaque feature (isolation maximale) :
- `pole-ferme.routes.ts` :
  ```typescript
  import { Routes } from '@angular/router';

  export const POLE_FERME_ROUTES: Routes = [
    {
      path: '',
      loadComponent: () => import('./pole-ferme.component').then(m => m.PoleFermeComponent)
    }
  ];
  ```
- `contact.routes.ts` :
  ```typescript
  import { Routes } from '@angular/router';

  export const CONTACT_ROUTES: Routes = [
    {
      path: '',
      loadComponent: () => import('./contact.component').then(m => m.ContactComponent)
    }
  ];
  ```

#### Dans `app.routes.ts` (enregistrement centralisé minimal) :
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Routes du Pôle 2
  {
    path: 'ferme-produits-laitiers',
    loadChildren: () => import('./features/pole-ferme/pole-ferme.routes').then(m => m.POLE_FERME_ROUTES)
  },
  // Route Contact et Devis
  {
    path: 'contact',
    loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
  }
];
```
*Cette approche évite d'importer directement les composants dans `app.routes.ts` et permet d'ajouter ultérieurement des sous-pages au Pôle 2 sans toucher au fichier de routing principal.*

---

## 5. Conventions de Style, Nommage et Design Tokens

### 5.1 Nommage des fichiers et symboles
- **Fichiers :** Kebab-case strict avec suffixe de rôle Angular CLI :
  - `pole-ferme.component.ts`, `pole-ferme.component.html`, `pole-ferme.component.css`
  - `contact.service.ts`
  - `dairy-product.model.ts`
- **Classes TypeScript :** UpperCamelCase (`PoleFermeComponent`, `ContactService`, `DairyProduct`).
- **Sélecteurs de composants :** Préfixe `app-` en kebab-case (`app-pole-ferme`, `app-contact-form`).

### 5.2 Système de Style et Tokens existants
- **Format :** Pur **CSS** (`.css`). Pas de préprocesseur SCSS configuré dans `angular.json`.
- **Fichier global :** `src/styles.css` est actuellement vide.
- **Design Tokens :** Aucun token de marque n'est encore défini. `app.component.html` contient des variables de test temporaires (rose, violet) qui ne correspondent pas à la charte LAWTAN.

### 5.3 Proposition de Variables CSS pour la charte LAWTAN (à placer dans `src/styles.css`)
Pour éviter que les deux développeurs utilisent des teintes divergentes pour le vert agricole, le blanc laiterie et la typographie, il conviendra d'ajouter dans `styles.css` les variables CSS standardisées issues de la thématique agro-pastorale LAWTAN :

```css
:root {
  /* Couleurs institutionnelles LAWTAN */
  --lawtan-primary-green: #1b5e20;       /* Vert agricole profond (nature, terroir) */
  --lawtan-primary-green-light: #2e7d32;
  --lawtan-accent-gold: #c69214;          /* Or / paille / riz paddy */
  --lawtan-accent-dairy: #f8fafc;         /* Blanc cassé laiterie / crème */
  --lawtan-text-dark: #1e293b;            /* Texte principal */
  --lawtan-text-muted: #64748b;           /* Sous-titres et métadonnées */
  --lawtan-bg-light: #f1f5f9;
  --lawtan-border: #e2e8f0;
  --lawtan-danger: #dc2626;
  --lawtan-success: #16a34a;

  /* Typographie */
  --font-family-base: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  
  /* Rayons et ombres */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}
```

---

## 6. Gestion des Données, Formulaires et HTTP

### 6.1 État de la communication HTTP
- **Incohérence majeure :** `provideHttpClient()` **N'EST PAS ENREGISTRÉ** dans [app.config.ts](file:///d:/AntiGravity/lawtangit/lawtan/LawtanFront/src/app/app.config.ts).
- Tout appel à un service utilisant `HttpClient` échouera au runtime (`NullInjectorError: No provider for HttpClient!`).
- **Action requise :** Ajouter `provideHttpClient(withFetch())` dans `app.config.ts` :
  ```typescript
  import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
  import { provideRouter } from '@angular/router';
  import { provideHttpClient, withFetch } from '@angular/common/http';
  import { routes } from './app.routes';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient(withFetch())
    ]
  };
  ```

### 6.2 Gestion des formulaires
- `@angular/forms: ^19.2.0` est présent dans les dépendances.
- Pour la page **Contact et demande de devis** (formulaire à plusieurs champs : nom, structure, téléphone/email, type de demande, sélection des produits laitiers ou prestations, message), il faut utiliser les **Reactive Forms** (`ReactiveFormsModule`).
- Les composants importeront directement `ReactiveFormsModule` dans leur tableau `imports: [CommonModule, ReactiveFormsModule]`.
- Implémentation via `FormGroup`, `FormControl` et `Validators` (champs requis, validation email et téléphone conforme Sénégal/international).

### 6.3 Gestion des données (Pôle 2 et Contact)
Puisque le backend/API n'est pas encore branché, la gestion des données pour le Pôle 2 doit s'appuyer sur des **services avec données typées (mocks)** :
- Un modèle `DairyProduct` (id, nom, description, format/conditionnement, statut de disponibilité, allégation bio ou démarche hygiène, image).
- Un service `DairyService` fournissant des méthodes réactives (`getProducts(): Observable<DairyProduct[]>` ou signaux `products = signal<DairyProduct[]>([...])`).
- Un service `ContactService` simulant l'envoi de la demande (`submitContact(data: ContactRequest): Observable<{ success: boolean }>`).

---

## 7. Commandes Disponibles

Les scripts définis dans [package.json](file:///d:/AntiGravity/lawtangit/lawtan/LawtanFront/package.json) sont :

| Commande | Exécution interne | Description |
| :--- | :--- | :--- |
| `npm start` | `ng serve` | Lance le serveur de développement local sur `http://localhost:4200/`. |
| `npm run build` | `ng build` | Compile l'application en mode production dans `dist/lawtan-front/browser`. |
| `npm run watch` | `ng build --watch --configuration development` | Compilation incrémentale en direct lors des modifications. |
| `npm test` | `ng test` | Exécute les tests unitaires avec Karma et Jasmine (requiert un navigateur Chrome). |
| `npm run lint` | *Non disponible* | **Aucune commande de lint** n'est configurée dans le projet. |

> **Note d'installation :** Le dossier `node_modules` n'étant pas versionné, exécuter préalablement dans le terminal :
> ```bash
> cd LawtanFront
> npm install
> ```

---

## 8. Synthèse des Incohérences, Manques et Risques de Conflit Git

| Élément | Constat dans le code existant | Risque / Conflit avec le binôme | Solution adoptée |
| :--- | :--- | :--- | :--- |
| **`app.component.html`** | Contient le template d'accueil de démo Angular CLI (337 lignes) | Conflit critique si les deux développeurs tentent de poser la structure globale de navigation ou d'écraser la maquette. | Ne pas toucher au composant racine tant que le Header/Footer n'a pas été convenu. Se concentrer sur ses propres composants de pages routées. |
| **`app.routes.ts`** | Fichier unique avec tableau `routes: Routes = []` vide | Conflit Git direct lors des fusions si chacun modifie le même tableau. | Utiliser des sous-fichiers de routes dédiés (`pole-ferme.routes.ts`, `contact.routes.ts`) et déléguer via `loadChildren`. |
| **`app.config.ts`** | `provideHttpClient` n'est pas configuré | Tout appel API lèvera une exception `NullInjectorError`. | Ajouter `provideHttpClient(withFetch())` de manière concertée une seule fois. |
| **Styles globaux & Charte** | `styles.css` est vide, aucun token, aucun composant de bouton ou typographie commune | Hétérogénéité visuelle flagrante entre les pages Pôle 1 et Pôle 2 (polices différentes, palettes discordantes). | Définir un ensemble minimal de variables CSS documentées dans `styles.css` partagées dès le départ. |
| **Header / Footer** | Absents | Risque que chacun recrée un faux header ou footer dans sa propre page. | Développer les pages Pôle 2 et Contact comme du contenu autonome de section (sans dupliquer de barre de menu globale dans la feature). |
| **Linter / Formatage** | Aucun outil (ni ESLint, ni Prettier) | Risque de conflits de formatage intempestifs lors des `git diff` / `git merge`. | Respecter strictement la configuration `.editorconfig` déjà présente à la racine de `LawtanFront`. |

---

## 9. Synthèse Fonctionnelle Spécifique à mon Périmètre (Cahier des charges)

### Page Pôle 2 : « Ferme LAWTAN et produits laitiers » (Section 5.4 du CdC)
- **Présentation de la ferme :** Élevage bovin, alimentation saine, suivi vétérinaire, bien-être animal.
- **Produits phares :**
  - Lait pasteurisé / frais.
  - Lait caillé traditionnel (très demandé sur le marché local).
  - Mention des projets en développement : yaourts et fromages (marqués « Prochainement disponible »).
- **Règles d'allégations :** Respect strict des mentions (ne pas qualifier de « Bio certifié » sans validation juridique, mais valoriser « 100% naturel, sans additifs »).
- **Hygiène & Traçabilité :** Bloc de réassurance sur les conditions de traite, de chaîne du froid et d'emballage.
- **Call-to-Action :** Bouton vers la prise de commande grossiste / distributeur (redirigeant vers la page Contact & Devis).

### Page « Contact et demande de devis » (Section 5.7 du CdC)
- **Coordonnées institutionnelles :** Adresse du siège/ferme, téléphone, WhatsApp commercial, email.
- **Formulaire multi-usage :**
  - Type de demande : Renseignement général / Commande produits laitiers / Devis prestation agricole mécanisée.
  - Champs : Nom, Entreprise/Organisme, Téléphone, Email, Localité, Message.
  - En cas de sélection « Prestation agricole » : champs conditionnels (type de service : labour, moisson, etc., superficie en hectares ou heures souhaitées).
- **Feedback utilisateur :** État de chargement lors de la soumission, confirmation visuelle de succès, récapitulatif des données saisies.
