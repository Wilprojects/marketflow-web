import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * ComingSoon.
 *
 * Pantalla temporal para módulos que todavía no se han desarrollado.
 *
 * Nos permite dejar el menú y las rutas listas desde ahora.
 * Más adelante reemplazaremos esta pantalla por cada módulo real.
 */
@Component({
  selector: 'app-coming-soon',
  imports: [AsyncPipe],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.css',
})
export class ComingSoon {
  
  private readonly activatedRoute = inject(ActivatedRoute);

  /**
   * Leemos los datos definidos en app.routes.ts.
   *
   * Ejemplo:
   * data: {
   *   title: 'Productos',
   *   description: 'Gestión de productos del minimarket'
   * }
   */
  readonly routeData$ = this.activatedRoute.data;
}
