## GameVault – Angular 21 + SSR + PWA + PrimeNG + Firebase Auth

## Aplikacja w 99% wygenerowana przez AI

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

## Konfiguracja Firestore Database

Aplikacja wykorzystuje Google Firestore Database do przechowywania danych o grach. Poniżej znajduje się krok po kroku instrukcja konfiguracji bazy danych.

### Krok 1: Utworzenie bazy danych Firestore

1. W Firebase Console przejdź do **Firestore Database** (w menu po lewej stronie)
2. Kliknij **"Create database"** (lub **"Utwórz bazę danych"**)
3. Wybierz tryb:
   - **Production mode** (tryb produkcyjny) - wymaga skonfigurowania reguł bezpieczeństwa
   - **Test mode** (tryb testowy) - dostęp otwarty na 30 dni (tylko do testów)
4. Wybierz lokalizację bazy danych (np. `europe-west` dla Europy)
5. Kliknij **"Enable"** (lub **"Włącz"**)

> **Uwaga:** Dla środowiska produkcyjnego zawsze używaj trybu produkcyjnego z odpowiednimi regułami bezpieczeństwa.

### Krok 2: Konfiguracja reguł bezpieczeństwa

1. W Firebase Console przejdź do **Firestore Database** → **Rules**
2. Dla środowiska deweloperskiego możesz użyć następujących reguł (tylko do testów):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tylko zalogowani użytkownicy mogą czytać i pisać
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Kliknij **"Publish"** (lub **"Opublikuj"**), aby zapisać reguły

> **Uwaga:** Powyższe reguły pozwalają każdemu zalogowanemu użytkownikowi na pełny dostęp do kolekcji `games`. W środowisku produkcyjnym rozważ bardziej szczegółowe reguły, np. ograniczenie dostępu tylko do własnych danych użytkownika.

### Krok 3: Utworzenie indeksów (opcjonalne)

Jeśli planujesz używać zaawansowanych zapytań (np. sortowanie po wielu polach), możesz potrzebować utworzyć indeksy:

1. W Firebase Console przejdź do **Firestore Database** → **Indexes**
2. Jeśli aplikacja wyświetli błąd o brakującym indeksie, kliknij link w komunikacie błędu
3. Firebase automatycznie utworzy indeks dla Ciebie

Dla podstawowej funkcjonalności (sortowanie po polu `name`) indeks nie jest wymagany.

### Krok 4: Struktura danych

Aplikacja przechowuje dane w kolekcji `games` z następującą strukturą:

- **Kolekcja:** `games`
- **Dokumenty:** Każdy dokument reprezentuje jedną grę
- **Pola:** Struktura jest elastyczna i może zawierać dowolne pola zdefiniowane w formularzu:
  - `name` (string) - nazwa gry
  - `genre` (string) - gatunek
  - `platform` (string) - platforma
  - `releaseDate` (string) - data wydania
  - `rating` (number) - ocena
  - `description` (string) - opis
  - Inne pola dodane dynamicznie przez formularz

### Krok 5: Testowanie połączenia

1. Uruchom aplikację:

```bash
npm run start
```

2. Zaloguj się do aplikacji
3. Przejdź do sekcji gier (`/games`)
4. Dodaj nową grę używając formularza
5. Sprawdź w Firebase Console → **Firestore Database** → **Data**, czy dokument został utworzony w kolekcji `games`

### Rozwiązywanie problemów

**Problem: "Missing or insufficient permissions"**
- Sprawdź, czy użytkownik jest zalogowany
- Sprawdź reguły bezpieczeństwa w Firebase Console → **Firestore Database** → **Rules**
- Upewnij się, że reguły pozwalają na operacje dla zalogowanych użytkowników

**Problem: "The query requires an index"**
- Kliknij link w komunikacie błędu, aby automatycznie utworzyć wymagany indeks
- Alternatywnie przejdź do **Firestore Database** → **Indexes** i utwórz indeks ręcznie

**Problem: Dane nie są zapisywane**
- Sprawdź konsolę przeglądarki pod kątem błędów
- Sprawdź, czy Firestore jest poprawnie skonfigurowane w `app.config.ts`
- Upewnij się, że użytkownik jest zalogowany

**Problem: "Firestore is not initialized"**
- Sprawdź, czy `provideFirestore()` jest dodane do `app.config.ts`
- Sprawdź, czy `@angular/fire` jest zainstalowane: `npm install @angular/fire`

### Reguły bezpieczeństwa dla środowiska produkcyjnego

