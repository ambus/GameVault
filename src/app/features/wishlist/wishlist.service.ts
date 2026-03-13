import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { WishlistItem } from './wishlist.types';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'wishlist';

  async list(): Promise<WishlistItem[]> {
    const wishlistRef = collection(this.firestore, this.collectionName);
    const q = query(wishlistRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as WishlistItem);
    return items;
  }

  create(item: Omit<WishlistItem, 'id'>): Observable<string> {
    const wishlistRef = collection(this.firestore, this.collectionName);
    const cleanData = this.cleanDataForFirestore(item as Record<string, unknown>);
    return from(addDoc(wishlistRef, cleanData)).pipe(
      map((docRef) => docRef.id)
    );
  }

  update(id: string, item: Partial<Omit<WishlistItem, 'id'>>): Observable<void> {
    const itemRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const cleanData = this.cleanDataForFirestore(item as Record<string, unknown>);
    return from(updateDoc(itemRef, cleanData));
  }

  delete(id: string): Observable<void> {
    const itemRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(itemRef));
  }

  private cleanDataForFirestore(data: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
          const cleanedValue = this.cleanDataForFirestore(value as Record<string, unknown>);
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
}
