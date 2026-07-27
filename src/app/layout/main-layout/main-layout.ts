import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';

/**
 * MainLayout.
 *
 * Este componente será la estructura principal del sistema
 * después de iniciar sesión.
 *
 * Contiene:
 * - Sidebar lateral
 * - Navbar superior
 * - RouterOutlet para mostrar las páginas internas
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  /**
   * Controla si el sidebar está abierto en pantallas pequeñas.
   *
   * En escritorio el sidebar siempre se ve.
   * En móvil/tablet se abre y cierra con un botón.
   */
  isMobileSidebarOpen = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}
