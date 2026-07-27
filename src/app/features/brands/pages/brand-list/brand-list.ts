import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrandsService } from '../../services/brands.service';
import { SessionService } from '../../../../core/services/session.service';
import { RoleName } from '../../../../core/models/role.model';
import { Brand, BrandFilters } from '../../models/brand.model';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';

/**
 * Pantalla de listado de marcas.
 *
 * Responsabilidades:
 * - consultar marcas al backend
 * - aplicar filtros
 * - manejar paginación
 * - activar/desactivar marcas
 * - mostrar acciones según rol
 */
@Component({
  selector: 'app-brand-list',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './brand-list.html',
  styleUrl: './brand-list.css',
})
export class BrandList {

  private readonly formBuilder = inject(FormBuilder);
  private readonly brandsService = inject(BrandsService);
  private readonly sessionService = inject(SessionService);

  /**
   * Administrador y Almacenero pueden crear, editar y cambiar estado.
   *
   * Vendedor solo podrá listar/ver marcas.
   */
  readonly canManageBrands = this.sessionService.hasAnyRole([RoleName.ADMIN,RoleName.WAREHOUSE]);

  /**
   * Datos de la tabla.
   */
  brands: Brand[] = [];

  /**
   * Metadata de paginación devuelta por el backend.
   */
  meta: PaginationMeta | null = null;

  /**
   * Estado de carga principal del listado.
   */
  isLoading = false;

  /**
   * Id de la marca que se está activando o desactivando.
   *
   * Sirve para deshabilitar solo el botón de esa fila.
   */
  actionLoadingId: string | null = null;

  /**
   * Mensajes visuales para el usuario.
   */
  errorMessage: string | null = null;
  successMessage: string | null = null;

  /**
   * Paginación actual.
   */
  currentPage = 1;
  readonly pageSize = 10;

  /**
   * Formulario de filtros.
   *
   * is_active se maneja como string porque viene de un select:
   * - ''      -> todos
   * - 'true'  -> activos
   * - 'false' -> inactivos
   */
  readonly filterForm = this.formBuilder.nonNullable.group({search: [''], is_active: [''],});

  /**
   * Al iniciar la pantalla, cargamos la primera página.
   */
  ngOnInit(): void {
    this.loadBrands();
  }

  /**
   * Carga marcas desde el backend.
   */
  loadBrands(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters = this.getFilters();

    this.brandsService
      .getBrands(filters)
      .pipe(
        /**
         * finalize se ejecuta tanto en éxito como en error.
         * Lo usamos para apagar el loading.
         */
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.brands = response.data;
          this.meta = response.meta;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Aplica filtros desde la página 1.
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadBrands();
  }

  /**
   * Limpia filtros y recarga listado.
   */
  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      is_active: '',
    });

    this.currentPage = 1;
    this.loadBrands();
  }

  /**
   * Cambia de página.
   */
  goToPage(page: number): void {
    if (!this.meta) {
      return;
    }

    if (page < 1 || page > this.meta.totalPages) {
      return;
    }

    this.currentPage = page;
    this.loadBrands();
  }

  /**
   * Activa o desactiva una marca según su estado actual.
   */
  toggleBrandStatus(brand: Brand): void {
    const action = brand.is_active ? 'desactivar' : 'activar';

    const confirmed = confirm(`¿Estás seguro de ${action} la marca "${brand.name}"?`,);

    if (!confirmed) {
      return;
    }

    this.actionLoadingId = brand.id;
    this.errorMessage = null;
    this.successMessage = null;

    const request$ = brand.is_active
      ? this.brandsService.deactivateBrand(brand.id)
      : this.brandsService.activateBrand(brand.id);

    request$
      .pipe(
        finalize(() => {
          this.actionLoadingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = `La marca fue ${
            brand.is_active ? 'desactivada' : 'activada'
          } correctamente.`;

          this.loadBrands();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Genera un arreglo de páginas para pintar botones de paginación.
   */
  get pages(): number[] {
    if (!this.meta || this.meta.totalPages <= 0) {
      return [];
    }

    return Array.from({ length: this.meta.totalPages }, (_, index) => index + 1);
  }

  /**
   * Construye filtros para enviar al backend.
   */
  private getFilters(): BrandFilters {
    const rawFilters = this.filterForm.getRawValue();

    return {
      page: this.currentPage,
      limit: this.pageSize,
      search: rawFilters.search.trim() || undefined,
      is_active:
        rawFilters.is_active === ''
          ? undefined
          : rawFilters.is_active === 'true',
    };
  }

}
