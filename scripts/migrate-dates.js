#!/usr/bin/env node

/**
 * Skrypt do migracji dat w Firebase Firestore (+1 dzień).
 * Naprawia problem przesunięcia stref czasowych, gdzie daty były zapisywane z ucięciem jednego dnia.
 *
 * Użycie:
 *   node scripts/migrate-dates.js
 */

const fs = require('fs').promises;
const path = require('path');
const admin = require('firebase-admin');

// Inicjalizacja Firebase Admin
function initializeFirebase() {
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
    console.log('ℹ️  Próbuję użyć Application Default Credentials...');
  }

  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp({
        projectId: 'game-vault-66ad9',
      });
    }
    console.log('✅ Firebase Admin SDK zainicjalizowany pomyślnie.\n');
  } catch (error) {
    console.error('❌ Błąd inicjalizacji Firebase Admin SDK:', error.message);
    process.exit(1);
  }

  return admin.app();
}

function addOneDay(isoDateStr) {
  if (
    !isoDateStr ||
    typeof isoDateStr !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(isoDateStr.trim())
  ) {
    return isoDateStr;
  }
  const [year, month, day] = isoDateStr.trim().split('-').map(Number);
  const nextDate = new Date(year, month - 1, day + 1);
  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDate.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

async function migrate() {
  const app = initializeFirebase();
  const db = app.firestore();

  console.log('🚀 Rozpoczynam migrację dat w Firestore...\n');

  // 1. Wishlist
  console.log('📋 Migracja kolekcji "wishlist"...');
  const wishlistSnapshot = await db.collection('wishlist').get();
  let wishlistUpdated = 0;

  for (const doc of wishlistSnapshot.docs) {
    const data = doc.data();
    if (
      data.releaseDate &&
      typeof data.releaseDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.releaseDate)
    ) {
      const oldDate = data.releaseDate;
      const newDate = addOneDay(oldDate);
      await doc.ref.update({ releaseDate: newDate });
      console.log(`  [wishlist] ${data.name || doc.id}: releaseDate ${oldDate} -> ${newDate}`);
      wishlistUpdated++;
    }
  }
  console.log(`✅ Zaktualizowano ${wishlistUpdated} pozycji z listy życzeń.\n`);

  // 2. Games
  console.log('🎮 Migracja kolekcji "games"...');
  const gamesSnapshot = await db.collection('games').get();
  let gamesUpdated = 0;
  const batch = db.batch();
  let opsInBatch = 0;

  for (const doc of gamesSnapshot.docs) {
    const data = doc.data();
    const updates = {};
    const logChanges = [];

    for (const field of ['purchaseDate', 'completionDate', 'borrowDate']) {
      if (
        data[field] &&
        typeof data[field] === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(data[field])
      ) {
        const oldVal = data[field];
        const newVal = addOneDay(oldVal);
        updates[field] = newVal;
        logChanges.push(`${field}: ${oldVal} -> ${newVal}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      opsInBatch++;
      gamesUpdated++;
      console.log(`  [game] ${data.name || doc.id}: ${logChanges.join(', ')}`);

      if (opsInBatch >= 400) {
        await batch.commit();
        opsInBatch = 0;
      }
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Zaktualizowano ${gamesUpdated} gier.`);
  console.log('🎉 Migracja dat zakończona sukcesem!');
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('❌ Błąd migracji:', err);
    process.exit(1);
  });
}

module.exports = { addOneDay, migrate };
