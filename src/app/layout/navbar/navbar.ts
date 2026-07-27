import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { AuthUser } from '../../core/models/auth.model';

/**
 * Navbar superior.
 *
 * Muestra:
 * - botón para abrir sidebar en móvil
 * - nombre del sistema
 * - usuario autenticado
 * - botón de cerrar sesión
 */
@Component({
  selector: 'app-navbar',
  imports: [AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);

  /**
   * Evento enviado al MainLayout para abrir/cerrar el sidebar en móvil.
   */
  @Output()
  readonly sidebarToggle = new EventEmitter<void>();

  /**
   * Usuario autenticado como observable.
   *
   * Se consume en el HTML con async pipe.
   */
  readonly currentUser$ = this.sessionService.currentUser$;

  onToggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  /**
   * Devuelve nombre completo si existe.
   * Si no, devuelve username.
   */
  getUserDisplayName(user: AuthUser): string {
    return (
      [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
    );
  }
}
