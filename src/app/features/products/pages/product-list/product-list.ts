import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { BrandsService } from '../../../brands/services/brands.service';
import { SessionService } from '../../../../core/services/session.service';
import { RoleName } from '../../../../core/models/role.model';
import { Product, ProductFilters } from '../../models/product.model';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { finalize, forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';


/**
 * Opción simple usada en selects de filtros.
 *
 * No necesitamos todo el objeto Category o Brand,
 * solo id y name para pintar el combo.
 */
interface SelectOption {
  id: string;
  name: string;
}

/**
 * Pantalla de listado de productos.
 *
 * Responsabilidades:
 * - consultar productos al backend
 * - aplicar filtros
 * - manejar paginación
 * - activar/desactivar productos
 * - mostrar acciones según rol
 * - cargar categorías y marcas para filtros
 */
@Component({
  selector: 'app-product-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {

  private readonly formBuilder = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly brandsService = inject(BrandsService);
  private readonly sessionService = inject(SessionService);

  /**
   * Administrador y Almacenero pueden crear, editar y cambiar estado.
   *
   * Vendedor solo podrá listar productos.
   */
  readonly canManageProducts = this.sessionService.hasAnyRole([RoleName.ADMIN, RoleName.WAREHOUSE]);

  /**
   * Datos de la tabla.
   */
  products: Product[] = [];

  /**
   * Opciones de filtros.
   */
  categoryOptions: SelectOption[] = [];
  brandOptions: SelectOption[] = [];

  /**
   * Metadata de paginación devuelta por el backend.
   */
  meta: PaginationMeta | null = null;

  /**
   * Estado de carga principal del listado.
   */
  isLoading = false;

  /**
   * Estado de carga de catálogos para filtros.
   */
  isLoadingOptions = false;

  /**
   * Id del producto que se está activando o desactivando.
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
   * Los booleanos se manejan como string porque vienen de selects:
   * - ''      -> todos
   * - 'true'  -> true
   * - 'false' -> false
   */
  readonly filterForm = this.formBuilder.nonNullable.group({
    search: [''],
    category_id: [''],
    brand_id: [''],
    is_active: [''],
    low_stock: [''],
  });

  /**
   * Al iniciar la pantalla:
   * - cargamos categorías/marcas para filtros
   * - cargamos productos
   */
  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadProducts();
  }

  /**
   * Carga categorías y marcas activas para usarlas como filtros.
   */
  private loadFilterOptions(): void {
    this.isLoadingOptions = true;

    forkJoin({
      categories: this.categoriesService.getCategories({
        page: 1,
        limit: 100,
        is_active: true,
      }),
      brands: this.brandsService.getBrands({
        page: 1,
        limit: 100,
        is_active: true,
      }),
    })
      .pipe(
        finalize(() => {
          this.isLoadingOptions = false;
        }),
      )
      .subscribe({
        next: ({ categories, brands }) => {
          this.categoryOptions = categories.data.map((category) => ({
            id: category.id,
            name: category.name,
          }));

          this.brandOptions = brands.data.map((brand) => ({
            id: brand.id,
            name: brand.name,
          }));
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Carga productos desde el backend.
   */
  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters = this.getFilters();

    this.productsService
      .getProducts(filters)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.products = response.data;
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
    this.loadProducts();
  }

  /**
   * Limpia filtros y recarga listado.
   */
  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      category_id: '',
      brand_id: '',
      is_active: '',
      low_stock: '',
    });

    this.currentPage = 1;
    this.loadProducts();
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
    this.loadProducts();
  }

  /**
   * Activa o desactiva un producto según su estado actual.
   */
  toggleProductStatus(product: Product): void {
    const action = product.is_active ? 'desactivar' : 'activar';

    const confirmed = confirm(`¿Estás seguro de ${action} el producto "${product.name}"?`,);

    if (!confirmed) {
      return;
    }

    this.actionLoadingId = product.id;
    this.errorMessage = null;
    this.successMessage = null;

    const request$ = product.is_active
      ? this.productsService.deactivateProduct(product.id)
      : this.productsService.activateProduct(product.id);

    request$
      .pipe(
        finalize(() => {
          this.actionLoadingId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = `El producto fue ${
            product.is_active ? 'desactivado' : 'activado'
          } correctamente.`;

          this.loadProducts();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Genera una lista corta de páginas.
   *
   * Mejora sobre Categories/Brands:
   * si hay muchas páginas, no mostramos 100 botones,
   * solo una ventana cercana a la página actual.
   */
  get pages(): number[] {
    if (!this.meta || this.meta.totalPages <= 0) {
      return [];
    }

    const totalPages = this.meta.totalPages;
    const maxVisiblePages = 5;

    const initialStart = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2),
    );

    const end = Math.min(totalPages, initialStart + maxVisiblePages - 1);
    const start = Math.max(1, end - maxVisiblePages + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  /**
   * Construye filtros para enviar al backend.
   */
  private getFilters(): ProductFilters {
    const rawFilters = this.filterForm.getRawValue();

    return {
      page: this.currentPage,
      limit: this.pageSize,
      search: rawFilters.search.trim() || undefined,
      category_id: rawFilters.category_id || undefined,
      brand_id: rawFilters.brand_id || undefined,
      is_active:
        rawFilters.is_active === ''
          ? undefined
          : rawFilters.is_active === 'true',
      low_stock:
        rawFilters.low_stock === ''
          ? undefined
          : rawFilters.low_stock === 'true',
    };
  }

}
