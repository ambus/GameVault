import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, User, authState, signInWithPopup, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _isAuthorized = signal<boolean | null>(null);
  private readonly _loading = signal(true);

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAuthorized = computed(() => this._isAuthorized());
  readonly loading = computed(() => this._loading());

  constructor() {
    // Subskrypcja stanu autoryzacji Firebase
    authState(this.auth).subscribe(async (user) => {
      this._user.set(user);
      if (user) {
        await this.checkAuthorization(user.uid);
      } else {
        this._isAuthorized.set(null);
      }
      this._loading.set(false);
    });
  }

  private async checkAuthorization(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      this._isAuthorized.set(userDoc.exists());
    } catch (error) {
      console.error('Error checking authorization:', error);
      this._isAuthorized.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    if (result.user) {
      await this.checkAuthorization(result.user.uid);
      if (!this._isAuthorized()) {
        // If not authorized after login, throw error to be handled by UI
        throw new Error('access-denied');
      }
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this._isAuthorized.set(null);
    this.router.navigate(['/login']);
  }
}

