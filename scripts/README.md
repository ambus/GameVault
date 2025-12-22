# Skrypty zarządzania grami

## Backup gier z Firebase

Skrypt `backup-games.js` tworzy kopię zapasową wszystkich gier z Firebase Firestore i zapisuje je do pliku JSON.

### Wymagania

1. **Zainstalowany pakiet:**
   ```bash
   npm install firebase-admin
   ```

2. **Konfiguracja Firebase:**
   
   ⚠️ **WAŻNE:** `firebase login` nie wystarcza dla `firebase-admin` SDK!
   
   Skrypt używa tej samej konfiguracji co `import-games.js`. Zobacz sekcję [Konfiguracja Firebase](#konfiguracja-firebase) poniżej.

### Użycie

```bash
npm run backup-games
```

lub bezpośrednio:

```bash
node scripts/backup-games.js
```

### Jak działa skrypt

1. **Łączy się z Firebase Firestore** używając Firebase Admin SDK
2. **Pobiera wszystkie gry** z kolekcji `games`
3. **Tworzy plik backupowy** w katalogu `scripts/backups/`
4. **Nazwa pliku zawiera datę i czas:** `backup-YYYY-MM-DD-HH-MM-SS.json`

### Format pliku backupowego

Plik JSON zawiera:
- **Metadata:**
  - `timestamp` - data i czas w formacie ISO
  - `date` - data i czas w formacie polskim
  - `totalGames` - liczba gier w backupie
  - `version` - wersja formatu backupu
- **Games:** tablica wszystkich gier z ich pełnymi danymi (włącznie z ID)

### Przykładowa struktura pliku

```json
{
  "metadata": {
    "timestamp": "2025-01-15T14:30:45.123Z",
    "date": "15.01.2025, 15:30:45",
    "totalGames": 42,
    "version": "1.0"
  },
  "games": [
    {
      "id": "abc123",
      "name": "Nazwa gry",
      "platform": "Nintendo Switch",
      ...
    },
    ...
  ]
}
```

### Lokalizacja backupów

Wszystkie backupowe pliki są zapisywane w:
```
scripts/backups/backup-YYYY-MM-DD-HH-MM-SS.json
```

Katalog `scripts/backups/` jest automatycznie tworzony przy pierwszym uruchomieniu i jest dodany do `.gitignore`.

### Bezpieczeństwo

⚠️ **UWAGA:** Pliki backupowe mogą zawierać wrażliwe dane. Katalog `scripts/backups/` jest dodany do `.gitignore` i nie będzie commitowany do repozytorium.

---

## Import gier z plików markdown do Firebase

Skrypt `import-games.js` automatycznie wgrywa gry z plików markdown znajdujących się w katalogu `tmp/` do Firebase Firestore.

### Wymagania

1. **Zainstalowane pakiety:**
   ```bash
   npm install firebase-admin gray-matter
   ```

2. **Konfiguracja Firebase:**
   
   <a name="konfiguracja-firebase"></a>
   
   ⚠️ **WAŻNE:** `firebase login` nie wystarcza dla `firebase-admin` SDK!
   
   Masz trzy opcje:
   
   **Opcja A: Service Account (zalecane i najprostsze)**
   
   Krok po kroku:
   
   1. **Otwórz Firebase Console:**
      - Przejdź do: https://console.firebase.google.com/project/game-vault-66ad9/settings/serviceaccounts/adminsdk
      - Lub: Firebase Console → Project Settings (⚙️) → Service Accounts
   
   2. **Wygeneruj klucz:**
      - Kliknij przycisk **"Generate new private key"** (lub **"Wygeneruj nowy klucz prywatny"**)
      - W oknie dialogowym kliknij **"Generate key"** (lub **"Wygeneruj klucz"**)
      - Plik JSON zostanie automatycznie pobrany
   
   3. **Zapisz plik:**
      - Przenieś pobrany plik do katalogu `scripts/` w projekcie
      - Zmień nazwę na `firebase-config.json`
      - Przykład: jeśli pobrany plik nazywa się `game-vault-66ad9-xxxxx.json`, 
        zmień nazwę na `firebase-config.json` i przenieś do `scripts/firebase-config.json`
   
   4. **Gotowe!** Skrypt automatycznie użyje tego pliku.
   
   ⚠️ **Bezpieczeństwo:** Plik zawiera wrażliwe dane. **NIE** commituj go do Git!
   (Już dodany do `.gitignore`)
   
   **Opcja B: gcloud CLI**
   ```bash
   # Zainstaluj gcloud CLI jeśli nie masz
   # macOS: brew install google-cloud-sdk
   # Następnie:
   gcloud auth application-default login
   ```
   
   **Opcja C: Zmienna środowiskowa**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

### Użycie

```bash
node scripts/import-games.js
```

### Jak działa skrypt

1. **Czyta pliki markdown** z katalogu `tmp/`
2. **Parsuje frontmatter YAML** z każdego pliku
3. **Mapuje pola** z polskich nazw na format używany w aplikacji:
   - Nazwa pliku → `name`
   - `Data utworzenia` → `purchaseDate`
   - `Platforma` → `platform` (mapuje "NS" → "Nintendo Switch")
   - `Okładka` → `coverImage`
   - `Wersja` → `version` (mapuje wartości polskie na angielskie)
   - `Status` → `status` (mapuje wartości polskie na angielskie)
   - `Ocena` → `rating`
   - `Data ukończenia` → `completionDate`
   - `tags` → `tags`
   - `Komentarz` → `comment`
4. **Sprawdza duplikaty** - pomija gry które już istnieją w bazie (po nazwie)
5. **Wgrywa do Firestore** w kolekcji `games`

### Mapowanie wartości

**Wersja:**
- `Pudełko - kartridż` → `box_cartridge`
- `Pudełko - kod` → `box_code`
- `Cyfrowa` → `digital`
- `Pudełko płyta` → `box_disc`

**Status:**
- `Lista życzeń` → `wishlist`
- `Zamówiony Preorder` → `preordered`
- `Gotowa do grania` → `ready_to_play`
- `W trakcie` → `in_progress`
- `Ukończona` → `completed`
- `Wstrzymana` → `on_hold`
- `Nie ukończona` → `not_completed`

**Platforma:**
- `NS` → `Nintendo Switch`
- `NS2` → `Nintendo Switch 2`

### Przykładowy plik markdown

```markdown
---
Data utworzenia: 2025-11-01
Platforma: NS
Okładka: https://example.com/cover.jpg
Wersja: Cyfrowa
Status: Ukończona
Ocena: 5
Data ukończenia: 2025-11-06
tags:
  - Gra
  - CoOp
  - roguelike
Komentarz: Fajna gierka...
---
```

### Bezpieczeństwo

⚠️ **UWAGA:** Plik `firebase-config.json` zawiera wrażliwe dane. **NIE** commituj go do repozytorium!

Dodaj do `.gitignore`:
```
scripts/firebase-config.json
```

### Rozwiązywanie problemów

**Błąd: "Could not load the default credentials"**
- ⚠️ `firebase login` **nie wystarcza** dla `firebase-admin` SDK!
- Użyj jednej z trzech opcji opisanych powyżej (Service Account jest najprostsze)
- Najszybsze rozwiązanie: utwórz Service Account w Firebase Console i zapisz jako `scripts/firebase-config.json`

**Błąd: "Firebase Admin SDK initialization failed"**
- Sprawdź czy plik `scripts/firebase-config.json` istnieje i zawiera poprawne dane
- Upewnij się, że plik jest w formacie JSON i nie zawiera błędów składniowych
- Sprawdź czy Service Account ma odpowiednie uprawnienia w Google Cloud Console

**Błąd: "Permission denied"**
- Sprawdź reguły bezpieczeństwa Firestore w Firebase Console
- Upewnij się, że masz uprawnienia do zapisu w kolekcji `games`

**Błąd: "Module not found"**
- Zainstaluj brakujące pakiety: `npm install firebase-admin gray-matter js-yaml`

