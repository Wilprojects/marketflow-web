import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CategoriesService } from '../../services/categories.service';
import { SessionService } from '../../../../core/services/session.service';
import { RoleName } from '../../../../core/models/role.model';
import { Category, CategoryFilters } from '../../models/category.model';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

/**
 * Pantalla de listado de categorías.
 *
 * Responsabilidades:
 * - consultar categorías al backend
 * - aplicar filtros
 * - manejar paginación
 * - activar/desactivar categorías
 * - mostrar acciones según rol
 */
@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly sessionService = inject(SessionService);

  /**
   * ADMIN y WAREHOUSE pueden crear, editar y cambiar estado.
   *
   * SELLER solo podrá listar/ver categorías.
   */
  readonly canManageCategories = this.sessionService.hasAnyRole([RoleName.ADMIN, RoleName.WAREHOUSE]);

  /**
   * Datos de la tabla.
   */
  categories: Category[] = [];

  /**
   * Metadata de paginación que viene del backend.
   */
  meta: PaginationMeta | null = null;

  /**
   * Estado de carga principal.
   */
  isLoading = false;

  /**
   * Categoría que se está activando/desactivando.
   *
   * Sirve para deshabilitar solo el botón de esa fila.
   */
  actionLoadingId: string | null = null;

  /**
   * Mensajes visuales.
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
  readonly filterForm = this.formBuilder.nonNullable.group({search: [''],is_active: [''],});

  /**
   * Al iniciar la pantalla, cargamos la primera página.
   */
  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Carga categorías desde el backend.
   */
  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters = this.getFilters();

    this.categoriesService
      .getCategories(filters)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.categories = response.data;
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
    this.loadCategories();
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
    this.loadCategories();
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
    this.loadCategories();
  }

  /**
   * Activa o desactiva una categoría según su estado actual.
   */
  toggleCategoryStatus(category: Category): void {
    const action = category.is_active ? 'desactivar' : 'activar';

    const confirmed = confirm(`¿Estás seguro de ${action} la categoría "${category.name}"?`,);

    if (!confirmed) {
      return;
    }

    this.actionLoadingId = category.id;
    this.errorMessage = null;
    this.successMessage = null;

    const request$ = category.is_active
      ? this.categoriesService.deactivateCategory(category.id)
      : this.categoriesService.activateCategory(category.id);

    request$
      .pipe(
        finalize(() => {
          this.actionLoadingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = `La categoría fue ${category.is_active ? 'desactivada' : 'activada'} correctamente.`;
          this.loadCategories();
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
  private getFilters(): CategoryFilters {
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
