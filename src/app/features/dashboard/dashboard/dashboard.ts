import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';

/**
 * Dashboard temporal.
 *
 * Este componente se usará solo para comprobar que:
 * - el login funciona
 * - la sesión se guarda
 * - el usuario autenticado se puede leer
 * - el logout funciona
 *
 * Será reemplazado por el dashboard real.
 */
@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);

  /**
   * Observable con el usuario autenticado.
   *
   * En el HTML lo consumimos con async pipe.
   */
  readonly currentUser$ = this.sessionService.currentUser$;

  /**
   * Cierra sesión.
   */
  logout(): void {
    this.authService.logout();
  }
}
