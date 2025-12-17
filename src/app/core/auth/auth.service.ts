import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(true);

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly loading = computed(() => this._loading());

  constructor() {
    // Subskrypcja stanu autoryzacji Firebase
    authState(this.auth).subscribe((user) => {
      this._user.set(user);
      this._loading.set(false);
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }
}

