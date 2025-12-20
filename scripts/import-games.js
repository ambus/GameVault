#!/usr/bin/env node

/**
 * Skrypt do automatycznego wgrywania gier z plików markdown do Firebase Firestore
 * 
 * Użycie:
 *   node scripts/import-games.js
 * 
 * Wymagania:
 *   - Zainstalowane pakiety: firebase-admin, js-yaml, gray-matter
 *   - Plik z konfiguracją Firebase: scripts/firebase-config.json (opcjonalnie)
 *   - Lub zmienne środowiskowe z konfiguracją Firebase
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const admin = require('firebase-admin');

// Konfiguracja mapowania wartości
const VERSION_MAP = {
  'Pudełko - kartridż': 'box_cartridge',
  'Pudełko - kod': 'box_code',
  'Cyfrowa': 'digital',
  'Pudełko płyta': 'box_disc',
  'Pudełko kartridź': 'box_cartridge'
};

const STATUS_MAP = {
  'Lista życzeń': 'wishlist',
  'Zamówiony Preorder': 'preordered',
  'Gotowa do grania': 'ready_to_play',
  'W trakcie': 'in_progress',
  'Ukończona': 'completed',
  'Wstrzymana': 'on_hold',
  'Nie ukończona': 'not_completed'
};

const PLATFORM_MAP = {
  'NS': 'Nintendo Switch',
  'NS2': 'Nintendo Switch 2',
  'PC': 'PC',
  'Mac': 'Mac'
};

// Inicjalizacja Firebase Admin
function initializeFirebase() {
  // Sprawdź czy Firebase jest już zainicjalizowany
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const fsSync = require('fs');
  let serviceAccount = null;
  let authMethod = '';

  // 1. Sprawdź zmienną środowiskową GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (fsSync.existsSync(credPath)) {
      try {
        serviceAccount = require(credPath);
        authMethod = 'GOOGLE_APPLICATION_CREDENTIALS';
        console.log(`✅ Używam poświadczeń z: ${credPath}`);
      } catch (error) {
        console.warn(`⚠️  Nie można załadować pliku z GOOGLE_APPLICATION_CREDENTIALS: ${error.message}`);
      }
    }
  }

  // 2. Sprawdź plik firebase-config.json w katalogu scripts
  if (!serviceAccount) {
    const configPath = path.join(__dirname, 'firebase-config.json');
    if (fsSync.existsSync(configPath)) {
      try {
        serviceAccount = require(configPath);
        authMethod = 'firebase-config.json';
        console.log('✅ Używam konfiguracji z pliku firebase-config.json');
      } catch (error) {
        console.warn(`⚠️  Nie można załadować pliku firebase-config.json: ${error.message}`);
      }
    }
  }

  // 3. Spróbuj użyć Application Default Credentials
  if (!serviceAccount) {
    try {
      admin.initializeApp({
        projectId: 'game-vault-66ad9'
      });
      authMethod = 'Application Default Credentials';
      console.log('✅ Używam Application Default Credentials');
      return admin.app();
    } catch (error) {
      // Jeśli to nie zadziała, wyświetl szczegółowy komunikat błędu
      console.error('\n❌ Błąd uwierzytelniania Firebase Admin SDK!\n');
      console.error('Firebase Admin SDK wymaga jednej z następujących metod uwierzytelniania:\n');
      console.error('📋 OPCJA 1: Utwórz Service Account (zalecane)');
      console.error('   1. Przejdź do: https://console.firebase.google.com/project/game-vault-66ad9/settings/serviceaccounts/adminsdk');
      console.error('   2. Kliknij "Generate new private key"');
      console.error('   3. Zapisz plik jako: scripts/firebase-config.json\n');
      console.error('📋 OPCJA 2: Użyj gcloud CLI');
      console.error('   Uruchom: gcloud auth application-default login\n');
      console.error('📋 OPCJA 3: Ustaw zmienną środowiskową');
      console.error('   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"\n');
      console.error('Uwaga: `firebase login` nie wystarcza dla firebase-admin SDK.');
      console.error('Musisz użyć jednej z powyższych metod.\n');
      throw new Error('Could not initialize Firebase Admin SDK. Please configure authentication.');
    }
  }

  // Inicjalizacja z Service Account
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'game-vault-66ad9'
      });
      return admin.app();
    } catch (error) {
      console.error('\n❌ Błąd przy inicjalizacji Firebase z Service Account!');
      console.error('Sprawdź czy plik firebase-config.json zawiera poprawne dane.\n');
      throw error;
    }
  }
}

// Funkcja do parsowania pliku markdown
async function parseMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const parsed = matter(content);
  
  // Nazwa gry z nazwy pliku (bez rozszerzenia)
  const fileName = path.basename(filePath, '.md');
  
  return {
    fileName,
    frontmatter: parsed.data,
    content: parsed.content
  };
}

// Funkcja do mapowania danych z markdown na format Firebase
function mapGameData(fileName, frontmatter) {
  const game = {
    name: fileName
  };

  // Data utworzenia -> purchaseDate
  if (frontmatter['Data utworzenia']) {
    game.purchaseDate = frontmatter['Data utworzenia'];
  }

  // Platforma -> platform
  if (frontmatter.Platforma) {
    game.platform = PLATFORM_MAP[frontmatter.Platforma] || frontmatter.Platforma;
  }

  // Okładka -> coverImage
  if (frontmatter.Okładka) {
    game.coverImage = frontmatter.Okładka;
  }

  // Wersja -> version
  if (frontmatter.Wersja) {
    game.version = VERSION_MAP[frontmatter.Wersja] || frontmatter.Wersja;
  }

  // Status -> status
  if (frontmatter.Status) {
    game.status = STATUS_MAP[frontmatter.Status] || frontmatter.Status;
  }

  // Ocena -> rating
  if (frontmatter.Ocena) {
    const rating = parseInt(frontmatter.Ocena, 10);
    if (!isNaN(rating)) {
      game.rating = rating;
    }
  }

  // Data ukończenia -> completionDate
  if (frontmatter['Data ukończenia'] && frontmatter['Data ukończenia'].trim() !== '') {
    game.completionDate = frontmatter['Data ukończenia'];
  }

  // Tagi -> tags
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    game.tags = frontmatter.tags;
  }

  // Komentarz -> comment
  if (frontmatter.Komentarz && frontmatter.Komentarz.trim() !== '') {
    game.comment = frontmatter.Komentarz;
  }

  return game;
}

// Funkcja do czyszczenia danych przed zapisem do Firestore
function cleanDataForFirestore(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    // Pomijamy undefined i puste stringi
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Zachowujemy tablice
        cleaned[key] = value;
      } else if (typeof value === 'object') {
        // Rekurencyjnie czyścimy obiekty
        const cleanedValue = cleanDataForFirestore(value);
        if (Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

// Funkcja do wgrywania gry do Firestore
async function uploadGameToFirestore(db, gameData) {
  const gamesRef = db.collection('games');
  const cleanedData = cleanDataForFirestore(gameData);
  
  try {
    const docRef = await gamesRef.add(cleanedData);
    return { success: true, id: docRef.id, name: gameData.name };
  } catch (error) {
    return { success: false, error: error.message, name: gameData.name };
  }
}

// Funkcja sprawdzająca czy gra już istnieje (po nazwie)
async function gameExists(db, gameName) {
  const gamesRef = db.collection('games');
  const snapshot = await gamesRef.where('name', '==', gameName).get();
  return !snapshot.empty;
}

// Główna funkcja
async function main() {
  console.log('🚀 Rozpoczynam import gier do Firebase...\n');

  try {
    // Inicjalizacja Firebase
    initializeFirebase();
    const db = admin.firestore();

    // Ścieżka do katalogu z plikami markdown
    const tmpDir = path.join(__dirname, '..', 'tmp');
    
    // Sprawdź czy katalog istnieje
    const fsSync = require('fs');
    if (!fsSync.existsSync(tmpDir)) {
      console.error(`❌ Błąd: Katalog ${tmpDir} nie istnieje!`);
      process.exit(1);
    }

    // Pobierz wszystkie pliki .md
    const files = await fs.readdir(tmpDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    if (mdFiles.length === 0) {
      console.log('⚠️  Nie znaleziono plików .md w katalogu tmp/');
      process.exit(0);
    }

    console.log(`📁 Znaleziono ${mdFiles.length} plików do przetworzenia\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const results = [];

    // Przetwarzaj każdy plik
    for (const file of mdFiles) {
      const filePath = path.join(tmpDir, file);
      
      try {
        // Parsuj plik
        const { fileName, frontmatter } = await parseMarkdownFile(filePath);
        
        // Sprawdź czy gra już istnieje
        const exists = await gameExists(db, fileName);
        if (exists) {
          console.log(`⏭️  Pomijam: "${fileName}" (już istnieje w bazie)`);
          skipCount++;
          continue;
        }

        // Mapuj dane
        const gameData = mapGameData(fileName, frontmatter);

        // Wgraj do Firestore
        const result = await uploadGameToFirestore(db, gameData);
        
        if (result.success) {
          console.log(`✅ Wgrano: "${result.name}" (ID: ${result.id})`);
          successCount++;
        } else {
          console.log(`❌ Błąd przy wgrywaniu "${result.name}": ${result.error}`);
          errorCount++;
        }
        
        results.push(result);
      } catch (error) {
        console.error(`❌ Błąd przy przetwarzaniu "${file}":`, error.message);
        errorCount++;
      }
    }

    // Podsumowanie
    console.log('\n' + '='.repeat(50));
    console.log('📊 Podsumowanie:');
    console.log(`   ✅ Wgrano: ${successCount}`);
    console.log(`   ⏭️  Pominięto: ${skipCount}`);
    console.log(`   ❌ Błędy: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Krytyczny błąd:', error);
    process.exit(1);
  }
}

// Uruchom skrypt
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Nieoczekiwany błąd:', error);
    process.exit(1);
  });
}

module.exports = { main, parseMarkdownFile, mapGameData };

