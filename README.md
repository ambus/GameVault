## GameVault – Angular 21 + SSR + PWA + PrimeNG

Projekt to szkielet aplikacji GameVault:

- Angular 21 (standalone, Signals, SSR + hydration)
- PWA z `@angular/service-worker` i `ngsw-config.json`
- PrimeNG + @primeuix/themes (layout: top nav + sidebar + content)
- Architektura feature-based (`features/games`, `features/shared`)
- Dynamiczne formularze generowane z JSON-schema (`fields` array)
- Podstawowe testy (unit + e2e, szkic pod Cypress)
- ESLint, Husky pre-commit, przykładowy pipeline CI (GitHub Actions)

### Uruchomienie dev (SSR + hydration)

```bash
npm install
npm run start
```

Domyślnie Angular dev-server działa na `http://localhost:4200/` z włączonym SSR/hydration.

### Build produkcyjny (SSR + PWA)

```bash
npm run build:ssr
```

Artefakty trafią do `dist/GameVault/` (browser + server). Service Worker (`ngsw-worker.js`) jest włączony w konfiguracji produkcyjnej (`serviceWorker: true`, `ngsw-config.json`).

### Testy

Unit tests (Vitest przez Angular CLI):

```bash
npm test
```

Przykładowy test: `src/app/features/games/games.store.spec.ts`.

End-to-end (przykład Cypress – wymaga ręcznej instalacji `cypress`):

```bash
# instalacja (jeśli jeszcze nie)
npm install --save-dev cypress

# uruchomienie testów (po starcie aplikacji)
npx cypress open
```

Przykładowy scenariusz: `cypress/e2e/games.cy.ts` (dodawanie i wyszukiwanie gry).

### Lint / formatowanie / pre-commit

- Konfiguracja ESLint: `.eslintrc.cjs`
- Skrypt:

```bash
npm run lint
```

- Husky pre-commit (`.husky/pre-commit`) uruchamia:
  - `npm run lint`
  - `npm test`
  - `npm run build:ssr`

> Aby włączyć Husky:
>
> ```bash
> npx husky install
> ```

### CI (GitHub Actions)

Plik `.github/workflows/ci.yml` wykonuje:

1. `npm ci`
2. `npm run lint`
3. `npm test -- --watch=false`
4. `npm run build:ssr`
5. Lighthouse PWA audit (`lhci autorun`)

### Deploy na Firebase (SSR + PWA) – skrót

1. Zainstaluj CLI:

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Zainicjalizuj projekt:

   ```bash
   firebase init hosting functions
   ```

   - `public`: ustaw na `dist/GameVault/browser`
   - Włącz `Configure as a single-page app` (rewrite na `index.html` lub proxy do funkcji SSR)
   - Functions: TypeScript, Node 20

3. Zbuduj aplikację:

   ```bash
   npm run build:ssr
   ```

4. W funkcji Cloud Functions zaimportuj serwer SSR z `dist/GameVault/server` i wystaw jako `https` function (proxy do Express/AngularNodeAppEngine).

5. Deploy:

   ```bash
   firebase deploy --only hosting,functions
   ```

6. Sprawdź PWA w Chrome DevTools (Application → Service Workers) oraz w Lighthouse (zakładka Lighthouse).

