import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  authState,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<User | null>(null);
  private readonly _isAuthorized = signal<boolean | null>(null);
  private readonly _loading = signal(true);

  private resolveAuthReady!: () => void;
  private isAuthReadyResolved = false;
  private readonly authReadyPromise: Promise<void>;

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAuthorized = computed(() => this._isAuthorized());
  readonly loading = computed(() => this._loading());

  constructor() {
    this.authReadyPromise = new Promise<void>((resolve) => {
      this.resolveAuthReady = resolve;
    });

    if (!isPlatformBrowser(this.platformId)) {
      this._loading.set(false);
      this.markAuthReady();
      return;
    }

    // Subskrypcja stanu autoryzacji Firebase
    authState(this.auth).subscribe(async (user) => {
      this._user.set(user);
      if (user) {
        const isCachedAuthorized = this.getCachedAuthorization(user.uid);
        if (isCachedAuthorized) {
          this._isAuthorized.set(true);
          this._loading.set(false);
          this.markAuthReady();
          // Weryfikacja w tle na wypadek zmiany uprawnień w Firestore
          this.checkAuthorization(user.uid, true);
        } else {
          await this.checkAuthorization(user.uid);
          this._loading.set(false);
          this.markAuthReady();
        }
      } else {
        this._isAuthorized.set(null);
        this._loading.set(false);
        this.markAuthReady();
      }
    });
  }

  private markAuthReady(): void {
    if (!this.isAuthReadyResolved) {
      this.isAuthReadyResolved = true;
      this.resolveAuthReady();
    }
  }

  async waitForAuthReady(timeoutMs = 5000): Promise<void> {
    if (!this._loading()) {
      return;
    }

    await Promise.race([
      this.authReadyPromise,
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  }

  private getCachedAuthorization(uid: string): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(`gv_auth_${uid}`) === 'true';
  }

  private async checkAuthorization(uid: string, isBackgroundCheck = false): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      const authorized = userDoc.exists();
      this._isAuthorized.set(authorized);

      if (typeof localStorage !== 'undefined') {
        if (authorized) {
          localStorage.setItem(`gv_auth_${uid}`, 'true');
        } else {
          localStorage.removeItem(`gv_auth_${uid}`);
        }
      }

      if (isBackgroundCheck && !authorized) {
        await this.logout();
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      // Jeśli to sprawdzenie w tle i mieliśmy cache, nie blokujemy przy błędzie sieci
      if (!isBackgroundCheck) {
        this._isAuthorized.set(false);
      }
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
    const currentUser = this._user();
    if (currentUser && typeof localStorage !== 'undefined') {
      localStorage.removeItem(`gv_auth_${currentUser.uid}`);
    }
    await signOut(this.auth);
    this._user.set(null);
    this._isAuthorized.set(null);
    this.router.navigate(['/login']);
  }
}
