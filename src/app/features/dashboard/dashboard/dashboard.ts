import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';

/**
 * Dashboard temporal dentro del layout principal.
 *
 * Más adelante este componente consumirá:
 * GET /reports/dashboard
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

}
