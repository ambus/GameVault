## GameVault – Angular 21 + SSR + PWA + PrimeNG + Firebase Auth

Projekt to szkielet aplikacji GameVault:

- Angular 21 (standalone, Signals, SSR + hydration)
- PWA z `@angular/service-worker` i `ngsw-config.json`
- PrimeNG + @primeuix/themes (layout: top nav + sidebar + content)
- Firebase Authentication (Email/Password)
- Kontrola dostępu - tylko zalogowani użytkownicy
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

## Konfiguracja Firebase Authentication

Aplikacja wymaga skonfigurowania Firebase Authentication. Poniżej znajduje się krok po kroku instrukcja konfiguracji.

### Krok 1: Utworzenie projektu Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij **"Dodaj projekt"** (lub **"Add project"**)
3. Wprowadź nazwę projektu (np. `game-vault`)
4. Opcjonalnie włącz Google Analytics (możesz pominąć)
5. Kliknij **"Utwórz projekt"** (lub **"Create project"**)
6. Poczekaj na utworzenie projektu

### Krok 2: Dodanie aplikacji webowej

1. W Firebase Console wybierz utworzony projekt
2. Kliknij ikonę **Web** (`</>`) lub **"Add app"** → **"Web"**
3. Wprowadź nazwę aplikacji (np. `GameVault Web`)
4. Opcjonalnie zaznacz **"Also set up Firebase Hosting"** (możesz pominąć na tym etapie)
5. Kliknij **"Zarejestruj aplikację"** (lub **"Register app"**)

### Krok 3: Pobranie konfiguracji Firebase

1. Po zarejestrowaniu aplikacji zobaczysz ekran z konfiguracją Firebase
2. Skopiuj obiekt konfiguracji, który wygląda mniej więcej tak:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Krok 4: Włączenie Authentication

1. W Firebase Console przejdź do **Authentication** (w menu po lewej stronie)
2. Kliknij **"Get started"** (jeśli to pierwszy raz)
3. Przejdź do zakładki **"Sign-in method"**
4. Kliknij **"Email/Password"**
5. Włącz przełącznik **"Enable"**
6. Opcjonalnie możesz włączyć **"Email link (passwordless sign-in)"**
7. Kliknij **"Save"**

### Krok 5: Konfiguracja w projekcie Angular

1. Otwórz plik `src/environments/environment.ts`
2. Zastąp wartości w obiekcie `firebase` skopiowanymi danymi z Firebase Console:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSy...', // z Firebase Console
    authDomain: 'your-project.firebaseapp.com', // z Firebase Console
    projectId: 'your-project-id', // z Firebase Console
    storageBucket: 'your-project.appspot.com', // z Firebase Console
    messagingSenderId: '123456789', // z Firebase Console
    appId: '1:123456789:web:abcdef' // z Firebase Console
  }
};
```

3. Otwórz plik `src/environments/environment.prod.ts`
4. Wprowadź te same wartości (lub inne dla środowiska produkcyjnego, jeśli masz osobny projekt Firebase)

### Krok 6: Instalacja zależności

Zainstaluj wymagane pakiety (jeśli jeszcze nie są zainstalowane):

```bash
npm install
```

### Krok 7: Utworzenie użytkownika testowego

1. W Firebase Console przejdź do **Authentication** → **Users**
2. Kliknij **"Add user"** (lub **"Dodaj użytkownika"**)
3. Wprowadź adres email (np. `test@example.com`)
4. Wprowadź hasło (minimum 6 znaków)
5. Kliknij **"Add user"**

Alternatywnie możesz utworzyć użytkownika przez formularz logowania w aplikacji (jeśli włączysz rejestrację).

### Krok 8: Testowanie

1. Uruchom aplikację:

```bash
npm run start
```

2. Przejdź do `http://localhost:4200`
3. Powinieneś zostać przekierowany do ekranu logowania (`/login`)
4. Zaloguj się używając utworzonego użytkownika testowego
5. Po zalogowaniu powinieneś zobaczyć główną aplikację

### Rozwiązywanie problemów

**Problem: "Firebase: Error (auth/invalid-api-key)"**
- Sprawdź, czy `apiKey` w `environment.ts` jest poprawne
- Upewnij się, że skopiowałeś wszystkie wartości z Firebase Console

**Problem: "Firebase: Error (auth/unauthorized-domain)"**
- W Firebase Console przejdź do **Authentication** → **Settings** → **Authorized domains**
- Dodaj domenę, na której testujesz (np. `localhost` dla developmentu)

**Problem: Aplikacja nie przekierowuje do logowania**
- Sprawdź, czy guard `authGuard` jest poprawnie dodany do routingu
- Sprawdź konsolę przeglądarki pod kątem błędów

**Problem: "Module not found: @angular/fire"**
- Uruchom `npm install` ponownie
- Sprawdź, czy `@angular/fire` jest w `package.json`

### Dodatkowe ustawienia (opcjonalne)

#### Włączenie innych metod logowania

W Firebase Console możesz włączyć:
- **Google Sign-In**: Authentication → Sign-in method → Google → Enable
- **GitHub**: Authentication → Sign-in method → GitHub → Enable
- Inne metody zgodnie z potrzebami

#### Konfiguracja domen autoryzowanych

1. W Firebase Console: **Authentication** → **Settings** → **Authorized domains**
2. Domyślnie są dodane: `localhost` i domena projektu
3. Dodaj dodatkowe domeny, jeśli potrzebujesz (np. domena produkcyjna)

#### Reguły bezpieczeństwa (Firestore, jeśli używasz)

Jeśli w przyszłości będziesz używać Firestore, pamiętaj o skonfigurowaniu reguł bezpieczeństwa w **Firestore Database** → **Rules**.

