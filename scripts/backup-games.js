#!/usr/bin/env node

/**
 * Skrypt do tworzenia kopii zapasowej wszystkich gier z Firebase Firestore
 * 
 * Użycie:
 *   node scripts/backup-games.js
 * 
 * Wymagania:
 *   - Zainstalowany pakiet: firebase-admin
 *   - Plik z konfiguracją Firebase: scripts/firebase-config.json (opcjonalnie)
 *   - Lub zmienne środowiskowe z konfiguracją Firebase
 *   - Lub Application Default Credentials (gcloud auth application-default login)
 * 
 * Plik backupowy zostanie zapisany w katalogu scripts/backups/
 * z nazwą zawierającą datę i czas: backup-YYYY-MM-DD-HH-MM-SS.json
 */

const fs = require('fs').promises;
const path = require('path');
const admin = require('firebase-admin');

// Inicjalizacja Firebase Admin
function initializeFirebase() {
  // Sprawdź czy Firebase jest już zainicjalizowany
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const configPath = path.join(__dirname, 'firebase-config.json');
  let serviceAccount;

  if (serviceAccountPath && require('fs').existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('✅ Używam poświadczeń z GOOGLE_APPLICATION_CREDENTIALS');
  } else if (require('fs').existsSync(configPath)) {
    serviceAccount = require(configPath);
    console.log('✅ Używam konfiguracji z pliku firebase-config.json');
  } else {
    console.log('ℹ️  Nie znaleziono pliku firebase-config.json ani zmiennej GOOGLE_APPLICATION_CREDENTIALS.');
    console.log('ℹ️  Próbuję użyć Application Default Credentials (wymaga `gcloud auth application-default login` lub środowiska Firebase)...');
  }

  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        projectId: 'game-vault-66ad9' // Użyj projectId z environment.ts
      });
    }
    console.log('✅ Firebase Admin SDK zainicjalizowany pomyślnie.\n');
  } catch (error) {
    console.error('❌ Błąd inicjalizacji Firebase Admin SDK:', error.message);
    console.error('Upewnij się, że masz poprawnie skonfigurowane poświadczenia Firebase.');
    console.error('Więcej informacji: https://firebase.google.com/docs/admin/setup');
    process.exit(1);
  }

  return admin.app();
}

// Funkcja do formatowania daty i czasu dla nazwy pliku
function getTimestampString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

// Funkcja do tworzenia katalogu backups jeśli nie istnieje
async function ensureBackupDirectory() {
  const backupDir = path.join(__dirname, 'backups');
  try {
    await fs.access(backupDir);
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`📁 Utworzono katalog backups: ${backupDir}`);
  }
  return backupDir;
}

// Funkcja do pobierania wszystkich gier z Firestore
async function fetchAllGames(db) {
  console.log('📥 Pobieranie gier z Firebase Firestore...');
  
  try {
    const gamesRef = db.collection('games');
    const snapshot = await gamesRef.get();
    
    if (snapshot.empty) {
      console.log('⚠️  Kolekcja "games" jest pusta. Brak gier do backupu.');
      return [];
    }
    
    const games = [];
    snapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Pobrano ${games.length} gier.\n`);
    return games;
  } catch (error) {
    console.error('❌ Błąd podczas pobierania gier:', error.message);
    throw error;
  }
}

// Funkcja do zapisywania backupu do pliku
async function saveBackup(games, backupDir) {
  const timestamp = getTimestampString();
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);
  
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }),
      totalGames: games.length,
      version: '1.0'
    },
    games: games
  };
  
  try {
    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`💾 Backup zapisany: ${filepath}`);
    console.log(`📊 Statystyki:`);
    console.log(`   - Liczba gier: ${games.length}`);
    console.log(`   - Rozmiar pliku: ${(await fs.stat(filepath)).size} bajtów`);
    return filepath;
  } catch (error) {
    console.error('❌ Błąd podczas zapisywania backupu:', error.message);
    throw error;
  }
}

// Główna funkcja
async function main() {
  console.log('🚀 Rozpoczynam tworzenie kopii zapasowej gier z Firebase...\n');
  
  try {
    // Inicjalizacja Firebase
    const app = initializeFirebase();
    const db = app.firestore();
    
    // Utworzenie katalogu backups
    const backupDir = await ensureBackupDirectory();
    
    // Pobranie wszystkich gier
    const games = await fetchAllGames(db);
    
    if (games.length === 0) {
      console.log('ℹ️  Brak gier do backupu. Kończenie pracy.');
      process.exit(0);
    }
    
    // Zapisanie backupu
    const backupPath = await saveBackup(games, backupDir);
    
    console.log('\n✅ Backup zakończony pomyślnie!');
    console.log(`📁 Lokalizacja: ${backupPath}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Błąd podczas tworzenia backupu:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Uruchomienie skryptu
if (require.main === module) {
  main();
}

module.exports = { main, fetchAllGames, saveBackup };

