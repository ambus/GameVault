import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly errorMessage = signal<string | null>(null);
  readonly loading = signal(false);

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.loginWithGoogle();

      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/games';
      this.router.navigate([returnUrl]);
    } catch (error: unknown) {
      if ((error as Error).message === 'access-denied') {
        this.errorMessage.set('Brak uprawnień do korzystania z aplikacji. Skontaktuj się z administratorem.');
        // Opcjonalnie wyloguj, aby nie wisiała sesja bez uprawnień
        await this.authService.logout();
        return;
      }

      const firebaseError = error as { code?: string; message?: string };
      this.errorMessage.set(
        firebaseError.code === 'auth/popup-closed-by-user'
          ? 'Logowanie zostało przerwane'
          : firebaseError.message || 'Wystąpił błąd podczas logowania'
      );
    } finally {
      this.loading.set(false);
    }
  }
}