Dla środowiska produkcyjnego rozważ bardziej szczegółowe reguły bezpieczeństwa:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Tylko zalogowani użytkownicy mogą czytać
      allow read: if request.auth != null;
      
      // Tylko zalogowani użytkownicy mogą tworzyć
      allow create: if request.auth != null 
                    && request.resource.data.keys().hasAll(['name', 'genre', 'platform']);
      
      // Tylko zalogowani użytkownicy mogą aktualizować
      allow update: if request.auth != null;
      
      // Tylko zalogowani użytkownicy mogą usuwać
      allow delete: if request.auth != null;
    }
  }
}
```

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

## Wdrożenie na Firebase (CI/CD)

Aplikacja jest skonfigurowana do automatycznego wdrażania na Firebase Hosting z obsługą SSR przez Cloud Functions.

### Konfiguracja GitHub Actions

Aby umożliwić automatyczne wdrażanie, musisz skonfigurować sekrety w GitHub. Masz dwie opcje:

#### Opcja 1: FIREBASE_SERVICE_ACCOUNT (Zalecane)

1. **Utwórz Service Account w Firebase:**
   - Przejdź do [Firebase Console](https://console.firebase.google.com/)
   - Wybierz projekt `game-vault-66ad9`
   - Kliknij ikonę ⚙️ (Settings) obok "Project Overview"
   - Przejdź do zakładki **Service Accounts**
   - Kliknij przycisk **Generate New Private Key**
   - W oknie dialogowym kliknij **Generate Key**
   - Plik JSON zostanie automatycznie pobrany (np. `game-vault-66ad9-xxxxx.json`)

2. **Dodaj sekret do GitHub:**
   - Przejdź do swojego repozytorium na GitHub
   - Kliknij **Settings** (na górze repozytorium)
   - W menu po lewej stronie kliknij **Secrets and variables** → **Actions**
   - Kliknij **New repository secret**
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Secret**: Otwórz pobrany plik JSON i skopiuj **całą jego zawartość** (od `{` do `}`)
   - Wklej całą zawartość JSON do pola "Secret"
   - Kliknij **Add secret**

#### Opcja 2: FIREBASE_TOKEN (Alternatywa)

1. **Zainstaluj Firebase CLI lokalnie:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Zaloguj się i uzyskaj token:**
   ```bash
   firebase login:ci
   ```
   - Otworzy się przeglądarka - zaloguj się do konta Google powiązanego z Firebase
   - Po zalogowaniu w terminalu pojawi się token (długi ciąg znaków)

3. **Dodaj sekret do GitHub:**
   - Przejdź do repozytorium na GitHub
   - **Settings** → **Secrets and variables** → **Actions**
   - Kliknij **New repository secret**
   - **Name**: `FIREBASE_TOKEN`
   - **Secret**: Wklej token skopiowany z terminala
   - Kliknij **Add secret**

#### Którą opcję wybrać?

- **FIREBASE_SERVICE_ACCOUNT** (Opcja 1) - Zalecana, bardziej bezpieczna, daje pełny dostęp do projektu
- **FIREBASE_TOKEN** (Opcja 2) - Prostsza, ale token wygasa po pewnym czasie i wymaga odnowienia

**Uwaga:** W pliku `.github/workflows/ci.yml` używamy `FIREBASE_TOKEN`. Jeśli wybierzesz Opcję 1, musisz zaktualizować workflow, aby używał `FIREBASE_SERVICE_ACCOUNT` zamiast tokenu.

### Struktura wdrożenia

- **Firebase Hosting**: Służy statyczne pliki z `dist/GameVault/browser`
- **Cloud Functions**: Obsługuje SSR dla wszystkich żądań
- **Automatyczne wdrożenie**: Przy każdym push do `main` branch

### Pliki konfiguracyjne

- `firebase.json` - Konfiguracja Firebase Hosting i Functions
- `.firebaserc` - ID projektu Firebase
- `functions/` - Cloud Function dla SSR
- `.github/workflows/ci.yml` - Pipeline CI/CD

### Ręczne wdrożenie

Jeśli chcesz wdrożyć ręcznie:

```bash
# Zbuduj aplikację
npm run build:production

# Zainstaluj zależności functions
cd functions
npm install

# Zbuduj functions
npm run build
cd ..

# Wdróż
firebase deploy
```

### Uwagi dotyczące SSR

- Cloud Function `ssr` obsługuje wszystkie żądania i renderuje aplikację Angular po stronie serwera
- Statyczne pliki (JS, CSS, obrazy) są serwowane bezpośrednio z Firebase Hosting
- Service Worker (PWA) działa w trybie offline dla statycznych zasobów

