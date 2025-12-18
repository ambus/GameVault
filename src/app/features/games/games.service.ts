import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Game } from './games.types';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'games';

  async list(): Promise<Game[]> {
    const gamesRef = collection(this.firestore, this.collectionName);
    const q = query(gamesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const games = querySnapshot.docs.map((doc) => {return {id: doc.id, ...doc.data() }as Game});
    return games;
  }

  // async get(id: string): Promise<Game | null> {
  //       const gameRef = doc(this.firestore, `${this.collectionName}/${id}`);
  //   const querySnapshot = await getDoc(gameRef);

  //   const game = querySnapshot.data() as Game;
  //   return game ?? null;

  //   // const gameRef = collection(this.firestore, `${this.collectionName}/${id}`);
  //   // const q = query(gameRef);
  //   // const querySnapshot = await getDocs(q);
  //   // const game = querySnapshot.docs.map((doc) => doc.data() as Game);
  //   // return game[0] ?? null;
  // }

  create(game: Omit<Game, 'id'>): Observable<string> {
    const gamesRef = collection(this.firestore, this.collectionName);
    // Usuwamy undefined wartości i konwertujemy na plain object dla Firestore
    const cleanData = this.cleanDataForFirestore(game);
    return from(addDoc(gamesRef, cleanData)).pipe(
      map((docRef) => docRef.id)
    );
  }

  private cleanDataForFirestore(data: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Pomijamy undefined wartości (Firestore ich nie obsługuje)
      if (value !== undefined) {
        // Jeśli wartość to obiekt (ale nie null, Date, Array), rekurencyjnie czyścimy
        if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
          const cleanedValue = this.cleanDataForFirestore(value as Record<string, unknown>);
          // Dodajemy tylko jeśli obiekt nie jest pusty
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

  update(id: string, game: Partial<Omit<Game, 'id'>>): Observable<void> {
    const gameRef = doc(this.firestore, `${this.collectionName}/${id}`);
    // Usuwamy undefined wartości i konwertujemy na plain object dla Firestore
    const cleanData = this.cleanDataForFirestore(game);
    return from(updateDoc(gameRef, cleanData));
  }

  delete(id: string): Observable<void> {
    const gameRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(gameRef));
  }
}


